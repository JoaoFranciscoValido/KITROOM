import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Local filesystem storage (development). Every storage driver exposes the same interface:
 *   put(key, buffer, contentType) -> public URL
 *   exists(key) -> boolean
 *   url(key) -> public URL
 *   list(prefix) -> keys, remove(key)  (optional cleanup)
 *   get(key) -> Buffer             (optional; lets a re-import reorder stored photos without downloading them again)
 * A Cloudinary / Supabase / S3 driver only has to implement these; the catalogue keeps whatever URL put() returns.
 */
export function createLocalStorage({ rootDir, publicBase = '/' }) {
  const abs = key => path.join(rootDir, ...key.split('/'));
  const url = key => publicBase.replace(/\/?$/, '/') + key;
  return {
    name: 'local',
    url,
    async put(key, buffer) {
      const file = abs(key);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, buffer);
      return url(key);
    },
    async exists(key) {
      try { return (await stat(abs(key))).isFile(); } catch { return false; }
    },
    async list(prefix) {
      try { return (await readdir(abs(prefix))).map(f => prefix.replace(/\/?$/, '/') + f); } catch { return []; }
    },
    async get(key) {
      return readFile(abs(key));
    },
    async remove(key) {
      await rm(abs(key), { force: true });
    },
  };
}
