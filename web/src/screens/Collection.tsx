import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { categories, leagues, products } from '../data/catalogue';
import ProductCard from '../components/ProductCard';
import { Chip, Eyebrow, PAGE, ProductGrid } from '../components/ui';

/** League page (/league/:key) or category page (/category/:key). */
export default function CollectionRoute({ kind }: { kind: 'league' | 'cat' }) {
  const { key = '' } = useParams();
  return <Collection key={kind + ':' + key} kind={kind} collKey={key} />;
}

function Collection({ kind, collKey: key }: { kind: 'league' | 'cat'; collKey: string }) {
  const isL = kind === 'league';
  const league = isL ? leagues.find(l => l.key === key) : undefined;
  const cat = isL ? undefined : categories.find(c => c.key === key);
  const [sub, setSub] = useState('all');
  if (!league && !cat) return <Navigate to="/categories" replace />;

  const base = products.filter(p => (isL ? p.league === key : p.cat === key));
  const subKey = isL ? 'team' : 'league';
  const subs = ['all', ...new Set(base.map(p => p[subKey]))];
  const grid = base.filter(p => sub === 'all' || p[subKey] === sub);

  return (
    <main style={{ ...PAGE, paddingTop: 28, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Eyebrow>{isL ? 'League collection' : 'Category'} · {base.length} products</Eyebrow>
      <h1 style={{ margin: 0, fontWeight: 400, fontSize: 'clamp(36px,6.4cqw,72px)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
        {isL ? league!.key : cat!.label}
      </h1>
      <p style={{ margin: 0, maxWidth: 560, fontSize: 15, color: '#5d5d59', lineHeight: 1.5 }}>{isL ? league!.desc : cat!.desc}</p>
      {subs.length > 2 && (
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingTop: 6 }}>
          {subs.map(v => <Chip key={v} label={v === 'all' ? (isL ? 'All clubs' : 'All leagues') : v} on={sub === v} onClick={() => setSub(v)} />)}
        </div>
      )}
      <ProductGrid style={{ paddingTop: 10 }}>
        {grid.map(p => <ProductCard key={p.id} p={p} />)}
      </ProductGrid>
    </main>
  );
}
