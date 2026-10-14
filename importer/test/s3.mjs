// Tests the S3/R2 storage driver and migrate-storage.mjs against a local mock of the S3 API (no network needed).
// It checks signed requests, put/exists/get/list (with pagination)/remove, and that a migration uploads every
// local photo once and points catalog.json at the bucket's public URL.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createS3Storage } from '../lib/storage/s3.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const run = promisify(execFile);

// Minimal S3: objects in memory, list-type=2 with 2 keys per page, every request must be SigV4-signed.
const objects = new Map();
let puts = 0;
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const [, bucket, ...rest] = u.pathname.split('/');
  const key = rest.map(decodeURIComponent).join('/');
  if (!/^AWS4-HMAC-SHA256 Credential=test-key\//.test(req.headers.authorization || '') || bucket !== 'photos') {
    res.writeHead(403); return res.end('denied');
  }
  const body = await new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c))); });
  if (req.method === 'PUT') { puts++; objects.set(key, { body, type: req.headers['content-type'], cache: req.headers['cache-control'] }); res.writeHead(200); return res.end(); }
  if (req.method === 'HEAD' || req.method === 'GET' && key) {
    const o = objects.get(key);
    if (!o) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': o.type }); return res.end(req.method === 'GET' ? o.body : undefined);
  }
  if (req.method === 'DELETE') { objects.delete(key); res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && u.searchParams.get('list-type') === '2') {
    const all = [...objects.keys()].filter(k => k.startsWith(u.searchParams.get('prefix') || '')).sort();
    const start = Number(u.searchParams.get('continuation-token') || 0);
    const page = all.slice(start, start + 2);
    const more = start + 2 < all.length;
    res.writeHead(200, { 'content-type': 'application/xml' });
    return res.end(`<ListBucketResult>${page.map(k => `<Contents><Key>${k.replace(/&/g, '&amp;')}</Key></Contents>`).join('')}<IsTruncated>${more}</IsTruncated>${more ? `<NextContinuationToken>${start + 2}</NextContinuationToken>` : ''}</ListBucketResult>`);
  }
  res.writeHead(400); res.end();
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const endpoint = `http://127.0.0.1:${server.address().port}`;
const env = { S3_ACCESS_KEY_ID: 'test-key', S3_SECRET_ACCESS_KEY: 'test-secret' };
const tmp = await mkdtemp(path.join(os.tmpdir(), 'kitroom-s3-'));

try {
  // Driver
  assert.throws(() => createS3Storage({ endpoint, bucket: 'photos', publicBase: 'https://cdn.test/' }, {}), /S3_ACCESS_KEY_ID/, 'credentials come from the environment');
  const s3 = createS3Storage({ endpoint, bucket: 'photos', publicBase: 'https://cdn.test' }, env);
  assert.equal(await s3.put('catalog/a & b/image-01.webp', Buffer.from('one'), 'image/webp'), 'https://cdn.test/catalog/a & b/image-01.webp');
  assert.equal(objects.get('catalog/a & b/image-01.webp').cache, 'public, max-age=86400');
  for (const n of [2, 3]) await s3.put(`catalog/a & b/image-0${n}.webp`, Buffer.from(String(n)), 'image/webp');
  assert.equal(await s3.exists('catalog/a & b/image-01.webp'), true);
  assert.equal(await s3.exists('catalog/missing.webp'), false);
  assert.equal((await s3.get('catalog/a & b/image-02.webp')).toString(), '2');
  assert.deepEqual(await s3.list('catalog/a & b'), [1, 2, 3].map(n => `catalog/a & b/image-0${n}.webp`), 'list follows pagination');
  await s3.remove('catalog/a & b/image-03.webp');
  assert.equal(await s3.exists('catalog/a & b/image-03.webp'), false);
  objects.clear();

  // Migration: two local products -> bucket, catalog.json rewritten
  const pub = path.join(tmp, 'public');
  const photos = { 'catalog/spain-home/cover.webp': 'c1', 'catalog/spain-home/image-01.webp': 'i1', 'catalog/spain-home/image-02.webp': 'i2', 'catalog/brazil-away/cover.webp': 'c2', 'catalog/brazil-away/image-01.webp': 'j1' };
  for (const [k, v] of Object.entries(photos)) { await mkdir(path.dirname(path.join(pub, k)), { recursive: true }); await writeFile(path.join(pub, k), v); }
  const item = slug => ({ id: slug, name: slug, coverImage: `/catalog/${slug}/cover.webp`, images: Object.keys(photos).filter(k => k.includes(slug) && !k.endsWith('cover.webp')).map(k => '/' + k) });
  await writeFile(path.join(pub, 'catalog.json'), JSON.stringify({ count: 2, items: [item('spain-home'), item('brazil-away')] }));
  const config = JSON.parse(await readFile(path.join(HERE, '..', 'config.json'), 'utf8'));
  config.output.dir = pub;
  config.storage = { driver: 'local', local: { publicBase: '/' }, r2: { endpoint, bucket: 'photos', publicBase: 'https://photos.kitroom.test/' } };
  await writeFile(path.join(tmp, 'config.json'), JSON.stringify(config));
  const migrate = (...a) => run('node', [path.join(HERE, '..', 'migrate-storage.mjs'), '--config', path.join(tmp, 'config.json'), '--to', 'r2', ...a], { env: { ...process.env, ...env, R2_ACCESS_KEY_ID: '', R2_SECRET_ACCESS_KEY: '' } });

  await migrate('--dry-run');
  assert.equal(objects.size, 0, 'dry run uploads nothing');
  assert.match(await readFile(path.join(pub, 'catalog.json'), 'utf8'), /"\/catalog\/spain-home\/cover.webp"/, 'dry run leaves catalog.json alone');

  await migrate();
  assert.deepEqual([...objects.keys()].sort(), Object.keys(photos).sort(), 'every local photo uploaded');
  assert.equal(objects.get('catalog/spain-home/image-02.webp').body.toString(), 'i2');
  assert.equal(objects.get('catalog/spain-home/image-02.webp').type, 'image/webp');
  const cat = JSON.parse(await readFile(path.join(pub, 'catalog.json'), 'utf8'));
  assert.equal(cat.items[0].coverImage, 'https://photos.kitroom.test/catalog/spain-home/cover.webp');
  assert.deepEqual(cat.items[0].images, ['https://photos.kitroom.test/catalog/spain-home/image-01.webp', 'https://photos.kitroom.test/catalog/spain-home/image-02.webp']);

  const before = puts;
  await migrate();
  assert.equal(puts, before, 're-running uploads nothing new');

  console.log('s3: all checks passed');
} finally {
  server.close();
  await rm(tmp, { recursive: true, force: true });
}
