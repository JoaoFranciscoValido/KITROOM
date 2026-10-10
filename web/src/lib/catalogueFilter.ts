import { useMemo } from 'react';
import { categories, products } from '../data/catalogue';
import type { Product } from '../data/types';
import { AV } from './constants';
import { FILTER_KEYS, useStore, type FilterKey } from './store';

const GROUPS: [Exclude<FilterKey, 'cat'>, string][] = [
  ['league', 'League'], ['country', 'Country'], ['team', 'Club / team'], ['season', 'Season'],
  ['type', 'Product type'], ['variant', 'Version'], ['av', 'Availability'],
];

const optLabel = (k: FilterKey, v: string) => (v === 'all' ? 'All' : k === 'av' ? AV[v as keyof typeof AV].label : v);

export function useCatalogueResults() {
  const { filters: F, search, setFilter } = useStore();
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    const results = products.filter(
      p => FILTER_KEYS.every(k => F[k] === 'all' || p[k] === F[k]) &&
        (!q || `${p.name} ${p.team} ${p.league} ${p.country} ${p.season}`.toLowerCase().includes(q)),
    );
    const filterGroups = GROUPS.map(([k, label]) => ({
      key: k,
      label,
      opts: ['all', ...[...new Set(products.map(p => p[k] as string))].sort((a, b) => (k === 'season' ? b.localeCompare(a) : a.localeCompare(b)))]
        .map(v => ({ v, label: optLabel(k, v), on: F[k] === v, pick: () => setFilter(k, v) })),
    }));
    const activeTags = GROUPS.filter(([k]) => F[k] !== 'all').map(([k]) => ({ key: k, label: optLabel(k, F[k]), clear: () => setFilter(k, 'all') }));
    const catChips = [{ key: 'all', label: 'All' }, ...categories].map(c => ({ key: c.key, label: c.label, on: F.cat === c.key, pick: () => setFilter('cat', c.key) }));
    return { results: results as Product[], filterGroups, activeTags, catChips };
  }, [F, search, setFilter]);
}
