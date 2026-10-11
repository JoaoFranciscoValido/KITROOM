import path from 'node:path';
import { createLocalStorage } from './local.mjs';
import { createS3Storage } from './s3.mjs';

/**
 * Picks the storage driver from config.storage.driver:
 *   "local"     files under output.dir (served by the site itself)
 *   "r2"        Cloudflare R2, options in config.storage.r2 (S3 API)
 *   "s3"        any S3-compatible service, options in config.storage.s3
 * Add cloudinary/supabase drivers here.
 */
export function createStorage(config, baseDir, { driver = config.storage?.driver || 'local' } = {}) {
  if (driver === 'local') {
    return createLocalStorage({ rootDir: path.resolve(baseDir, config.output.dir), publicBase: config.storage?.local?.publicBase ?? '/' });
  }
  if (driver === 'r2' || driver === 's3') return createS3Storage(config.storage?.[driver] || {});
  throw new Error(`Storage driver "${driver}" is not implemented yet. Implement put/exists/url/list/remove in lib/storage/${driver}.mjs and register it in lib/storage/index.mjs.`);
}
