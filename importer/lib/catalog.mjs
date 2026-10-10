import { findTeam } from './teams.mjs';

/** URL-safe slug: lower case, accents removed, non-alphanumerics collapsed to "-". */
export const slugify = s =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '') || 'product';

/** Cleans a Yupoo album title into a product name (drops size ranges, emoji and supplier noise). */
export function cleanName(title) {
  return title
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(/\s*\(?\s*(size[:：]?\s*)?(S|XS|M)\s*-\s*(XXL|2XL|3XL|4XL|XL)\s*\)?/gi, '')
    .replace(/\s*\(?\s*size[:：]?\s*\d{2}\s*-\s*\d{2}\s*\)?/gi, '')
    .replace(/\bM-U\b/g, 'Manchester United').replace(/\bLFC\b/g, 'Liverpool')
    .replace(/\s+/g, ' ').replace(/^[\s\-–·|]+|[\s\-–·|]+$/g, '').trim();
}

/** Season from titles such as "26/27", "2026/27", "2024", "80/81". */
export function parseSeason(title) {
  const full = title.match(/\b(19|20)(\d{2})\s*\/\s*(\d{2})\b/);
  if (full) return `${full[1]}${full[2]}/${full[3]}`;
  const short = title.match(/(?:^|[^\d/])(\d{2})\s*\/\s*(\d{2})(?:[^\d/]|$)/);
  if (short && (Number(short[2]) === (Number(short[1]) + 1) % 100)) {
    const y = Number(short[1]);
    return `${y > 40 ? '19' : '20'}${short[1]}/${short[2]}`;
  }
  const year = title.match(/\b(19[5-9]\d|20[0-4]\d)\b/);
  return year ? year[1] : '';
}

export function parseType(title) {
  const t = title.toLowerCase();
  if (/\bshorts?\b/.test(t)) return 'Shorts';
  if (/windbreaker|jacket|anthem|track ?top|tracksuit|hoodie|coat/.test(t)) return 'Jacket';
  if (/training|pre-?match|warm ?up/.test(t)) return 'Training';
  if (/t-?shirt|polo|casual|tee\b/.test(t)) return 'Casual';
  return 'Shirt';
}

export function parseVariant(title, yupooCategory = '') {
  const t = (title + ' ' + yupooCategory).toLowerCase();
  if (/goalkeeper|\bgk\b/.test(t)) return 'Goalkeeper';
  if (/\bkids?\b|children|youth/.test(t)) return 'Kids';
  if (/women|woman|female|ladies/.test(t)) return "Women's";
  if (/long[- ]?sleeve/.test(t)) return 'Long sleeve';
  if (/player/.test(t)) return 'Player version';
  if (/retro/.test(t)) return 'Retro';
  if (/special|anniversary|commemorative|joint|edition/.test(t)) return 'Special edition';
  return 'Fan version';
}

/** Maps a Yupoo category (and the album title) to a site category key. */
export function siteCategory(yupooCategory, title, type, variant, league, categoryMap) {
  const c = (yupooCategory || '').toLowerCase();
  if (type === 'Shorts') return 'shorts';
  if (type === 'Casual') return 'other';
  if (type === 'Training') return 'training';
  if (type === 'Jacket') return /training/.test(title.toLowerCase() + c) ? 'training' : 'tracksuits';
  if (variant === 'Retro' || /retro/.test(c) || /\bretro\b/i.test(title)) return 'retro';
  for (const [needle, key] of Object.entries(categoryMap || {})) {
    if (needle.startsWith('_')) continue;
    if (c.includes(needle)) return key === 'club' && league === 'National teams' ? 'national' : key;
  }
  return league === 'National teams' ? 'national' : 'club';
}

/**
 * Builds a catalogue item from an album. Required fields first (id, name, category, sourceUrl, coverImage, images,
 * description, availableSizes, availability), then extra fields the website uses for filters.
 */
export function buildItem({ album, slug, coverImage, images, previous, defaultSizes, categoryMap }) {
  const name = cleanName(album.title) || album.title;
  const team = findTeam(album.title) || { team: 'Other', league: 'Other leagues', country: 'International' };
  const type = parseType(album.title);
  const allCats = (album.categories?.length ? album.categories : [album.category || '']).join(' | ');
  const variant = parseVariant(album.title, allCats);
  return {
    id: album.id,
    name,
    category: album.category || 'Uncategorised',
    sourceUrl: album.url,
    coverImage,
    images,
    description: previous?.description ?? '',
    availableSizes: previous?.availableSizes?.length ? previous.availableSizes : [...defaultSizes],
    availability: previous?.availability && previous.availability !== 'unavailable' ? previous.availability : 'unknown',
    slug,
    siteCategory: siteCategory(allCats, album.title, type, variant, team.league, categoryMap),
    team: team.team,
    league: team.league,
    country: team.country,
    season: parseSeason(album.title),
    type,
    variant,
    sourceCategories: album.categories || (album.category ? [album.category] : []),
    sourceTitle: album.title,
    updatedAt: new Date().toISOString(),
  };
}

/** Applies manual edits from overrides.json (keyed by product id). */
export function applyOverrides(items, overrides) {
  return items.map(it => {
    const o = overrides[it.id];
    return o && typeof o === 'object' ? { ...it, ...o, id: it.id, slug: it.slug } : it;
  });
}

/** Unique slug for an album: keeps the slug it already had, otherwise derives one and adds -2, -3… on collisions. */
export function assignSlug(albumId, title, taken, previousSlug) {
  if (previousSlug) { taken.add(previousSlug); return previousSlug; }
  const base = slugify(cleanName(title) || title);
  let s = base, n = 2;
  while (taken.has(s)) s = `${base}-${n++}`;
  taken.add(s);
  return s;
}
