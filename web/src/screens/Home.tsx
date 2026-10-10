import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, products } from '../data/catalogue';
import { ArrowRightIcon } from '../components/Icons';
import ProductCard from '../components/ProductCard';
import { Chip, H2, LeagueTiles, PAGE } from '../components/ui';
import { LIME } from '../lib/constants';

const STEPS = [
  ['01', 'Pick and personalise', 'Choose your size, then add a name, number or badges if you want them.'],
  ['02', 'Send your request', 'Review your list and leave your name and phone number. No payment is taken online.'],
  ['03', 'We confirm with you', 'The seller checks availability and contacts you by WhatsApp, SMS or phone to agree the next steps.'],
];

const pillBtn = { height: 38, padding: '0 18px', borderRadius: 999, border: '1px solid #e0e0dd', background: '#fff', fontSize: 13, fontWeight: 500 } as const;

export default function Home() {
  const navigate = useNavigate();
  const [homeCat, setHomeCat] = useState(categories[0].key);
  const [carP, setCarP] = useState(0);
  const car = useRef<HTMLDivElement>(null);
  const featured = products.filter(p => p.cat === homeCat);
  const scrollCar = (dir: number) => car.current?.scrollBy({ left: dir * car.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <main>
      <div style={{ ...PAGE, paddingTop: 'clamp(32px,7cqw,80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b6b67' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: LIME, border: '1px solid #111' }} />Season 2024/25 · Order requests open
        </div>
        <h1 style={{ margin: 0, fontWeight: 400, fontSize: 'clamp(40px,8.6cqw,88px)', lineHeight: 1.02, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
          Find your<br />matchday kit
        </h1>
        <p style={{ margin: 0, maxWidth: 520, color: '#6b6b67', fontSize: 'clamp(15px,1.7cqw,17px)', lineHeight: 1.5, textWrap: 'pretty' } as React.CSSProperties}>
          Club, national team and retro shirts, personalised with your name and number. Send a request and we confirm everything with you directly.
        </p>
      </div>

      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '26px clamp(16px,4cqw,40px) 4px', justifyContent: 'safe center' }}>
        {categories.map(c => (
          <Chip key={c.key} label={c.label} on={homeCat === c.key} px={18} onClick={() => { setHomeCat(c.key); setCarP(0); if (car.current) car.current.scrollLeft = 0; }} />
        ))}
      </div>

      <div
        ref={car}
        className="no-scrollbar"
        onScroll={e => { const el = e.currentTarget, m = el.scrollWidth - el.clientWidth; setCarP(m > 0 ? el.scrollLeft / m : 0); }}
        style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '22px clamp(16px,4cqw,40px) 4px', maxWidth: 1240, margin: '0 auto', scrollPadding: '0 clamp(16px,4cqw,40px)' }}
      >
        {featured.map(p => (
          <div key={p.id} style={{ flex: '0 0 clamp(170px,42cqw,268px)', scrollSnapAlign: 'start' }}><ProductCard p={p} /></div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '20px 16px 0' }}>
        <button onClick={() => scrollCar(-1)} style={pillBtn}>Previous</button>
        <div style={{ width: 'min(180px,34%)', height: 2, background: '#e3e3e0', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: -0.5, height: 3, width: `${Math.round(20 + carP * 80)}%`, background: '#111' }} />
        </div>
        <button onClick={() => scrollCar(1)} style={pillBtn}>Next</button>
      </div>

      <section style={{ ...PAGE, paddingTop: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 18 }}>
          <H2>Shop by league</H2>
          <button onClick={() => navigate('/categories')} style={{ border: 0, background: 'none', padding: 0, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            All categories<ArrowRightIcon />
          </button>
        </div>
        <LeagueTiles />
      </section>

      <section style={{ ...PAGE, paddingTop: 64 }}>
        <H2 style={{ marginBottom: 22 }}>How ordering works</H2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px),1fr))', gap: 24 }}>
          {STEPS.map(([n, t, d]) => (
            <div key={n} style={{ borderTop: '1px solid #111', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="mono" style={{ fontSize: 12, color: '#6b6b67' }}>{n}</span>
              <span style={{ fontSize: 18, fontWeight: 500 }}>{t}</span>
              <span style={{ fontSize: 14.5, color: '#5d5d59', lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ maxWidth: 1240, margin: '64px auto 0', padding: '22px clamp(16px,4cqw,40px) 28px', borderTop: '1px solid #ececea', display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'space-between', fontSize: 13, color: '#7a7a76' }}>
        <span>KITROOM · Football clothing catalogue</span>
        <span>Orders are confirmed manually by the seller</span>
      </footer>
    </main>
  );
}
