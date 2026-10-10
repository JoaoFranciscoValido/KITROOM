import { useNavigate } from 'react-router-dom';
import { productById } from '../data/catalogue';
import { HeartIcon } from '../components/Icons';
import ProductCard from '../components/ProductCard';
import { Count, H1, PAGE, ProductGrid } from '../components/ui';
import { useStore } from '../lib/store';
import { EmptyState } from './Cart';

export default function Favourites() {
  const navigate = useNavigate();
  const { favs } = useStore();
  const items = favs.map(id => productById[id]).filter(Boolean);
  return (
    <main style={{ ...PAGE, paddingTop: 28, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <H1>Favourites</H1>
        <Count>{items.length} saved</Count>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={<HeartIcon size={36} sw={1.5} />}
          title="No favourites yet"
          text="Tap the heart on any shirt to save it here for later."
          actions={<button onClick={() => navigate('/catalogue')} style={{ marginTop: 10, height: 52, padding: '0 28px', borderRadius: 999, border: 0, background: '#111', color: '#fff', fontSize: 15, fontWeight: 600 }}>Browse catalogue</button>}
        />
      ) : (
        <ProductGrid>{items.map(p => <ProductCard key={p.id} p={p} />)}</ProductGrid>
      )}
    </main>
  );
}
