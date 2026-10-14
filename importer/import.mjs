#!/usr/bin/env node
// KITROOM catalogue importer: Yupoo albums -> self-hosted WebP images + catalog.json.
// Usage: node import.mjs [--limit N] [--category "text"] [--album <albumId>] [--skip-checked <hours>] [--dry-run] [--headed] [--config path]
import { existsSync } from 'node:fs';
import { readFile, rename, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyOverrides, assignSlug, buildItem } from './lib/catalog.mjs';
import { isSizeChart, sha1, toWebp } from './lib/images.mjs';
import { createReport, writeReport } from './lib/report.mjs';
import { createStorage } from './lib/storage/index.mjs';
import { photoIdOf, YupooClient } from './lib/yupoo.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const a = { limit: 0, category: '', album: '', skipCheckedHours: 0, dryRun: false, headed: false, config: path.join(HERE, 'config.json') };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--limit') a.limit = Number(argv[++i]) || 0;
    else if (k === '--category') a.category = String(argv[++i] || '').toLowerCase();
    else if (k === '--album') a.album = String(argv[++i] || '');
    else if (k === '--skip-checked') a.skipCheckedHours = Number(argv[++i]) || 0;
    else if (k === '--dry-run') a.dryRun = true;
    else if (k === '--headed') a.headed = true;
    else if (k === '--config') a.config = path.resolve(argv[++i]);
    else if (k === '--help' || k === '-h') { console.log('Usage: node import.mjs [--limit N] [--category "text"] [--album <albumId>] [--skip-checked <hours>] [--dry-run] [--headed] [--config path]'); process.exit(0); }
    else { console.error(`Unknown option ${k}`); process.exit(2); }
  }
  return a;
}

const readJson = async (file, fallback) => {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return fallback; }
};
const writeJsonAtomic = async (file, data) => {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  await writeFile(tmp, JSON.stringify(data, null, 2) + '\n');
  await rename(tmp, file);
};
const CHECKPOINT = 25; // albums between intermediate saves of catalog.json and state.json
const pad = n => String(n).padStart(2, '0');
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

/** Runs async tasks with a concurrency limit, preserving result order. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configDir = path.dirname(args.config);
  const config = JSON.parse(await readFile(args.config, 'utf8'));
  const outDir = path.resolve(configDir, config.output.dir);
  const catalogPath = path.join(outDir, config.output.catalogFile);
  const statePath = path.join(configDir, 'state.json');
  const overridesPath = path.join(configDir, 'overrides.json');
  const prefix = config.output.imagesPrefix;

  const previous = await readJson(catalogPath, { items: [] });
  const prevItems = Array.isArray(previous) ? previous : previous.items || [];
  const prevById = new Map(prevItems.map(it => [it.id, it]));
  const state = await readJson(statePath, { albums: {} });
  const overrides = await readJson(overridesPath, {});
  const storage = createStorage(config, configDir);
  const report = createReport({ ...args, config: path.relative(process.cwd(), args.config) });
  const fullRun = !args.limit && !args.category && !args.album;

  const client = new YupooClient(config, { headed: args.headed });
  log(`Opening ${config.source.baseUrl}${config.source.albumsPath}`);
  await client.open();
  let listingComplete = true;
  const albums = new Map(); // albumId -> { albumId, title, url, categories[] }

  try {
    // 1. Categories and their albums
    let cats = [];
    try {
      cats = await client.categories();
      log(`Found ${cats.length} categories`);
    } catch (e) {
      listingComplete = false;
      report.errors.push({ scope: 'categories', message: e.message });
    }
    // With --limit (and no --album), stop listing as soon as enough albums are known instead of crawling the whole store.
    const wanted = args.limit && !args.album ? args.limit : 0;
    const enough = () => wanted && albums.size >= wanted;
    const failedCats = new Set(); // categories whose listing failed: their albums keep the category they had
    for (const c of cats) {
      if (enough()) break;
      if (args.category && !c.name.toLowerCase().includes(args.category)) continue;
      let list = null;
      for (let attempt = 1; attempt <= 2 && !list; attempt++) {
        try {
          list = await client.albumsIn(c.url, { stopAfter: wanted && wanted - albums.size });
        } catch (e) {
          if (attempt < 2) continue;
          listingComplete = false;
          failedCats.add(c.name);
          report.errors.push({ scope: 'category', id: c.id, url: c.url, message: e.message });
          log(`  ${c.name}: ERROR ${e.message}`);
        }
      }
      if (!list) continue;
      log(`  ${c.name}: ${list.length} albums`);
      for (const a of list) {
        const cur = albums.get(a.albumId) || { ...a, categories: [] };
        if (!cur.categories.includes(c.name)) cur.categories.push(c.name);
        albums.set(a.albumId, cur);
      }
    }
    // 2. All albums (catches albums outside any category)
    if (!args.category && !enough()) {
      try {
        const all = await client.albumsIn(config.source.baseUrl + config.source.albumsPath, { stopAfter: wanted && wanted - albums.size });
        log(`All albums listing: ${all.length} albums`);
        for (const a of all) if (!albums.has(a.albumId)) albums.set(a.albumId, { ...a, categories: [] });
      } catch (e) {
        listingComplete = false;
        report.errors.push({ scope: 'albums', message: e.message });
      }
    }

    // A category that could not be listed is not evidence that its albums left it: keep it on the products that had it,
    // in their previous order, so a failed page does not strip "National Teams" from a thousand products.
    if (failedCats.size) {
      for (const a of albums.values()) {
        const had = prevById.get(`yupoo-${a.albumId}`)?.sourceCategories || [];
        if (!had.some(c => failedCats.has(c))) continue;
        a.categories = [...had.filter(c => a.categories.includes(c) || failedCats.has(c)), ...a.categories.filter(c => !had.includes(c))];
      }
    }

    let queue = [...albums.values()];
    if (args.album) queue = queue.filter(a => a.albumId === args.album);
    if (args.limit) queue = queue.slice(0, args.limit);
    log(`Processing ${queue.length} of ${albums.size} albums${args.dryRun ? ' (dry run: nothing is downloaded or written)' : ''}`);

    // Slugs already used by products we keep
    const taken = new Set();
    for (const it of prevItems) if (it.slug) taken.add(it.slug);
    const nextItems = new Map(prevItems.map(it => [it.id, it]));

    // Writes catalog.json and state.json. Also called every CHECKPOINT albums, so a long run that stops halfway
    // keeps what it imported and the next run does not download those photos again.
    const save = async () => {
      const items = applyOverrides([...nextItems.values()], overrides).sort((x, y) => x.name.localeCompare(y.name));
      await writeJsonAtomic(catalogPath, {
        generatedAt: new Date().toISOString(),
        source: { name: 'Supplier catalogue', url: config.source.baseUrl + config.source.albumsPath },
        count: items.length,
        items,
      });
      await writeJsonAtomic(statePath, state);
      return items.length;
    };

    // 3. Each album -> product
    for (const [idx, a] of queue.entries()) {
      const id = `yupoo-${a.albumId}`;
      const prev = prevById.get(id);
      const tag = `[${idx + 1}/${queue.length}] ${a.title}`;
      // --skip-checked: an album checked recently, still in the same categories, keeps its product as is (no page visit).
      const checkedAt = Date.parse(state.albums[a.albumId]?.checkedAt || '');
      if (args.skipCheckedHours && prev && Date.now() - checkedAt < args.skipCheckedHours * 3600e3 && sameSet(prev.sourceCategories, a.categories)) {
        report.unchanged.push({ id, name: prev.name, images: prev.images?.length || 0, downloaded: 0, duplicates: 0 });
        log(`${tag}: skipped (checked ${((Date.now() - checkedAt) / 3600e3).toFixed(1)} h ago)`);
        continue;
      }
      try {
        const detail = await client.readAlbum(a.url);
        if (detail.passwordProtected) {
          report.skipped.push({ id, title: a.title, url: a.url, reason: 'Password-protected album' });
          log(`${tag}: skipped (password)`);
          continue;
        }
        if (!detail.imageUrls.length) {
          report.skipped.push({ id, title: a.title, url: a.url, reason: 'No photos found in album' });
          log(`${tag}: skipped (no photos)`);
          continue;
        }
        const album = { id, title: detail.title || a.title, url: a.url, category: a.categories[0] || '', categories: a.categories, coverId: a.coverId };
        taken.delete(prev?.slug);
        const slug = assignSlug(a.albumId, album.title, taken, prev?.slug);

        if (args.dryRun) {
          report.imported.push({ id, name: album.title, images: detail.imageUrls.length });
          log(`${tag}: ${detail.imageUrls.length} photos (dry run)`);
          continue;
        }

        const res = await importImages({ client, storage, config, prefix, slug, album, imageUrls: detail.imageUrls, prevState: state.albums[a.albumId] });
        for (const err of res.errors) report.errors.push({ scope: 'image', id, url: err.url, message: err.message });
        if (!res.images.length) {
          report.skipped.push({ id, title: album.title, url: a.url, reason: 'None of the photos could be downloaded' });
          continue;
        }
        state.albums[a.albumId] = { slug, entries: res.entries, sources: res.sources, checkedAt: new Date().toISOString() };
        const item = buildItem({ album, slug, coverImage: res.cover, images: res.images, previous: prev, defaultSizes: config.defaultSizes, categoryMap: config.categoryMap });
        const changed = !prev || res.downloaded > 0 || JSON.stringify(stripVolatile(prev)) !== JSON.stringify(stripVolatile(item));
        if (!changed) item.updatedAt = prev.updatedAt;
        nextItems.set(id, item);
        const entry = { id, name: item.name, images: res.images.length, downloaded: res.downloaded, duplicates: res.duplicates };
        (!prev ? report.imported : changed ? report.updated : report.unchanged).push(entry);
        log(`${tag}: ${!prev ? 'imported' : changed ? 'updated' : 'unchanged'} (${res.images.length} photos, ${res.downloaded} downloaded, ${res.duplicates} duplicates)`);
      } catch (e) {
        report.errors.push({ scope: 'album', id, url: a.url, message: e.message });
        log(`${tag}: ERROR ${e.message}`);
      }
      if (!args.dryRun && (idx + 1) % CHECKPOINT === 0 && idx + 1 < queue.length) await save();
    }

    // 4. Products that disappeared from the source (only judged on a complete, unfiltered crawl)
    if (fullRun && listingComplete && albums.size > 0) {
      for (const [id, it] of nextItems) {
        const albumId = id.replace(/^yupoo-/, '');
        if (!albums.has(albumId) && it.availability !== 'unavailable') {
          nextItems.set(id, { ...it, availability: 'unavailable', updatedAt: new Date().toISOString() });
          report.unavailable.push({ id, name: it.name });
        }
      }
    }

    // 5. Write catalog.json
    if (!args.dryRun) {
      const count = await save();
      log(`Wrote ${path.relative(process.cwd(), catalogPath)} (${count} products)`);
    }
  } finally {
    await client.close();
    const { mdPath } = await writeReport(report, path.join(configDir, 'reports'));
    const t = report.totals;
    log(`Done: ${t.imported} imported, ${t.updated} updated, ${t.unchanged} unchanged, ${t.skipped} skipped, ${t.unavailable} unavailable, ${t.errors} errors`);
    log(`Report: ${path.relative(process.cwd(), mdPath)}`);
  }
}

const sameSet = (x = [], y = []) => x.length === y.length && x.every(v => y.includes(v));
const stripVolatile = it => { const { updatedAt, ...rest } = it; return rest; };

/**
 * Downloads (or reuses) an album's photos and stores them as cover.webp + image-NN.webp.
 * Reuse: a photo whose source URL was already stored at the same position, with the file still present, is not downloaded again.
 * Duplicates: photos with identical content (SHA-1) inside one album are stored once.
 */
async function importImages({ client, storage, config, prefix, slug, album, imageUrls, prevState }) {
  const prevEntries = prevState?.slug === slug ? prevState.entries || [] : [];
  const prevBySrc = new Map(prevEntries.map(e => [e.src, e]));
  const prevByHash = new Map(prevEntries.map(e => [e.hash, e]));
  // Every source URL seen last time (including duplicates that were not stored) -> content hash.
  const prevSources = prevState?.slug === slug ? prevState.sources || {} : {};
  const errors = [];
  let downloaded = 0;

  // Fetch what is needed, keeping source order.
  const fetched = await mapLimit(imageUrls, config.requests.imageConcurrency, async src => {
    const p = prevBySrc.get(src);
    if (p && (await storage.exists(p.key))) return { src, hash: p.hash, reuseKey: p.key, chart: !!p.chart };
    const known = prevSources[src] && prevByHash.get(prevSources[src]);
    if (known && (await storage.exists(known.key))) return { src, hash: known.hash, reuseKey: known.key, chart: !!known.chart };
    try {
      const buf = await client.download(src, album.url);
      downloaded++;
      return { src, hash: sha1(buf), buf, chart: await isSizeChart(buf).catch(() => false) };
    } catch (e) {
      errors.push({ url: src, message: e.message });
      return null;
    }
  });

  // Order: the supplier's album cover first (usually the whole shirt), then the other product photos, then size charts,
  // so neither the site's cover nor the first gallery photo is a close-up or a table.
  const isAlbumCover = f => !!album.coverId && photoIdOf(f.src) === album.coverId;
  const live = fetched.filter(Boolean);
  const ordered = [
    ...live.filter(f => !f.chart && isAlbumCover(f)),
    ...live.filter(f => !f.chart && !isAlbumCover(f)),
    ...live.filter(f => f.chart),
  ];

  // Positions: identical photos are stored once.
  const seen = new Set();
  const slots = [];
  let duplicates = 0;
  for (const f of ordered) {
    if (seen.has(f.hash)) { duplicates++; continue; }
    seen.add(f.hash);
    slots.push({ f, key: `${prefix}/${slug}/image-${pad(slots.length + 1)}.webp` });
  }
  // A stored photo that moves to another position is read before anything is overwritten, so it is not downloaded again.
  if (storage.get) {
    for (const s of slots) if (s.f.reuseKey && s.f.reuseKey !== s.key) s.stored = await storage.get(s.f.reuseKey).catch(() => null);
  }

  const entries = [];
  const images = [];
  let coverSource = null;
  for (const { f, key, stored } of slots) {
    try {
      let original = null;
      if (f.reuseKey === key) {
        images.push(storage.url(key));
      } else if (stored) {
        images.push(await storage.put(key, stored, 'image/webp'));
      } else {
        // New photo, or a moved one the storage cannot read back: encode from the original.
        original = f.buf || (downloaded++, await client.download(f.src, album.url));
        const webp = await toWebp(original, { maxWidth: config.images.maxWidth, quality: config.images.quality });
        images.push(await storage.put(key, webp, 'image/webp'));
      }
      if (entries.length === 0) coverSource = original || stored || null;
      entries.push({ src: f.src, hash: f.hash, key, ...(f.chart ? { chart: true } : {}) });
    } catch (e) {
      seen.delete(f.hash);
      errors.push({ url: f.src, message: `Could not convert: ${e.message}` });
    }
  }

  // Cover: a smaller copy of the first photo, regenerated when the first photo changed or the cover is missing.
  const coverKey = `${prefix}/${slug}/cover.webp`;
  let cover = storage.url(coverKey);
  if (entries.length) {
    const firstChanged = prevEntries[0]?.hash !== entries[0].hash;
    if (coverSource || firstChanged || !(await storage.exists(coverKey))) {
      try {
        const src = coverSource
          || (storage.get && (await storage.get(entries[0].key).catch(() => null)))
          || (downloaded++, await client.download(entries[0].src, album.url));
        cover = await storage.put(coverKey, await toWebp(src, { maxWidth: config.images.coverWidth, quality: config.images.quality }), 'image/webp');
      } catch (e) {
        errors.push({ url: entries[0].src, message: `Cover: ${e.message}` });
        cover = images[0];
      }
    }
  }

  // Remove photos left over from a previous, longer gallery.
  if (storage.list) {
    const keep = new Set([coverKey, ...entries.map(e => e.key)]);
    for (const k of await storage.list(`${prefix}/${slug}`)) if (!keep.has(k)) await storage.remove(k);
  }

  const sources = Object.fromEntries(fetched.filter(f => f && seen.has(f.hash)).map(f => [f.src, f.hash]));
  return { cover, images, entries, sources, downloaded, duplicates, errors };
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
