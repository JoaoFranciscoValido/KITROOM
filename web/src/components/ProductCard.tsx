import { useNavigate } from 'react-router-dom';
import { categoryLabel } from '../data/catalogue';
import type { Product } from '../data/types';
import { AV, CHAMFER, kitOf, LIME } from '../lib/constants';
import { useStore } from '../lib/store';
import KitArt from './KitArt';
import { BagIcon, HeartIcon } from './Icons';

export default function ProductCard({ p }: { p: Product }) {
  const navigate = useNavigate();
  const { favs, cart, toggleFav, quickAdd } = useStore();
  const open = () => navigate('/product/' + p.id);
  const inCart = cart.some(l => l.productId === p.id);
  const fav = favs.includes(p.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={open}
          aria-label={'Open ' + p.name}
          style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '4 / 5', padding: 0, border: 0, background: '#d6d6d3', clipPath: CHAMFER, overflow: 'hidden' }}
        >
          <KitArt kit={kitOf(p)} style={{ position: 'absolute', inset: 0 }} />
          <span style={{ position: 'absolute', left: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', fontSize: 11.5, fontWeight: 500, color: '#111' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: AV[p.av].dot }} />{AV[p.av].label}
          </span>
        </button>
        <button
          onClick={() => toggleFav(p.id)}
          aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
          aria-pressed={fav}
          style={{ position: 'absolute', top: 10, right: 10, width: 40, height: 40, borderRadius: '50%', border: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <HeartIcon fill={fav ? '#111' : 'none'} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a7a76', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {[categoryLabel(p.cat), p.season].filter(Boolean).join(' · ')}
          </div>
          <div onClick={open} style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.25, cursor: 'pointer', textWrap: 'pretty' } as React.CSSProperties}>{p.name}</div>
          <div style={{ fontSize: 13, color: '#6f6f6b' }}>{p.team}</div>
        </div>
        <button
          className="hover-dark-border"
          onClick={() => quickAdd(p.id)}
          aria-label="Add to cart"
          style={{ flex: '0 0 auto', width: 44, height: 44, borderRadius: '50%', border: `1px solid ${inCart ? LIME : '#e0e0dd'}`, background: inCart ? LIME : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <BagIcon />
        </button>
      </div>
    </div>
  );
}
