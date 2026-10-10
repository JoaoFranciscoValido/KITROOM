import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { productById } from '../data/catalogue';

export interface Line {
  id: string;
  productId: string;
  special?: boolean;
  /** Customer photo (data URL) for special shirts. */
  image?: string;
  /** Customer description for special shirts. */
  title?: string;
  size: string;
  name: string;
  number: string;
  other: string;
  qty: number;
}
export type LineData = Omit<Line, 'id'>;

export type Contact = 'WhatsApp' | 'SMS' | 'Phone call';
export interface Customer { name: string; phone: string; email: string; notes: string; contact: Contact }
export type CustomerErrors = Partial<Record<'name' | 'phone' | 'email', string>>;

export interface Order { ref: string; date: string; lines: Line[]; customer: Customer }

export interface SheetState {
  mode: 'add' | 'edit';
  lineId?: string;
  productId: string;
  special?: boolean;
  image?: string;
  title?: string;
  size: string | null;
  name: string;
  number: string;
  other: string;
  qty: number;
  err: boolean;
  imgErr?: boolean;
  titleErr?: boolean;
}

export const FILTER_KEYS = ['cat', 'league', 'country', 'team', 'season', 'type', 'variant', 'av'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Record<FilterKey, string>;
export const ALL_FILTERS: Filters = { cat: 'all', league: 'all', country: 'all', team: 'all', season: 'all', type: 'all', variant: 'all', av: 'all' };

const LS_CART = 'kitroom.cart.v1';
const LS_FAV = 'kitroom.favs.v1';
const LS_CUSTOMER = 'kitroom.customer.v1';
const SS_ORDER = 'kitroom.order.v1';

const read = <T,>(storage: () => Storage, key: string): T | null => {
  try {
    const raw = storage().getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const write = (storage: () => Storage, key: string, value: unknown) => {
  try {
    if (value == null) storage().removeItem(key);
    else storage().setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
};
const local = () => window.localStorage;
const session = () => window.sessionStorage;

const loadCart = (): Line[] => {
  const v = read<unknown>(local, LS_CART);
  return Array.isArray(v) ? v.filter((l): l is Line => !!l && typeof l === 'object' && (l.special || !!productById[l.productId])) : [];
};
const loadFavs = (): string[] => {
  const v = read<unknown>(local, LS_FAV);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!productById[x]) : [];
};
const emptyCustomer: Customer = { name: '', phone: '', email: '', notes: '', contact: 'WhatsApp' };

export function validateCustomer(c: Customer): CustomerErrors {
  const e: CustomerErrors = {};
  if (c.name.trim().length < 2) e.name = 'Enter your full name.';
  if (c.phone.replace(/\D/g, '').length < 9) e.phone = 'Enter a valid phone number so the seller can reach you.';
  if (c.email.trim() && !/^\S+@\S+\.\S+$/.test(c.email.trim())) e.email = 'Check the email address.';
  return e;
}

const pad = (n: number) => String(n).padStart(2, '0');
const makeRef = (now: Date) =>
  `KR-${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;

interface Toast { msg: string; action: boolean }

interface Store {
  cart: Line[];
  favs: string[];
  customer: Customer;
  cErr: CustomerErrors;
  order: Order | null;
  toast: Toast | null;
  sheet: SheetState | null;
  filters: Filters;
  search: string;
  filterOpen: boolean;
  toggleFav: (id: string) => void;
  addLine: (d: LineData) => void;
  updLine: (id: string, patch: Partial<Line>) => void;
  rmLine: (id: string) => void;
  showToast: (msg: string, action?: boolean) => void;
  setCustomer: (patch: Partial<Customer>) => void;
  setCErr: (e: CustomerErrors) => void;
  /** Creates the order from the cart and clears the cart. Returns null if the cart is empty. */
  submitOrder: () => Order | null;
  quickAdd: (productId: string) => void;
  editLine: (l: Line) => void;
  openSpecial: () => void;
  setSheet: (patch: Partial<SheetState>) => void;
  closeSheet: () => void;
  setFilter: (k: FilterKey, v: string) => void;
  clearFilters: () => void;
  setSearch: (v: string) => void;
  setFilterOpen: (v: boolean) => void;
}

const blank = { size: null, name: '', number: '', other: '', qty: 1, err: false };

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Line[]>(loadCart);
  const [favs, setFavs] = useState<string[]>(loadFavs);
  const [customer, setCustomerState] = useState<Customer>(() => ({ ...emptyCustomer, ...read<Partial<Customer>>(local, LS_CUSTOMER) }));
  const [cErr, setCErr] = useState<CustomerErrors>({});
  const [order, setOrder] = useState<Order | null>(() => read<Order>(session, SS_ORDER));
  const [toast, setToast] = useState<Toast | null>(null);
  const [sheet, setSheetState] = useState<SheetState | null>(null);
  const [filters, setFilters] = useState<Filters>({ ...ALL_FILTERS });
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const tt = useRef<number>();

  useEffect(() => write(local, LS_CART, cart), [cart]);
  useEffect(() => write(local, LS_FAV, favs), [favs]);
  useEffect(() => write(local, LS_CUSTOMER, customer), [customer]);
  useEffect(() => write(session, SS_ORDER, order), [order]);
  useEffect(() => () => window.clearTimeout(tt.current), []);

  const showToast = useCallback((msg: string, action = false) => {
    window.clearTimeout(tt.current);
    setToast({ msg, action });
    tt.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const toggleFav = useCallback((id: string) => {
    const has = favs.includes(id);
    setFavs(f => (has ? f.filter(x => x !== id) : f.includes(id) ? f : [...f, id]));
    showToast(has ? 'Removed from favourites' : 'Saved to favourites');
  }, [favs, showToast]);

  const addLine = useCallback((d: LineData) => {
    setCart(c => {
      const next = [...c];
      const i = d.special ? -1 : next.findIndex(l => !l.special && l.productId === d.productId && l.size === d.size && l.name === d.name && l.number === d.number && l.other === d.other);
      if (i >= 0) next[i] = { ...next[i], qty: Math.min(20, next[i].qty + d.qty) };
      else next.push({ id: 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ...d });
      return next;
    });
    showToast('Added to cart', true);
  }, [showToast]);

  const updLine = useCallback((id: string, patch: Partial<Line>) => setCart(c => c.map(l => (l.id === id ? { ...l, ...patch } : l))), []);
  const rmLine = useCallback((id: string) => { setCart(c => c.filter(l => l.id !== id)); showToast('Removed from cart'); }, [showToast]);
  const setCustomer = useCallback((patch: Partial<Customer>) => { setCustomerState(c => ({ ...c, ...patch })); setCErr({}); }, []);

  const submitOrder = useCallback((): Order | null => {
    if (!cart.length) return null;
    const now = new Date();
    const o: Order = { ref: makeRef(now), date: now.toISOString(), lines: cart.map(l => ({ ...l })), customer: { ...customer } };
    setOrder(o);
    setCart([]);
    return o;
  }, [cart, customer]);

  const quickAdd = useCallback((productId: string) => setSheetState({ mode: 'add', productId, ...blank }), []);
  const openSpecial = useCallback(() => setSheetState({ mode: 'add', special: true, productId: 'special', image: '', title: '', ...blank, imgErr: false }), []);
  const editLine = useCallback((l: Line) => setSheetState({
    mode: 'edit', lineId: l.id, productId: l.productId, special: !!l.special, image: l.image || '', title: l.title || '',
    size: l.size, name: l.name, number: l.number, other: l.other, qty: l.qty, err: false, imgErr: false,
  }), []);
  const setSheet = useCallback((patch: Partial<SheetState>) => setSheetState(s => (s ? { ...s, ...patch } : null)), []);
  const closeSheet = useCallback(() => setSheetState(null), []);
  const setFilter = useCallback((k: FilterKey, v: string) => setFilters(f => ({ ...f, [k]: v })), []);
  const clearFilters = useCallback(() => { setFilters({ ...ALL_FILTERS }); setSearch(''); }, []);

  const value = useMemo<Store>(() => ({
    cart, favs, customer, cErr, order, toast, sheet, filters, search, filterOpen,
    toggleFav, addLine, updLine, rmLine, showToast, setCustomer, setCErr, submitOrder,
    quickAdd, editLine, openSpecial, setSheet, closeSheet, setFilter, clearFilters, setSearch, setFilterOpen,
  }), [cart, favs, customer, cErr, order, toast, sheet, filters, search, filterOpen, toggleFav, addLine, updLine, rmLine, showToast, setCustomer, submitOrder, quickAdd, editLine, openSpecial, setSheet, closeSheet, setFilter, clearFilters]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
