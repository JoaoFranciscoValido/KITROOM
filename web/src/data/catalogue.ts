/* Catalogue data — kept separate from the website interface.
   Album names, categories and size ranges come from the supplier's public album listing (retrieved 10 Oct 2026).
   Photos: put self-hosted photo URLs in a product's `images` (the first one is the cover). Without photos the site
   draws a colour illustration of the kit from `kit`. No prices are shown anywhere on the site. */
import type { Category, Kit, League, Product, ProductType, Variant, Avail } from './types';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']; // all products offered in S–XXL
const clean = (a: string) => a.replace(/\s*(Size[:：]?\s*)?(S-(XXL|3XL|4XL)|16-28)\)?\s*$/i, '').replace(/\bM-U\b/g, 'Manchester United').replace(/\bLFC\b/g, 'Liverpool').replace(/\s+/g, ' ').trim();
export const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const K = (p: Kit['p'], c: string[], trim: string, ink?: string): Kit => ({ p, c, trim, ink: ink || trim });

interface ProductInput {
  team: string; league: string; country: string; season: string; cat: string; kit: Kit; src: string;
  name?: string; variant?: Variant; type?: ProductType; av?: Avail; photos?: number; images?: string[];
}
const P = (album: string, o: ProductInput): Product => ({
  variant: 'Fan version', type: 'Shirt', av: 'in', images: [], ...o,
  id: slug(album), album, name: o.name || clean(album), sizes: SIZES
});

// Shorthands for team / league / country
const T = {
  spain: { team: 'Spain', league: 'National teams', country: 'Spain' },
  arg: { team: 'Argentina', league: 'National teams', country: 'Argentina' },
  bra: { team: 'Brazil', league: 'National teams', country: 'Brazil' },
  por: { team: 'Portugal', league: 'National teams', country: 'Portugal' },
  ger: { team: 'Germany', league: 'National teams', country: 'Germany' },
  eng: { team: 'England', league: 'National teams', country: 'England' },
  fra: { team: 'France', league: 'National teams', country: 'France' },
  hun: { team: 'Hungary', league: 'National teams', country: 'Hungary' },
  wal: { team: 'Wales', league: 'National teams', country: 'Wales' },
  scp: { team: 'Sporting CP', league: 'Liga Portugal', country: 'Portugal' },
  fcp: { team: 'FC Porto', league: 'Liga Portugal', country: 'Portugal' },
  slb: { team: 'SL Benfica', league: 'Liga Portugal', country: 'Portugal' },
  vsc: { team: 'Vitória SC', league: 'Liga Portugal', country: 'Portugal' },
  rma: { team: 'Real Madrid', league: 'La Liga', country: 'Spain' },
  fcb: { team: 'FC Barcelona', league: 'La Liga', country: 'Spain' },
  atm: { team: 'Atlético Madrid', league: 'La Liga', country: 'Spain' },
  bet: { team: 'Real Betis', league: 'La Liga', country: 'Spain' },
  gra: { team: 'Granada', league: 'La Liga', country: 'Spain' },
  elc: { team: 'Elche', league: 'La Liga', country: 'Spain' },
  sev: { team: 'Sevilla', league: 'La Liga', country: 'Spain' },
  cel: { team: 'Celta de Vigo', league: 'La Liga', country: 'Spain' },
  mci: { team: 'Manchester City', league: 'Premier League', country: 'England' },
  mun: { team: 'Manchester United', league: 'Premier League', country: 'England' },
  liv: { team: 'Liverpool', league: 'Premier League', country: 'England' },
  ars: { team: 'Arsenal', league: 'Premier League', country: 'England' },
  mid: { team: 'Middlesbrough', league: 'Premier League', country: 'England' },
  wat: { team: 'Watford', league: 'Other leagues', country: 'England' },
  nap: { team: 'Napoli', league: 'Serie A', country: 'Italy' },
  bay: { team: 'Bayern Munich', league: 'Bundesliga', country: 'Germany' },
  koe: { team: 'FC Köln', league: 'Bundesliga', country: 'Germany' },
  psg: { team: 'Paris Saint-Germain', league: 'Ligue 1', country: 'France' },
  om: { team: 'Olympique de Marseille', league: 'Ligue 1', country: 'France' },
  lil: { team: 'Lille', league: 'Ligue 1', country: 'France' },
  len: { team: 'RC Lens', league: 'Ligue 1', country: 'France' },
  fla: { team: 'Flamengo', league: 'Brasileiro Série A', country: 'Brazil' },
  vas: { team: 'Vasco da Gama', league: 'Brasileiro Série A', country: 'Brazil' },
  int: { team: 'Internacional', league: 'Brasileiro Série A', country: 'Brazil' },
  cru: { team: 'Cruzeiro', league: 'Brasileiro Série A', country: 'Brazil' },
  bah: { team: 'Bahia', league: 'Brasileiro Série A', country: 'Brazil' },
  pal: { team: 'Palmeiras', league: 'Brasileiro Série A', country: 'Brazil' },
  tra: { team: 'Trabzonspor', league: 'Other leagues', country: 'Turkey' },
  bod: { team: 'Bodø/Glimt', league: 'Other leagues', country: 'Norway' },
  nac: { team: 'Nacional', league: 'Other leagues', country: 'Uruguay' },
  aja: { team: 'Ajax', league: 'Other leagues', country: 'Netherlands' },
  col: { team: 'Colo-Colo', league: 'Other leagues', country: 'Chile' },
  clt: { team: 'Celtic', league: 'Other leagues', country: 'Scotland' },
  nts: { team: 'Originals x NTS Radio', league: 'Other leagues', country: 'International' }
};

export const products: Product[] = [
  // ⚽🌍 National Teams / 2026 FIFA World Cup
  P('Spain 2026 2 Stars Special Edition Jersey - Blue S-4XL', { ...T.spain, season: '2026', cat: 'national', variant: 'Special edition', photos: 8, src: '2026 FIFA World Cup', kit: K('solid', ['#1d3d8f'], '#e8c547') }),
  P('Spain 2026 Special Edition 2-Star - Red Jersey S-4XL', { ...T.spain, season: '2026', cat: 'national', variant: 'Special edition', photos: 2, src: '2026 FIFA World Cup', kit: K('solid', ['#c4122f'], '#e8c547') }),
  P('Spain 2026 Special Edition 2-Star - Black Jersey S-4XL', { ...T.spain, season: '2026', cat: 'national', variant: 'Special edition', photos: 2, src: '2026 FIFA World Cup', kit: K('solid', ['#151515'], '#c4122f', '#e8c547') }),
  P('Spain 26/27 Home Champions Commemorative Edition Jersey S-4XL', { ...T.spain, season: '2026/27', cat: 'national', variant: 'Special edition', photos: 2, src: '⚽🌍 National Teams', kit: K('solid', ['#c4122f'], '#e8c547') }),
  P('2024 player Spain Home S-3XL', { ...T.spain, name: 'Spain 2024 Home Jersey', season: '2024', cat: 'national', variant: 'Player version', photos: 11, src: '⚽💪🏻Player Version', kit: K('solid', ['#c4122f'], '#e8c547') }),
  P('Argentina 2026 Anniversary Edition Jersey S-4XL', { ...T.arg, season: '2026', cat: 'national', variant: 'Special edition', photos: 8, src: '2026 FIFA World Cup', kit: K('stripes', ['#7fb4e3', '#ffffff'], '#111111') }),
  P('Argentina 2026 (With Number And Name) Special Player Version Jersey S-XXL', { ...T.arg, name: 'Argentina 2026 Special Player Version Jersey', season: '2026', cat: 'national', variant: 'Player version', photos: 2, src: '⚽💪🏻Player Version', kit: K('stripes', ['#7fb4e3', '#ffffff'], '#111111') }),
  P('2024 Hungary Home S-XXL', { ...T.hun, name: 'Hungary 2024 Home Jersey', season: '2024', cat: 'national', photos: 8, src: '⚽🌍 National Teams', kit: K('solid', ['#c8102e'], '#2e7d4f', '#ffffff') }),
  P('2024 Wales Home S-XXL', { ...T.wal, name: 'Wales 2024 Home Jersey', season: '2024', cat: 'national', photos: 7, src: '⚽🌍 National Teams', kit: K('solid', ['#c8102e'], '#ffffff') }),
  P('2024 Goalkeeper Portugal Yellow S-XXL', { ...T.por, name: 'Portugal 2024 Goalkeeper Jersey - Yellow', season: '2024', cat: 'national', variant: 'Goalkeeper', photos: 9, src: '⚽🧤Goalkeeper kit', kit: K('solid', ['#f2d21b'], '#111111') }),
  P('2024 Goalkeeper France Yellow S-XXL', { ...T.fra, name: 'France 2024 Goalkeeper Jersey - Yellow', season: '2024', cat: 'national', variant: 'Goalkeeper', photos: 9, src: '⚽🧤Goalkeeper kit', kit: K('solid', ['#e9d23a'], '#1b2a5c') }),

  // Club shirts — league categories, new season, Player Version, Long sleeve, Kids, Women's, Goalkeeper
  P('Sporting CP 26/27 Home Player Version Jersey S-XXL', { ...T.scp, season: '2026/27', cat: 'club', variant: 'Player version', photos: 2, src: '⚽💪🏻Player Version', kit: K('hoops', ['#00794c', '#ffffff'], '#111111') }),
  P('Porto 26/27 Away Player Version Jersey S-3XL', { ...T.fcp, name: 'FC Porto 26/27 Away Player Version Jersey', season: '2026/27', cat: 'club', variant: 'Player version', photos: 2, src: '⚽💪🏻Player Version', kit: K('solid', ['#1b1b1f'], '#e7b416') }),
  P('Porto 26/27 Third Away Player Version Jersey S-XXL', { ...T.fcp, name: 'FC Porto 26/27 Third Player Version Jersey', season: '2026/27', cat: 'club', variant: 'Player version', photos: 2, src: '⚽💪🏻Player Version', kit: K('solid', ['#e8e2d4'], '#0a3f8f') }),
  P('Benfica 26/27 Third Away Player Version Jersey S-XXL S-XXL', { ...T.slb, name: 'SL Benfica 26/27 Third Player Version Jersey', season: '2026/27', cat: 'club', variant: 'Player version', photos: 2, src: '⚽💪🏻Player Version', kit: K('solid', ['#1a1a1a'], '#d9112a', '#ffffff') }),
  P('Vitória SC 26/27 Home Jersey S-4XL', { ...T.vsc, season: '2026/27', cat: 'club', photos: 2, src: 'new season', kit: K('solid', ['#f6f5f0'], '#111111') }),
  P('Bayern Munich 26/27 Third Player Version Jersey S-4XL', { ...T.bay, season: '2026/27', cat: 'club', variant: 'Player version', photos: 2, src: '⚽💪🏻Player Version', kit: K('solid', ['#f0ede4'], '#d6062b') }),
  P('FC Köln 26/27 Away Jersey S-4XL', { ...T.koe, season: '2026/27', cat: 'club', photos: 2, src: 'new season', kit: K('solid', ['#c8102e'], '#ffffff') }),
  P('Real Betis 26/27 Home Jersey S-4XL', { ...T.bet, season: '2026/27', cat: 'club', photos: 2, src: 'La Liga', kit: K('stripes', ['#0a8f4a', '#ffffff'], '#0a8f4a', '#111111') }),
  P('Granada 26/27 Away Jersey S-4XL', { ...T.gra, season: '2026/27', cat: 'club', photos: 2, src: 'La Liga', kit: K('solid', ['#1b2a5c'], '#c8102e', '#ffffff') }),
  P('Elche 26/27 Home Jersey S-4XL', { ...T.elc, season: '2026/27', cat: 'club', photos: 2, src: 'La Liga', kit: K('yoke', ['#f6f5f0', '#0a8f4a'], '#0a8f4a') }),
  P('24/25 Barcelona joint edition S-XXL', { ...T.fcb, name: 'FC Barcelona 24/25 Joint Edition Jersey', season: '2024/25', cat: 'club', variant: 'Special edition', photos: 15, src: 'new season', kit: K('stripes', ['#a50a3f', '#1b3d92'], '#f2c21b') }),
  P('24/25 Arsenal joint edition S-XXL', { ...T.ars, name: 'Arsenal 24/25 Joint Edition Jersey', season: '2024/25', cat: 'club', variant: 'Special edition', photos: 10, src: 'new season', kit: K('sleeves', ['#db0007', '#ffffff'], '#ffffff') }),
  P('25/26 PSG Special Edition S-XXL', { ...T.psg, name: 'PSG 25/26 Special Edition Jersey', season: '2025/26', cat: 'club', variant: 'Special edition', photos: 9, src: 'Ligue 1', kit: K('solid', ['#13234f'], '#d6062b', '#ffffff') }),
  P('24/25 Marseille Special Edition White S-4xL', { ...T.om, name: 'Marseille 24/25 Special Edition Jersey - White', season: '2024/25', cat: 'club', variant: 'Special edition', photos: 8, src: 'Ligue 1', kit: K('solid', ['#f6f5f0'], '#3fa9dc') }),
  P('25/26 Lille Home S-4XL', { ...T.lil, name: 'Lille 25/26 Home Jersey', season: '2025/26', cat: 'club', photos: 9, src: 'Ligue 1', kit: K('solid', ['#c8102e'], '#1b2a5c', '#ffffff') }),
  P('Flamengo 26/27 Special Edition Black S-4XL', { ...T.fla, season: '2026/27', cat: 'club', variant: 'Special edition', photos: 2, src: 'Brasileiro Série A', kit: K('solid', ['#121212'], '#c8102e', '#ffffff') }),
  P('Vasco da Gama 26/27 Special Edition S-4XL', { ...T.vas, season: '2026/27', cat: 'club', variant: 'Special edition', photos: 7, src: 'Brasileiro Série A', kit: K('sash', ['#121212', '#f6f5f0'], '#f6f5f0') }),
  P('Internacional 26/27 Red Jersey S-4XL', { ...T.int, season: '2026/27', cat: 'club', photos: 2, src: 'Brasileiro Série A', kit: K('solid', ['#c8102e'], '#ffffff') }),
  P('Cruzeiro 26/27 Third away Jersey S-4XL', { ...T.cru, name: 'Cruzeiro 26/27 Third Away Jersey', season: '2026/27', cat: 'club', photos: 2, src: 'Brasileiro Série A', kit: K('solid', ['#f6f5f0'], '#1d3d8f') }),
  P('Trabzonspor 26/27 Special Edition Jersey S-XXL', { ...T.tra, season: '2026/27', cat: 'club', variant: 'Special edition', photos: 7, src: 'Worldwide Other League', kit: K('stripes', ['#7a1f3d', '#5aa6dc'], '#ffffff') }),
  P('BodøGlimt 25/26 Home Jersey S-XXL', { ...T.bod, name: 'Bodø/Glimt 25/26 Home Jersey', season: '2025/26', cat: 'club', photos: 8, src: 'Worldwide Other League', kit: K('solid', ['#f6d31c'], '#111111') }),
  P('Nacional 26/27 Home Jersey S-XXL', { ...T.nac, season: '2026/27', cat: 'club', photos: 9, src: 'Worldwide Other League', kit: K('solid', ['#f6f5f0'], '#1d3d8f') }),
  P('Nacional 26/27 Goalkeeper Red Jersey S-XXL', { ...T.nac, season: '2026/27', cat: 'club', variant: 'Goalkeeper', photos: 9, src: '⚽🧤Goalkeeper kit', kit: K('solid', ['#c8102e'], '#111111', '#ffffff') }),
  P('22/23 long sleeve Real Madrid away S-XXL', { ...T.rma, name: 'Real Madrid 22/23 Away Long Sleeve Jersey', season: '2022/23', cat: 'club', variant: 'Long sleeve', photos: 8, src: '⚽Long sleeve shirt', kit: K('solid', ['#2a2d4e'], '#f2a7c3', '#ffffff') }),
  P('22/23 long sleeve Ajax away S-XXL', { ...T.aja, name: 'Ajax 22/23 Away Long Sleeve Jersey', season: '2022/23', cat: 'club', variant: 'Long sleeve', photos: 10, src: '⚽Long sleeve shirt', kit: K('solid', ['#1b2a5c'], '#c8102e', '#ffffff') }),
  P('Flamengo 26/27 Home Long Sleeve Jersey S-4XL', { ...T.fla, season: '2026/27', cat: 'club', variant: 'Long sleeve', photos: 2, src: '⚽Long sleeve shirt', kit: K('hoops', ['#c8102e', '#121212'], '#ffffff') }),
  P('Sporting CP 26/27 Away Kids kit Jersey Size 16-28', { ...T.scp, name: 'Sporting CP 26/27 Away Kids Kit', season: '2026/27', cat: 'club', variant: 'Kids', photos: 11, src: '⚽👦🏻kids kit size：16-28', kit: K('solid', ['#111111'], '#00a35a', '#ffffff') }),
  P('Benfica 26/27 Third Kids kit Size 16-28', { ...T.slb, name: 'SL Benfica 26/27 Third Kids Kit', season: '2026/27', cat: 'club', variant: 'Kids', photos: 8, src: '⚽👦🏻kids kit size：16-28', kit: K('solid', ['#1a1a1a'], '#d9112a', '#ffffff') }),
  P('Real Betis 26/27 Home Kids Kit Jersey Size 16-28', { ...T.bet, name: 'Real Betis 26/27 Home Kids Kit', season: '2026/27', cat: 'club', variant: 'Kids', photos: 11, src: '⚽👦🏻kids kit size：16-28', kit: K('stripes', ['#0a8f4a', '#ffffff'], '#0a8f4a', '#111111') }),
  P("Cruzeiro 26/27 Third Away Women's Jersey S-XXL", { ...T.cru, season: '2026/27', cat: 'club', variant: "Women's", photos: 8, src: "⚽💁🏻‍♀️Women's shirt", kit: K('solid', ['#f6f5f0'], '#1d3d8f') }),

  // Retro football shirt
  P('Barcelona 80/81 Home Retro Jersey S-XXL', { ...T.fcb, name: 'FC Barcelona 80/81 Home Retro Jersey', season: '1980/81', cat: 'retro', variant: 'Retro', photos: 6, src: 'Retro football shirt', kit: K('stripes', ['#a50a3f', '#1b3d92'], '#f2c21b') }),
  P('Manchester City 16/17 Third Away Retro Jersey S-XXL', { ...T.mci, season: '2016/17', cat: 'retro', variant: 'Retro', photos: 2, src: 'Retro football shirt', kit: K('solid', ['#2b2b33'], '#8fd3ff', '#ffffff') }),
  P('M-U 21/22 Home Long-Sleeve Retro Jersey S-XXL', { ...T.mun, season: '2021/22', cat: 'retro', variant: 'Long sleeve', photos: 2, src: 'Retro football shirt', kit: K('solid', ['#c70d2a'], '#111111', '#ffffff') }),
  P('Middlesbrough 96/97 Home Retro Jersey S-XXL', { ...T.mid, season: '1996/97', cat: 'retro', variant: 'Retro', photos: 2, src: 'Retro football shirt', kit: K('solid', ['#d01f2f'], '#ffffff') }),
  P('Watford 98/99 Home Retro Jersey S-XXL', { ...T.wat, season: '1998/99', cat: 'retro', variant: 'Retro', photos: 2, src: 'Retro football shirt', kit: K('solid', ['#f6d31c'], '#c8102e', '#111111') }),
  P('RC Lens 96/97 Home Retro Jersey S-XXL', { ...T.len, season: '1996/97', cat: 'retro', variant: 'Retro', photos: 2, src: 'Retro football shirt', kit: K('yoke', ['#f6c700', '#c8102e'], '#c8102e') }),
  P('Sevilla 05/06 Home (European Cup Edition) Retro Jersey S-XXL', { ...T.sev, name: 'Sevilla 05/06 Home Retro Jersey (European Cup Edition)', season: '2005/06', cat: 'retro', variant: 'Retro', photos: 2, src: 'Retro football shirt', kit: K('solid', ['#f6f5f0'], '#c8102e') }),
  P('Celta de Vigo 01/02 Home UEFA Cup Retro Jersey S-XXL', { ...T.cel, season: '2001/02', cat: 'retro', variant: 'Retro', photos: 6, src: 'Retro football shirt', kit: K('solid', ['#8cc8f0'], '#c8102e') }),
  P('Retro long sleeve Colo Colo 2006 Away S-XXL', { ...T.col, name: 'Colo-Colo 2006 Away Long Sleeve Retro Jersey', season: '2006', cat: 'retro', variant: 'Long sleeve', photos: 8, src: 'Retro football shirt', kit: K('solid', ['#121212'], '#ffffff') }),
  P('Portugal 20/21 Home Retro Jersey S-XXL', { ...T.por, season: '2020/21', cat: 'retro', variant: 'Retro', photos: 8, src: '⚽🌍 National Teams', kit: K('yoke', ['#b3121c', '#0d6b3c'], '#e8c547') }),
  P('Germany 2018 World Cup Home Retro Jersey S-XXL', { ...T.ger, season: '2018', cat: 'retro', variant: 'Retro', photos: 8, src: '⚽🌍 National Teams', kit: K('solid', ['#f6f5f0'], '#111111') }),
  P('England 2022 Home Retro Jersey S-XXL', { ...T.eng, season: '2022', cat: 'retro', variant: 'Retro', photos: 8, src: '⚽🌍 National Teams', kit: K('solid', ['#f6f5f0'], '#1b2a5c') }),
  P('Spain 2021 Away Retro Jersey S-XXL', { ...T.spain, season: '2021', cat: 'retro', variant: 'Retro', photos: 8, src: '⚽🌍 National Teams', kit: K('solid', ['#eef1f4'], '#c4122f') }),

  // Shorts
  P('Real Madrid 26/27 Home Shorts S-XXL', { ...T.rma, season: '2026/27', cat: 'shorts', type: 'Shorts', photos: 6, src: 'Shorts', kit: K('solid', ['#f6f5f0'], '#1d2b4f') }),
  P('Barcelona 26/27 Home Shorts S-4XL', { ...T.fcb, name: 'FC Barcelona 26/27 Home Shorts', season: '2026/27', cat: 'shorts', type: 'Shorts', photos: 6, src: 'Shorts', kit: K('solid', ['#1b3d92'], '#a50a3f') }),
  P('Atletico Madrid 26/27 Home Shorts S-XXL', { ...T.atm, name: 'Atlético Madrid 26/27 Home Shorts', season: '2026/27', cat: 'shorts', type: 'Shorts', photos: 6, src: 'Shorts', kit: K('solid', ['#1b2a5c'], '#c8102e') }),
  P('Bayern Munich 26/27 Home Shorts S-XXL', { ...T.bay, season: '2026/27', cat: 'shorts', type: 'Shorts', photos: 8, src: 'Shorts', kit: K('solid', ['#d6062b'], '#ffffff') }),
  P('Arsenal 26/27 Home Shorts S-XXL', { ...T.ars, season: '2026/27', cat: 'shorts', type: 'Shorts', photos: 6, src: 'Shorts', kit: K('solid', ['#f6f5f0'], '#db0007') }),
  P('Palmeiras 26/27 Home Shorts S-XXL', { ...T.pal, season: '2026/27', cat: 'shorts', type: 'Shorts', av: 'req', photos: 6, src: 'Shorts', kit: K('solid', ['#f6f5f0'], '#0a6b3c') }),
  P('Brazil 2026 Home Shorts S-XXL', { ...T.bra, season: '2026', cat: 'shorts', type: 'Shorts', photos: 7, src: 'Shorts', kit: K('solid', ['#1d4fa8'], '#f8d417') }),
  P('Argentina 2026 Away Shorts S-XXL', { ...T.arg, season: '2026', cat: 'shorts', type: 'Shorts', photos: 7, src: 'Shorts', kit: K('solid', ['#1b2a5c'], '#7fb4e3') }),
  P('Barcelona 00/01 Home Retro Skeleton Shorts S-XXL', { ...T.fcb, name: 'FC Barcelona 00/01 Home Retro Shorts', season: '2000/01', cat: 'shorts', type: 'Shorts', variant: 'Retro', photos: 2, src: 'Shorts', kit: K('solid', ['#1b3d92'], '#a50a3f') }),

  // 💨🧥Windbreaker/Training Top → Tracksuits & jackets / Training wear
  P('Spain 2026 Away Club Entrance Jacket S-XXL', { ...T.spain, season: '2026', cat: 'tracksuits', type: 'Jacket', photos: 9, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#eef1f4'], '#c4122f') }),
  P('Argentina 2026 Away Club Entrance Jacket S-XXL', { ...T.arg, season: '2026', cat: 'tracksuits', type: 'Jacket', photos: 10, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#1b2a5c'], '#7fb4e3') }),
  P('Brazil 2026 Men\'s Football Anthem Jacket S-XXL', { ...T.bra, season: '2026', cat: 'tracksuits', type: 'Jacket', photos: 8, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#0b8a46'], '#f8d417') }),
  P('France 2026 Men\'s Football Anthem Jacket - Purple S-XXL', { ...T.fra, season: '2026', cat: 'tracksuits', type: 'Jacket', photos: 8, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#4b2a6e'], '#e9d6f5') }),
  P('Argentina FIGC EQT Track Top Windbreaker S-XXL', { ...T.arg, name: 'Argentina EQT Track Top Windbreaker', season: '2026', cat: 'tracksuits', type: 'Jacket', photos: 2, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#7fb4e3'], '#ffffff') }),
  P('Real Madrid 06/07 Windbreaker - Black S-XXL', { ...T.rma, season: '2006/07', cat: 'tracksuits', type: 'Jacket', variant: 'Retro', photos: 10, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#151515'], '#c8a24a') }),
  P('Barcelona 15/16 Windbreaker - Blue S-XXL', { ...T.fcb, name: 'FC Barcelona 15/16 Windbreaker - Blue', season: '2015/16', cat: 'tracksuits', type: 'Jacket', variant: 'Retro', photos: 10, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#1b3d92'], '#f2c21b') }),
  P('Napoli 88/89 Windbreaker - Blue S-XXL', { ...T.nap, season: '1988/89', cat: 'tracksuits', type: 'Jacket', variant: 'Retro', photos: 8, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#2f8fd8'], '#ffffff') }),
  P('LFC 95/96 Track Jacket Top - Green S-XXL', { ...T.liv, season: '1995/96', cat: 'tracksuits', type: 'Jacket', variant: 'Retro', av: 'req', photos: 8, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#0d6b3c'], '#ffffff') }),
  P('Originals X NTS Radio Windbreaker Black S-XXL', { ...T.nts, season: '2026', cat: 'tracksuits', type: 'Jacket', photos: 6, src: 'Worldwide Other League', kit: K('solid', ['#151515'], '#ffffff') }),
  P('Germany 2026 Training Windbreaker - White S-XXL', { ...T.ger, season: '2026', cat: 'training', type: 'Jacket', photos: 10, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#f6f5f0'], '#111111') }),
  P('Bahia 26/27 training Jersey S-4XL', { ...T.bah, name: 'Bahia 26/27 Training Jersey', season: '2026/27', cat: 'training', type: 'Training', photos: 2, src: 'new season', kit: K('solid', ['#1d3d8f'], '#c8102e', '#ffffff') }),
  P('PSG 25/26 Training - White Jersey S-3XL', { ...T.psg, name: 'PSG 25/26 Training Jersey - White', season: '2025/26', cat: 'training', type: 'Training', photos: 2, src: '💨🧥Windbreaker/Training Top', kit: K('solid', ['#f6f5f0'], '#13234f') }),
  P('Spain 2026 Player Version Training Shorts S-3XL', { ...T.spain, season: '2026', cat: 'training', type: 'Shorts', variant: 'Player version', photos: 7, src: 'Shorts', kit: K('solid', ['#c4122f'], '#e8c547') }),

  // Casual T-shirt / Polos → Other clothing
  P('Spain "We Are Champions" T-Shirt White S-3XL)', { ...T.spain, name: 'Spain "We Are Champions" T-Shirt - White', season: '2026', cat: 'other', type: 'Casual', photos: 3, src: '👕Casual T-shirt', kit: K('solid', ['#f6f5f0'], '#c4122f') }),
  P('Spain "We Are Champions" T-Shirt Red S-3XL', { ...T.spain, name: 'Spain "We Are Champions" T-Shirt - Red', season: '2026', cat: 'other', type: 'Casual', photos: 3, src: '👕Casual T-shirt', kit: K('solid', ['#c4122f'], '#e8c547') }),
  P('Celtic Originals Retro Style Casual Shirt S-XXL', { ...T.clt, season: '2026/27', cat: 'other', type: 'Casual', variant: 'Retro', photos: 9, src: 'new season', kit: K('hoops', ['#0a8f4a', '#ffffff'], '#ffffff', '#111111') }),
  P('Arsenal Originals Retro Style Casual Shirt S-XXL', { ...T.ars, season: '2026/27', cat: 'other', type: 'Casual', variant: 'Retro', photos: 9, src: 'new season', kit: K('solid', ['#db0007'], '#ffffff') }),
  P('Benfica 26/27 adidas Originals T-shirt S-4XL', { ...T.slb, name: 'SL Benfica 26/27 Originals T-Shirt', season: '2026/27', cat: 'other', type: 'Casual', photos: 2, src: 'new season', kit: K('solid', ['#d9112a'], '#ffffff') })
];

// Website categories ← Yupoo source categories
export const categories: Category[] = [
  { key: 'club', label: 'Club shirts', desc: 'Current-season and special edition club jerseys, including player versions, long sleeve, kids and women’s.', rep: '24/25 Barcelona joint', sources: ['La Liga', 'Premier League', 'Ligue 1', 'Brasileiro Série A', 'Worldwide Other League', '⚽💪🏻Player Version', '⚽Long sleeve shirt', '⚽👦🏻kids kit', '⚽💁🏻‍♀️Women\'s shirt', '⚽🧤Goalkeeper kit'] },
  { key: 'national', label: 'National team shirts', desc: 'World Cup 2026 and international jerseys.', rep: 'Spain 2026 2 Stars', sources: ['⚽🌍 National Teams', '2026 FIFA World Cup'] },
  { key: 'retro', label: 'Retro shirts', desc: 'Classic shirts from memorable seasons.', rep: 'Barcelona 80/81', sources: ['Retro football shirt'] },
  { key: 'shorts', label: 'Football shorts', desc: 'Match shorts for clubs and national teams.', rep: 'Real Madrid 26/27 Home Shorts', sources: ['Shorts'] },
  { key: 'tracksuits', label: 'Tracksuits & jackets', desc: 'Anthem jackets, windbreakers and track tops.', rep: 'Brazil 2026 Men', sources: ['💨🧥Windbreaker/Training Top'] },
  { key: 'training', label: 'Training wear', desc: 'Training jerseys, shorts and windbreakers.', rep: 'Bahia 26/27', sources: ['💨🧥Windbreaker/Training Top', 'new season'] },
  { key: 'other', label: 'Other clothing', desc: 'Casual T-shirts and lifestyle shirts.', rep: 'Celtic Originals', sources: ['👕Casual T-shirt', '⚽Polos'] }
];

export const leagues: League[] = [
  { key: 'Liga Portugal', desc: 'Sporting CP, FC Porto, SL Benfica and Vitória SC.', rep: 'Sporting CP 26/27 Home' },
  { key: 'La Liga', desc: 'Real Madrid, Barcelona, Atlético, Betis and more, current and retro.', rep: '24/25 Barcelona joint' },
  { key: 'Premier League', desc: 'Arsenal, Manchester United, Manchester City and Liverpool.', rep: '24/25 Arsenal joint' },
  { key: 'Serie A', desc: 'Italian club jackets and windbreakers.', rep: 'Napoli 88/89' },
  { key: 'Bundesliga', desc: 'Bayern Munich and FC Köln.', rep: 'Bayern Munich 26/27 Third' },
  { key: 'Ligue 1', desc: 'PSG, Marseille, Lille and RC Lens.', rep: '25/26 PSG Special' },
  { key: 'Brasileiro Série A', desc: 'Flamengo, Vasco da Gama, Internacional, Cruzeiro, Bahia and Palmeiras.', rep: 'Vasco da Gama 26/27 Special' },
  { key: 'National teams', desc: 'World Cup 2026 jerseys, shorts and anthem jackets.', rep: 'Argentina 2026 Anniversary' },
  { key: 'Other leagues', desc: 'Trabzonspor, Bodø/Glimt, Nacional, Ajax, Celtic and more.', rep: 'BodøGlimt' }
];


export const productById: Record<string, Product> = Object.fromEntries(products.map(p => [p.id, p]));
/** First product whose album title contains `q` (used to pick representative products). */
export const findAlbum = (q: string): Product => products.find(p => p.album.includes(q)) || products[0];
export const categoryLabel = (key: string) => categories.find(c => c.key === key)?.label ?? '';
