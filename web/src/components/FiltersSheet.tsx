import { useCallback } from 'react';
import { useCatalogueResults } from '../lib/catalogueFilter';
import { useStore } from '../lib/store';
import Sheet from './Sheet';
import { plural } from './ui';

export default function FiltersSheet({ isDesktop }: { isDesktop: boolean }) {
  const { filterOpen, setFilterOpen, clearFilters } = useStore();
  const { results, filterGroups } = useCatalogueResults();
  const close = useCallback(() => setFilterOpen(false), [setFilterOpen]);
  if (!filterOpen) return null;

  return (
    <Sheet
      title="Filters"
      onClose={close}
      isDesktop={isDesktop}
      maxWidth={560}
      maxHeight="88%"
      variant="filters"
      footer={
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px 20px', borderTop: '1px solid #ececea' }}>
          <button onClick={clearFilters} style={{ flex: 1, height: 52, borderRadius: 999, border: '1px solid #d4d4d1', background: '#fff', fontSize: 15, fontWeight: 500 }}>Clear all</button>
          <button onClick={close} style={{ flex: 2, height: 52, borderRadius: 999, border: 0, background: '#111', color: '#fff', fontSize: 15, fontWeight: 600 }}>Show {plural(results.length)}</button>
        </div>
      }
    >
      {filterGroups.map(g => (
        <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b6b67' }}>{g.label}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {g.opts.map(o => (
              <button
                key={o.v}
                onClick={o.pick}
                aria-pressed={o.on}
                style={{ height: 38, padding: '0 14px', borderRadius: 999, border: `1px solid ${o.on ? '#111' : '#d4d4d1'}`, background: o.on ? '#111' : '#fff', color: o.on ? '#fff' : '#111', fontSize: 13.5 }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </Sheet>
  );
}
