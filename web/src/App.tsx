import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav, Header, Toast } from './components/Chrome';
import CustomizeSheet from './components/CustomizeSheet';
import FiltersSheet from './components/FiltersSheet';
import { useIsDesktop } from './lib/useWidth';
import Cart from './screens/Cart';
import Catalogue from './screens/Catalogue';
import Categories from './screens/Categories';
import Collection from './screens/Collection';
import Details from './screens/Details';
import Favourites from './screens/Favourites';
import Home from './screens/Home';
import OrderView from './screens/OrderView';
import ProductDetail from './screens/ProductDetail';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  const isDesktop = useIsDesktop();
  return (
    <>
      <ScrollToTop />
      {/* Container for cqw units; fixed-position UI (nav, toast, sheets) lives outside it. */}
      <div style={{ containerType: 'inline-size', minHeight: '100vh', paddingBottom: isDesktop ? 0 : 92 }}>
        <Header isDesktop={isDesktop} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/league/:key" element={<Collection key="league" kind="league" />} />
          <Route path="/category/:key" element={<Collection key="cat" kind="cat" />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/details" element={<Details />} />
          <Route path="/review" element={<OrderView mode="review" />} />
          <Route path="/submitted" element={<OrderView mode="done" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isDesktop && <BottomNav />}
      <Toast isDesktop={isDesktop} />
      <FiltersSheet isDesktop={isDesktop} />
      <CustomizeSheet isDesktop={isDesktop} />
    </>
  );
}
