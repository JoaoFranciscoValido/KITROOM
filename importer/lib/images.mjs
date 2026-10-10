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

/**
 * Guesses whether an image is a size chart (a table on a white page) rather than a product photo:
 * mostly near-white, almost no colour, and many sharp edges from text and table lines.
 * A product shot on a white background is mostly white too, but its edges are soft and few.
 */
export async function isSizeChart(buffer) {
  const { data, info } = await sharp(buffer, { failOn: 'error' }).rotate().resize(200, 200, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const grey = new Float32Array(n);
  let white = 0, sat = 0, edges = 0;
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    grey[i] = (r + g + b) / 3;
    if (min > 225) white++;
    sat += max - min;
  }
  for (let y = 0; y < info.height; y++) {
    for (let x = 1; x < info.width; x++) if (Math.abs(grey[y * info.width + x] - grey[y * info.width + x - 1]) > 60) edges++;
  }
  return white / n >= 0.5 && sat / n < 20 && edges / n >= 0.03;
}
