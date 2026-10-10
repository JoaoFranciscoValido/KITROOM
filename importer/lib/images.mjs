import { createHash } from 'node:crypto';
import sharp from 'sharp';

export const sha1 = buf => createHash('sha1').update(buf).digest('hex');

/** Converts any supported image to WebP, scaled down to maxWidth (never up). Throws if the data is not an image. */
export async function toWebp(buffer, { maxWidth, quality }) {
  return sharp(buffer, { failOn: 'error' })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}
