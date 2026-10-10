// End-to-end test of the importer against a local mock of a Yupoo store (no network needed).
// It checks the importer's own logic: categories, pagination, password albums, Referer-protected images,
// duplicate photos, WebP output, re-runs without re-downloading, new photos, and removed albums.
// It does NOT prove the real Yupoo markup matches config.json selectors; the first real run does that.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const run = promisify(execFile);

const color = (r, g, b) => sharp({ create: { width: 900, height: 1100, channels: 3, background: { r, g, b } } }).jpeg().toBuffer();
const PHOTOS = {
  a1: await color(200, 20, 40), a2: await color(20, 60, 200), a3: await color(20, 160, 80),
  b1: await color(240, 200, 20), c1: await color(30, 30, 30), d1: await color(250, 250, 250), new1: await color(120, 0, 120),
};
PHOTOS.a2dup = PHOTOS.a2; // same content under another URL

// Mutable store so the test can add photos / remove albums between runs.
const store = {
  categories: [{ id: '10', name: '⚽🌍 National Teams' }, { id: '11', name: 'Retro football shirt' }],
  albums: {
    '1001': { title: 'Portugal 2026 Home Jersey S-4XL', cats: ['10'], photos: ['a1', 'a2', 'a2dup', 'a3'] },
    '1002': { title: 'Barcelona 80/81 Home Retro Jersey S-XXL', cats: ['11'], photos: ['b1'] },
    '1003': { title: 'Secret Album', cats: ['11'], photos: ['c1'], password: true },
    '1004': { title: 'Benfica 26/27 Third Kids kit Size 16-28', cats: [], photos: ['d1'] },
  },
};
let downloads = 0;
const PER_PAGE = 2;

const page = (body, title = 'Store') => `<!doctype html><html><head><title>${title}</title></head><body>
<nav>${store.categories.map(c => `<a href="/categories/${c.id}?isSubCate=false" title="${c.name}">${c.name}</a>`).join(' ')}</nav>${body}</body></html>`;
const albumList = ids => `<div class="album__list">${ids.map(id => `<a class="album__main" href="/albums/${id}?uid=1" title="${store.albums[id].title}"><div class="album__title">${store.albums[id].title}</div></a>`).join('')}</div>`;

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const n = Number(u.searchParams.get('page') || 1);
  const send = (code, body, type = 'text/html') => { res.writeHead(code, { 'content-type': type === 'text/html' ? 'text/html; charset=utf-8' : type }); res.end(body); };
  const pageOf = ids => ids.slice((n - 1) * PER_PAGE, n * PER_PAGE);
  if (u.pathname === '/albums') return send(200, page(albumList(pageOf(Object.keys(store.albums)))));
  let m;
  if ((m = u.pathname.match(/^\/categories\/(\d+)$/))) {
    return send(200, page(albumList(pageOf(Object.keys(store.albums).filter(id => store.albums[id].cats.includes(m[1]))))));
  }
  if ((m = u.pathname.match(/^\/albums\/(\d+)$/))) {
    const a = store.albums[m[1]];
    if (!a) return send(404, 'not found');
    if (a.password) return send(200, page('<div class="showalbum__password"><input type="password"></div>'));
    const photos = n === 1 ? a.photos : [];
    return send(200, page(`<h1 class="showalbumheader__gallerytitle">${a.title}</h1><div class="showalbum__children">${photos.map(p => `<div class="image__imagewrap"><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-origin-src="//${req.headers.host}/photo/${p}.jpg"></div>`).join('')}</div>`));
  }
  if ((m = u.pathname.match(/^\/photo\/(\w+)\.jpg$/))) {
    // Like Yupoo: refuse requests without a Referer from the store (hotlink protection).
    if (!(req.headers.referer || '').includes(req.headers.host)) return send(403, 'hotlink', 'text/plain');
    downloads++;
    return send(200, PHOTOS[m[1]], 'image/jpeg');
  }
  send(404, 'not found');
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const tmp = await mkdtemp(path.join(os.tmpdir(), 'kitroom-import-'));
const config = JSON.parse(await readFile(path.join(HERE, '..', 'config.json'), 'utf8'));
config.source.baseUrl = base;
config.output.dir = path.join(tmp, 'public');
config.requests.delayMs = 0;
config.requests.retries = 2;
await writeFile(path.join(tmp, 'config.json'), JSON.stringify(config));
await writeFile(path.join(tmp, 'overrides.json'), JSON.stringify({ 'yupoo-1002': { description: 'Classic Barcelona home shirt.', availability: 'in' } }));

const importer = async (...extra) => { const r = await run('node', [path.join(HERE, '..', 'import.mjs'), '--config', path.join(tmp, 'config.json'), ...extra], { maxBuffer: 1 << 24 }); if (process.env.DEBUG) console.log(r.stdout); return r; };
const catalog = async () => JSON.parse(await readFile(path.join(tmp, 'public', 'catalog.json'), 'utf8'));
const lastReport = async () => {
  const dir = path.join(tmp, 'reports');
  const f = (await readdir(dir)).filter(x => x.endsWith('.json')).sort().pop();
  return JSON.parse(await readFile(path.join(dir, f), 'utf8'));
};

try {
  // Run 1: fresh import
  await importer();
  let cat = await catalog();
  let rep = await lastReport();
  if (process.env.DEBUG) console.log(rep.errors.slice(0, 3));
  assert.equal(cat.items.length, 3, 'three importable albums');
  assert.equal(rep.totals.imported, 3);
  assert.equal(rep.skipped.length, 1, 'password album skipped');
  assert.match(rep.skipped[0].reason, /Password/);
  const pt = cat.items.find(i => i.id === 'yupoo-1001');
  assert.equal(pt.name, 'Portugal 2026 Home Jersey');
  assert.equal(pt.slug, 'portugal-2026-home-jersey');
  assert.equal(pt.category, '⚽🌍 National Teams');
  assert.equal(pt.siteCategory, 'national');
  assert.equal(pt.sourceUrl, `${base}/albums/1001?uid=1`);
  assert.equal(pt.coverImage, '/catalog/portugal-2026-home-jersey/cover.webp');
  assert.deepEqual(pt.images, [1, 2, 3].map(i => `/catalog/portugal-2026-home-jersey/image-0${i}.webp`), '4 photos, 1 duplicate -> 3 images');
  assert.deepEqual(pt.availableSizes, ['S', 'M', 'L', 'XL', 'XXL']);
  assert.equal(pt.availability, 'unknown');
  assert.ok(!JSON.stringify(cat).includes('/photo/'), 'no source image URLs in catalog.json');
  const files = await readdir(path.join(tmp, 'public', 'catalog', 'portugal-2026-home-jersey'));
  assert.deepEqual(files.sort(), ['cover.webp', 'image-01.webp', 'image-02.webp', 'image-03.webp']);
  const meta = await sharp(path.join(tmp, 'public', 'catalog', 'portugal-2026-home-jersey', 'image-01.webp')).metadata();
  assert.equal(meta.format, 'webp');
  assert.ok(meta.width <= 1200);
  const bcn = cat.items.find(i => i.id === 'yupoo-1002');
  assert.equal(bcn.description, 'Classic Barcelona home shirt.', 'override applied');
  assert.equal(bcn.availability, 'in');
  assert.equal(bcn.siteCategory, 'retro');
  assert.equal(cat.items.find(i => i.id === 'yupoo-1004').category, 'Uncategorised', 'album outside categories still imported');
  const firstDownloads = downloads;

  // Run 2: nothing changed -> nothing downloaded
  await importer();
  rep = await lastReport();
  assert.equal(downloads, firstDownloads, 'no re-downloads on an unchanged store');
  assert.equal(rep.totals.unchanged, 3);

  // Run 3: a new photo in one album, one album removed from the store
  store.albums['1002'].photos.push('new1');
  delete store.albums['1004'];
  await importer();
  cat = await catalog();
  rep = await lastReport();
  assert.equal(downloads, firstDownloads + 1, 'only the new photo is downloaded');
  assert.equal(cat.items.find(i => i.id === 'yupoo-1002').images.length, 2);
  assert.equal(cat.items.find(i => i.id === 'yupoo-1004').availability, 'unavailable', 'removed album kept but marked unavailable');
  assert.equal(rep.totals.updated, 1);
  assert.equal(rep.totals.unavailable, 1);

  // Run 4: limited run does not mark anything unavailable and dry run writes nothing
  const before = JSON.stringify(await catalog());
  await importer('--dry-run', '--limit', '1');
  assert.equal(JSON.stringify(await catalog()), before, 'dry run leaves catalog.json untouched');

  console.log('e2e: all checks passed');
  // E2E_KEEP=<dir>: keep the generated catalog.json + images (e.g. to view them in the site).
  if (process.env.E2E_KEEP) await cp(path.join(tmp, 'public'), process.env.E2E_KEEP, { recursive: true });
} finally {
  server.close();
  await rm(tmp, { recursive: true, force: true });
}
