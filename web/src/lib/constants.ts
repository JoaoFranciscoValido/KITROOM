import type { Avail, Product } from '../data/types';
import type { ArtKit } from '../components/KitArt';

export const AV: Record<Avail, { label: string; dot: string }> = {
  in: { label: 'In stock', dot: '#2f9e5b' },
  low: { label: 'Low stock', dot: '#e0962a' },
  req: { label: 'On request', dot: '#8a8a86' },
};

export const SPECIAL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
export const OTHER_CHIPS = ['League badge', 'Champions badge', 'Sleeve patch', 'No sponsor'];
export const CHAMFER = 'polygon(16% 0, 100% 0, 100% 100%, 0 100%, 0 12.8%)';
export const TILE_CHAMFER = 'polygon(14% 0, 100% 0, 100% 100%, 0 100%, 0 17%)';
export const OVAL = 'ellipse(50% 50% at 50% 50%)';
export const RED = '#c4321f';
export const LIME = '#c6f24e';

const VDESC: Record<string, string> = {
  'Player version': 'Player version with a slim, athletic fit.',
  'Fan version': 'Fan version with a regular fit.',
  Kids: 'Kids kit.',
  "Women's": "Women's fit.",
  Goalkeeper: 'Goalkeeper shirt.',
  'Long sleeve': 'Long-sleeve version.',
  Retro: 'Retro reproduction.',
  'Special edition': 'Special edition.',
};

export const descOf = (p: Product) =>
  p.description || [
    p.name + '.',
    VDESC[p.variant] || '',
    'Sizes ' + p.sizes[0] + ' to ' + p.sizes[p.sizes.length - 1] + '.',
    p.type === 'Shirt' ? 'Add a name, number and badges before you send your request.' : '',
  ].filter(Boolean).join(' ');

export const kitOf = (p: Product): ArtKit => ({
  ...p.kit,
  type: p.variant === 'Long sleeve' ? 'LongShirt' : p.type,
  image: p.cover || p.images[0] || null,
});

/** Shirt names: uppercase letters, spaces, dots, apostrophes and hyphens, max 14 characters. */
export const cleanName = (v: string) => v.toUpperCase().replace(/[^A-ZÀ-ÖØ-Þ .'\-]/g, '').slice(0, 14);
/** Shirt numbers: up to two digits. */
export const cleanNum = (v: string) => v.replace(/\D/g, '').slice(0, 2);
export const appendChip = (cur: string, t: string) => (cur ? (cur.includes(t) ? cur : cur + ', ' + t) : t);

/** "Team · Season", leaving out an unknown season. */
export const teamSeason = (p: Product) => [p.team, p.season].filter(Boolean).join(' · ');
