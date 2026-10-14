#!/usr/bin/env node
// Copies the photos the importer stored locally (web/public/catalog/…) to another storage driver (R2, S3)
// and rewrites the photo URLs in catalog.json to point at it. Safe to re-run: photos already there are skipped.
// Usage: node migrate-storage.mjs --to r2 [--dry-run] [--force] [--config path]
import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage } from './lib/storage/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = { to: '', dryRun: false, force: false, config: path.join(HERE, 'config.json') };
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i];
  if (k === '--to') args.to = process.argv[++i];
  else if (k === '--dry-run') args.dryRun = true;
  else if (k === '--force') args.force = true;
  else if (k === '--config') args.config = path.resolve(process.argv[++i]);
  else { console.error('Usage: node migrate-storage.mjs --to r2|s3 [--dry-run] [--force] [--config path]'); process.exit(2); }
}

const configDir = path.dirname(args.config);
const config = JSON.parse(await readFile(args.config, 'utf8'));
const to = args.to || config.storage?.driver;
if (!to || to === 'local') { console.error('Choose the target with --to r2 (or s3).'); process.exit(2); }

const outDir = path.resolve(configDir, config.output.dir);
const prefix = config.output.imagesPrefix;
const local = createStorage(config, configDir, { driver: 'local' });
const target = createStorage(config, configDir, { driver: to });
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

// Every stored photo key, e.g. catalog/portugal-2026-home/image-01.webp
const files = await readdir(path.join(outDir, prefix), { recursive: true, withFileTypes: true }).catch(() => []);
const keys = files.filter(f => f.isFile() && f.name.endsWith('.webp'))
  .map(f => path.relative(outDir, path.join(f.parentPath ?? f.path, f.name)).split(path.sep).join('/')).sort();
log(`${keys.length} local photos -> ${to}${args.dryRun ? ' (dry run)' : ''}`);

let uploaded = 0, skipped = 0, done = 0;
const failed = [];
let next = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next < keys.length) {
    const key = keys[next++];
    try {
      if (!args.force && (await target.exists(key))) skipped++;
      else {
        if (!args.dryRun) await target.put(key, await local.get(key), 'image/webp');
        uploaded++;
      }
    } catch (e) {
      failed.push({ key, message: e.message });
    }
    if (++done % 500 === 0) log(`  ${done}/${keys.length}`);
  }
}));
log(`Photos: ${uploaded} uploaded, ${skipped} already there, ${failed.length} failed`);
for (const f of failed.slice(0, 20)) log(`  FAILED ${f.key}: ${f.message}`);

// catalog.json: local URLs -> target URLs (only when every photo made it, so the site never points at a missing one)
const catalogPath = path.join(outDir, config.output.catalogFile);
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const localBase = local.url('');
const move = u => (typeof u === 'string' && u.startsWith(localBase + prefix + '/') ? target.url(u.slice(localBase.length)) : u);
let changed = 0;
for (const it of catalog.items || []) {
  const before = JSON.stringify([it.coverImage, it.images]);
  it.coverImage = move(it.coverImage);
  it.images = (it.images || []).map(move);
  if (JSON.stringify([it.coverImage, it.images]) !== before) changed++;
}
if (failed.length) {
  log('catalog.json not changed because some photos failed; run again to retry them.');
  process.exit(1);
}
if (args.dryRun) {
  log(`Dry run: catalog.json would point ${changed} products at ${target.url('')}`);
} else {
  await writeFile(catalogPath + '.tmp', JSON.stringify(catalog, null, 2) + '\n');
  await rename(catalogPath + '.tmp', catalogPath);
  log(`catalog.json: ${changed} products now use ${target.url('')}`);
  log(`Next: set "storage": { "driver": "${to}" } in config.json so new imports go straight to ${to}.`);
}
