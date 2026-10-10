import { useNavigate } from 'react-router-dom';
import { categories, categoryRep, products } from '../data/catalogue';
import { ChevronRightIcon } from '../components/Icons';
import KitArt from '../components/KitArt';
import { categoryPath, H1, H2, LeagueTiles, PAGE } from '../components/ui';
import { CHAMFER, kitOf } from '../lib/constants';

export default function Categories() {
  const navigate = useNavigate();
  return (
    <main style={{ ...PAGE, paddingTop: 28, paddingBottom: 40 }}>
      <H1 style={{ marginBottom: 12 }}>Categories</H1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,360px),1fr))', gap: '0 36px' }}>
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => navigate(categoryPath(c.key))}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', border: 0, borderBottom: '1px solid #ececea', background: 'none', textAlign: 'left', width: '100%' }}
          >
            <div style={{ position: 'relative', width: 72, aspectRatio: '4 / 5', flex: '0 0 auto', clipPath: CHAMFER }}>
              <KitArt kit={kitOf(categoryRep(c))} style={{ position: 'absolute', inset: 0 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 17, fontWeight: 500 }}>{c.label}</span>
              <span style={{ fontSize: 13, color: '#6b6b67', lineHeight: 1.4 }}>{c.desc}</span>
            </div>
            <span className="mono" style={{ fontSize: 12, color: '#7a7a76' }}>{products.filter(p => p.cat === c.key).length}</span>
            <ChevronRightIcon />
          </button>
        ))}
      </div>
      <H2 style={{ margin: '48px 0 18px' }}>League collections</H2>
      <LeagueTiles />
    </main>
  );
}
