import { AwsClient } from 'aws4fetch';

/**
 * S3-compatible object storage: Cloudflare R2, Amazon S3, Supabase Storage (S3 API), MinIO…
 * Same interface as the local driver (put / exists / url / get / list / remove).
 *
 * Secrets come from the environment, never from config.json:
 *   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY  (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY also work)
 * The rest may be in config.json or the environment:
 *   endpoint   S3 API endpoint. For R2 give accountId instead: https://<accountId>.r2.cloudflarestorage.com
 *   bucket     bucket name
 *   publicBase public URL of the bucket (R2: the r2.dev URL or a custom domain); catalog.json gets publicBase + key
 */
export function createS3Storage(opts = {}, env = process.env) {
  const accountId = opts.accountId || env.R2_ACCOUNT_ID;
  const endpoint = (opts.endpoint || env.S3_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '')).replace(/\/$/, '');
  const bucket = opts.bucket || env.S3_BUCKET || env.R2_BUCKET;
  const publicBase = (opts.publicBase || env.S3_PUBLIC_BASE || env.R2_PUBLIC_BASE || '').replace(/\/?$/, '/');
  const accessKeyId = env.S3_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY;
  const missing = Object.entries({ 'endpoint (or R2 accountId)': endpoint, bucket, publicBase: publicBase !== '/', 'S3_ACCESS_KEY_ID / R2_ACCESS_KEY_ID': accessKeyId, 'S3_SECRET_ACCESS_KEY / R2_SECRET_ACCESS_KEY': secretAccessKey })
    .filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) throw new Error(`S3/R2 storage is missing: ${missing.join(', ')}. See importer/README.md.`);

  const client = new AwsClient({ accessKeyId, secretAccessKey, service: 's3', region: opts.region || env.S3_REGION || 'auto', retries: 3 });
  const cacheControl = opts.cacheControl || 'public, max-age=86400';
  const objectUrl = key => `${endpoint}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const url = key => publicBase + key;
  const call = async (method, target, init = {}) => {
    const res = await client.fetch(target, { method, ...init });
    if (!res.ok && !(method === 'HEAD' && res.status === 404) && !(method === 'DELETE' && res.status === 404)) {
      throw new Error(`${method} ${target.replace(endpoint, '')}: HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
    }
    return res;
  };

  return {
    name: 's3',
    url,
    async put(key, buffer, contentType = 'application/octet-stream') {
      await call('PUT', objectUrl(key), { body: buffer, headers: { 'content-type': contentType, 'cache-control': cacheControl } });
      return url(key);
    },
    async exists(key) {
      return (await call('HEAD', objectUrl(key))).ok;
    },
    async get(key) {
      return Buffer.from(await (await call('GET', objectUrl(key))).arrayBuffer());
    },
    async list(prefix) {
      const p = prefix.replace(/\/?$/, '/');
      const keys = [];
      let token = '';
      do {
        const q = new URLSearchParams({ 'list-type': '2', prefix: p, ...(token ? { 'continuation-token': token } : {}) });
        const xml = await (await call('GET', `${endpoint}/${bucket}?${q}`)).text();
        for (const m of xml.matchAll(/<Key>([^<]*)<\/Key>/g)) keys.push(decodeXml(m[1]));
        token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? decodeXml((xml.match(/<NextContinuationToken>([^<]*)</) || [])[1] || '') : '';
      } while (token);
      return keys;
    },
    async remove(key) {
      await call('DELETE', objectUrl(key));
    },
  };
}

const decodeXml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
