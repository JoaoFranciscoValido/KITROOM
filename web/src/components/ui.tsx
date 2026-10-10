import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { findAlbum, leagues, products } from '../data/catalogue';
import type { Product } from '../data/types';
import { kitOf, LIME, TILE_CHAMFER } from '../lib/constants';
import KitArt from './KitArt';
import { MinusIcon, PlusIcon } from './Icons';

export const PAGE: CSSProperties = { maxWidth: 1240, margin: '0 auto', paddingLeft: 'clamp(16px,4cqw,40px)', paddingRight: 'clamp(16px,4cqw,40px)' };

export const H1 = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <h1 style={{ margin: 0, fontWeight: 400, fontSize: 'clamp(32px,5cqw,56px)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.02em', ...style }}>{children}</h1>
);

export const H2 = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <h2 style={{ margin: 0, fontWeight: 400, fontSize: 'clamp(24px,3.4cqw,36px)', textTransform: 'uppercase', letterSpacing: '-0.01em', ...style }}>{children}</h2>
);

export const Eyebrow = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <span className="mono" style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b6b67', ...style }}>{children}</span>
);

export const Count = ({ children }: { children: ReactNode }) => (
  <span className="mono" style={{ fontSize: 12, color: '#6b6b67', whiteSpace: 'nowrap' }}>{children}</span>
);

export const Tag = ({ children, color = '#6b6b67' }: { children: ReactNode; color?: string }) => (
  <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color }}>{children}</span>
);

/** Rounded filter / category chip; lime when active. */
export const Chip = ({ label, on, onClick, px = 16 }: { label: string; on: boolean; onClick: () => void; px?: number }) => (
  <button
    onClick={onClick}
    aria-pressed={on}
    style={{ flex: '0 0 auto', height: 40, padding: `0 ${px}px`, borderRadius: 999, border: `1px solid ${on ? LIME : '#d4d4d1'}`, background: on ? LIME : '#fff', fontSize: 14, whiteSpace: 'nowrap' }}
  >
    {label}
  </button>
);

export function SizeGrid({ product, value, onPick, height = 50 }: { product: Pick<Product, 'sizes' | 'out'>; value: string | null; onPick: (s: string) => void; height?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px,1fr))', gap: 8 }}>
      {product.sizes.map(sz => {
        const out = (product.out || []).includes(sz);
        const on = value === sz;
        return (
          <button
            key={sz}
            onClick={() => !out && onPick(sz)}
            disabled={out}
            aria-pressed={on}
            style={{
              height, borderRadius: 12, border: `1px solid ${on ? '#111' : out ? '#ebebe8' : '#d4d4d1'}`, background: on ? '#111' : '#fff',
              color: on ? '#fff' : out ? '#b3b3af' : '#111', textDecoration: out ? 'line-through' : 'none', fontSize: 15, fontWeight: 500,
              cursor: out ? 'not-allowed' : 'pointer',
            }}
          >
            {sz}
          </button>
        );
      })}
    </div>
  );
}

export function QtyStepper({ qty, onChange, size = 'lg' }: { qty: number; onChange: (q: number) => void; size?: 'lg' | 'md' | 'sm' }) {
  const d = { lg: { h: 54, b: 42, pad: 4, i: 16, min: 22, f: 16 }, md: { h: 54, b: 40, pad: 4, i: 16, min: 20, f: 16 }, sm: { h: 40, b: 36, pad: 2, i: 14, min: 18, f: 14 } }[size];
  const btn: CSSProperties = { width: d.b, height: d.b, border: 0, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: d.h, border: '1px solid #d4d4d1', borderRadius: 999, padding: `0 ${d.pad}px`, flex: '0 0 auto' }}>
      <button onClick={() => onChange(Math.max(1, qty - 1))} aria-label="Decrease" style={btn}><MinusIcon size={d.i} /></button>
      <span style={{ minWidth: d.min, textAlign: 'center', fontSize: d.f, fontWeight: 500 }} aria-live="polite">{qty}</span>
      <button onClick={() => onChange(Math.min(20, qty + 1))} aria-label="Increase" style={btn}><PlusIcon size={d.i} /></button>
    </div>
  );
}

export const inputStyle = (border = '#d6d6d3', h = 50, r = 12): CSSProperties => ({
  width: '100%', height: h, borderRadius: r, border: `1px solid ${border}`, padding: '0 14px', fontSize: 16, background: '#fff', outline: 'none',
});

export const textareaStyle = (r = 12): CSSProperties => ({
  width: '100%', borderRadius: r, border: '1px solid #d6d6d3', padding: '12px 14px', fontSize: 16, background: '#fff', outline: 'none', resize: 'vertical', lineHeight: 1.4,
});

export const OptionalNote = () => <span style={{ color: '#8a8a86' }}>· optional</span>;

export function OtherChips({ chips, onPick }: { chips: string[]; onPick: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {chips.map(t => (
        <button key={t} onClick={() => onPick(t)} style={{ height: 32, padding: '0 12px', borderRadius: 999, border: '1px solid #d4d4d1', background: '#fff', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
          <PlusIcon size={12} />{t}
        </button>
      ))}
    </div>
  );
}

export const leaguePath = (key: string) => '/league/' + encodeURIComponent(key);
export const categoryPath = (key: string) => '/category/' + encodeURIComponent(key);

export function LeagueTiles() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(46%,190px),1fr))', gap: 12 }}>
      {leagues.map(L => (
        <button
          key={L.key}
          className="hover-tile"
          onClick={() => navigate(leaguePath(L.key))}
          style={{ position: 'relative', height: 160, border: 0, padding: 16, background: '#f1f1ee', clipPath: TILE_CHAMFER, textAlign: 'left', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          <div style={{ position: 'absolute', right: '-16%', top: '-8%', width: '76%', height: '86%' }}>
            <KitArt kit={kitOf(findAlbum(L.rep))} tone="bare" artH="88%" style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div style={{ position: 'relative', fontSize: 16, fontWeight: 500 }}>{L.key}</div>
          <div className="mono" style={{ position: 'relative', fontSize: 10.5, color: '#6b6b67', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            {products.filter(p => p.league === L.key).length} products
          </div>
        </button>
      ))}
    </div>
  );
}

export const ProductGrid = ({ children, gap = '30px 14px', style }: { children: ReactNode; gap?: string; style?: CSSProperties }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(44%,230px),1fr))', gap, ...style }}>{children}</div>
);

export const plural = (n: number, one = 'product', many = 'products') => (n === 1 ? `1 ${one}` : `${n} ${many}`);
