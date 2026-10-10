import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CameraIcon, CloseIcon, FilterIcon, SearchIcon } from '../components/Icons';
import ProductCard from '../components/ProductCard';
import { Chip, Count, H1, PAGE, plural, ProductGrid } from '../components/ui';
import { useCatalogueResults } from '../lib/catalogueFilter';
import { LIME } from '../lib/constants';
import { useStore } from '../lib/store';

export function SpecialShirtCallout() {
  const { openSpecial } = useStore();
  return (
    <div style={{ marginTop: 28, padding: 20, borderRadius: 20, background: '#f4f4f1', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '1 1 240px' }}>
        <span style={{ fontSize: 17, fontWeight: 600 }}>Can't find your shirt?</span>
        <span style={{ fontSize: 14, color: '#5d5d59', lineHeight: 1.45 }}>Send a photo of the shirt you want and add it to your order as a special request.</span>
      </div>
      <button onClick={openSpecial} style={{ height: 50, padding: '0 22px', borderRadius: 999, border: 0, background: '#111', color: '#fff', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        <CameraIcon color="#fff" />Add a special shirt
      </button>
    </div>
  );
}

export default function Catalogue() {
  const { search, setSearch, setFilterOpen, clearFilters } = useStore();
  const { results, activeTags, catChips } = useCatalogueResults();
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    if ((location.state as { focusSearch?: boolean } | null)?.focusSearch) searchRef.current?.focus();
  }, [location.key, location.state]);

  return (
    <main style={{ ...PAGE, paddingTop: 28, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <H1>Catalogue</H1>
        <Count>{plural(results.length)}</Count>
      </div>
      <div style={{ position: 'relative' }}>
        <SearchIcon color="#6b6b67" style={{ position: 'absolute', left: 16, top: 15 }} />
        <input
          ref={searchRef}
          className="focus-dark"
          aria-label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs, countries, leagues"
          style={{ width: '100%', height: 50, borderRadius: 999, border: '1px solid #d6d6d3', padding: '0 18px 0 46px', fontSize: 16, background: '#fff', outline: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setFilterOpen(true)} style={{ flex: '0 0 auto', height: 40, padding: '0 14px', borderRadius: 999, border: '1px solid #111', background: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
          <FilterIcon />
          Filters
          {activeTags.length > 0 && (
            <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: LIME, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeTags.length}</span>
          )}
        </button>
        <div style={{ width: 1, height: 24, background: '#e0e0dd', flex: '0 0 auto' }} />
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', minWidth: 0 }}>
          {catChips.map(c => <Chip key={c.key} label={c.label} on={c.on} onClick={c.pick} />)}
        </div>
      </div>
      {activeTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {activeTags.map(t => (
            <button key={t.key} onClick={t.clear} aria-label={'Remove filter ' + t.label} style={{ height: 32, padding: '0 10px 0 12px', borderRadius: 999, border: 0, background: '#f1f1ee', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              {t.label}<CloseIcon size={13} />
            </button>
          ))}
          <button onClick={clearFilters} style={{ height: 32, padding: '0 8px', border: 0, background: 'none', fontSize: 13, textDecoration: 'underline' }}>Clear all</button>
        </div>
      )}
      {results.length === 0 && (
        <div style={{ padding: '56px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 500 }}>No products match these filters</span>
          <span style={{ fontSize: 14, color: '#6b6b67' }}>Try another club or remove a filter.</span>
          <button onClick={clearFilters} style={{ marginTop: 8, height: 46, padding: '0 22px', borderRadius: 999, border: 0, background: '#111', color: '#fff', fontSize: 14, fontWeight: 500 }}>Clear filters</button>
        </div>
      )}
      <ProductGrid style={{ paddingTop: 6 }}>
        {results.map(p => <ProductCard key={p.id} p={p} />)}
      </ProductGrid>
      <SpecialShirtCallout />
    </main>
  );
}
