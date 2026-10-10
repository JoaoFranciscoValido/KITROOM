import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LIME } from '../lib/constants';
import { useStore } from '../lib/store';
import { BackIcon, BagIcon, GridIcon, HeartIcon, HomeIcon, ListIcon, SearchIcon } from './Icons';

type Tab = 'home' | 'catalogue' | 'categories' | 'favourites' | 'cart';

export function activeTab(path: string): Tab | null {
  if (path === '/') return 'home';
  if (path.startsWith('/catalogue') || path.startsWith('/product')) return 'catalogue';
  if (path.startsWith('/categories') || path.startsWith('/league') || path.startsWith('/category')) return 'categories';
  if (path.startsWith('/favourites')) return 'favourites';
  if (['/cart', '/details', '/review', '/submitted'].some(p => path.startsWith(p))) return 'cart';
  return null;
}

export function useGoBack() {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/');
  };
}

const roundBtn = { width: 42, height: 42, borderRadius: '50%', border: '1px solid #e3e3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;

export function Header({ isDesktop }: { isDesktop: boolean }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { favs, cart } = useStore();
  const goBack = useGoBack();
  const tab = activeTab(pathname);
  const showBack = pathname.startsWith('/product') || pathname.startsWith('/league') || pathname.startsWith('/category/');
  const cartCount = cart.reduce((a, l) => a + l.qty, 0);
  const deskLink = (t: Tab, label: string, to: string) => (
    <button
      onClick={() => navigate(to)}
      aria-current={tab === t ? 'page' : undefined}
      style={{ height: 38, padding: '0 16px', borderRadius: 999, border: 0, background: tab === t ? '#111' : 'transparent', color: tab === t ? '#fff' : '#111', fontSize: 14 }}
    >
      {label}
    </button>
  );

  return (
    <header style={{ position: 'sticky', top: 'env(safe-area-inset-top, 0px)', zIndex: 20, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid #ededea' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(16px,4cqw,40px)', height: 60, display: 'flex', alignItems: 'center', gap: 14 }}>
        {showBack && (
          <button onClick={goBack} aria-label="Back" style={{ width: 40, height: 40, marginLeft: -8, border: 0, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BackIcon />
          </button>
        )}
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 0, background: 'none', padding: 0, fontSize: 18, fontWeight: 600, letterSpacing: '0.06em' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: LIME, border: '1.5px solid #111' }} />KITROOM
        </button>
        {isDesktop && (
          <nav style={{ display: 'flex', gap: 4, marginLeft: 28 }}>
            {deskLink('home', 'Home', '/')}
            {deskLink('catalogue', 'Catalogue', '/catalogue')}
            {deskLink('categories', 'Categories', '/categories')}
          </nav>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => navigate('/catalogue', { state: { focusSearch: true } })} aria-label="Search" style={{ ...roundBtn, background: '#fff' }}>
            <SearchIcon />
          </button>
          {isDesktop && (
            <>
              <button onClick={() => navigate('/favourites')} aria-label="Favourites" style={{ ...roundBtn, position: 'relative', background: tab === 'favourites' ? LIME : 'transparent' }}>
                <HeartIcon />
                {favs.length > 0 && <Badge style={{ top: -3, right: -3, minWidth: 19, height: 19, borderRadius: 10, fontSize: 11 }}>{favs.length}</Badge>}
              </button>
              <button onClick={() => navigate('/cart')} aria-label="Cart" style={{ position: 'relative', height: 42, padding: '0 16px 0 14px', borderRadius: 999, border: 0, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <BagIcon size={18} color="#fff" />
                Cart
                <span style={{ minWidth: 22, height: 22, padding: '0 6px', borderRadius: 11, background: LIME, color: '#111', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Badge({ children, style }: { children: ReactNode; style: React.CSSProperties }) {
  return (
    <span style={{ position: 'absolute', padding: '0 5px', background: '#111', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {children}
    </span>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { favs, cart } = useStore();
  const tab = activeTab(pathname);
  const cartCount = cart.reduce((a, l) => a + l.qty, 0);
  const smallBadge = { top: -3, right: 6, minWidth: 18, height: 18, borderRadius: 9, fontSize: 10.5 };
  const item = (t: Tab, label: string, to: string, icon: ReactNode, badge?: number) => {
    const a = tab === t;
    return (
      <button
        onClick={() => navigate(to)}
        aria-current={a ? 'page' : undefined}
        style={{ flex: 1, border: 0, background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: a ? '#111' : '#6f6f6b', fontSize: 11, fontWeight: a ? 600 : 400 }}
      >
        <span style={{ position: 'relative', width: 54, height: 30, borderRadius: 999, background: a ? LIME : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
          {!!badge && <Badge style={smallBadge}>{badge}</Badge>}
        </span>
        {label}
      </button>
    );
  };
  return (
    <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, height: 76, padding: '0 6px 8px', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', background: '#fff', borderTop: '1px solid #ececea', display: 'flex' }}>
      {item('home', 'Home', '/', <HomeIcon />)}
      {item('catalogue', 'Catalogue', '/catalogue', <GridIcon />)}
      {item('categories', 'Categories', '/categories', <ListIcon />)}
      {item('favourites', 'Favourites', '/favourites', <HeartIcon size={20} />, favs.length)}
      {item('cart', 'Cart', '/cart', <BagIcon size={20} />, cartCount)}
    </nav>
  );
}

export function Toast({ isDesktop }: { isDesktop: boolean }) {
  const { toast } = useStore();
  const navigate = useNavigate();
  if (!toast) return null;
  return (
    <div
      role="status"
      style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: isDesktop ? 28 : 92, zIndex: 60, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 10px 10px 18px', borderRadius: 999, background: '#111', color: '#fff', fontSize: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}
    >
      <span>{toast.msg}</span>
      {toast.action && (
        <button onClick={() => navigate('/cart')} style={{ height: 32, padding: '0 14px', borderRadius: 999, border: 0, background: LIME, color: '#111', fontSize: 13, fontWeight: 600 }}>
          View cart
        </button>
      )}
    </div>
  );
}
