import path from 'node:path';
import { createLocalStorage } from './local.mjs';

/** Picks the storage driver from config.storage.driver. Add cloudinary/supabase/s3 drivers here. */
export function createStorage(config, baseDir) {
  const driver = config.storage?.driver || 'local';
  if (driver === 'local') {
    return createLocalStorage({ rootDir: path.resolve(baseDir, config.output.dir), publicBase: config.storage.local?.publicBase ?? '/' });
  }
  throw new Error(`Storage driver "${driver}" is not implemented yet. Implement put/exists/url/list/remove in lib/storage/${driver}.mjs and register it in lib/storage/index.mjs.`);
}
