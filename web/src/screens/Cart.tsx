import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, BagIcon, CameraIcon, EditIcon, PlusIcon, TrashIcon } from '../components/Icons';
import KitArt from '../components/KitArt';
import { Count, H1, PAGE, plural, QtyStepper } from '../components/ui';
import { CHAMFER, LIME } from '../lib/constants';
import { lineView } from '../lib/order';
import { useStore } from '../lib/store';

export function EmptyState({ icon, title, text, actions }: { icon: ReactNode; title: string; text: string; actions: ReactNode }) {
  return (
    <div style={{ padding: '64px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
      <div style={{ width: 92, height: 92, borderRadius: '50%', background: '#f1f1ee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
      <span style={{ fontSize: 22, fontWeight: 500, textTransform: 'uppercase' }}>{title}</span>
      <span style={{ fontSize: 15, color: '#6b6b67', maxWidth: 320, lineHeight: 1.5 }}>{text}</span>
      {actions}
    </div>
  );
}

export function Stepper({ step }: { step: 0 | 1 | 2 }) {
  const navigate = useNavigate();
  const labels = ['Cart', 'Your details', 'Review'];
  const paths = ['/cart', '/details', '/review'];
  return (
    <div style={{ ...PAGE, paddingTop: 22 }}>
      <nav aria-label="Checkout steps" style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 520 }}>
        {labels.map((l, i) => (
          <div key={l} style={{ display: 'contents' }}>
            <button onClick={() => i < step && navigate(paths[i])} aria-current={i === step ? 'step' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 0, background: 'none', padding: 0, flex: '0 0 auto' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${i <= step ? '#111' : '#d4d4d1'}`, background: i <= step ? '#111' : '#fff', color: i <= step ? '#fff' : '#8a8a86', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: i === step ? '#111' : '#8a8a86' }}>{l}</span>
            </button>
            {i < 2 && <span style={{ flex: 1, height: 1, minWidth: 12, background: i < step ? '#111' : '#d4d4d1' }} />}
          </div>
        ))}
      </nav>
    </div>
  );
}

const dashed = { borderRadius: 16, border: '1.5px dashed #c4c4c0', background: '#fff', fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } as const;

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updLine, rmLine, editLine, openSpecial } = useStore();
  const qty = cart.reduce((a, l) => a + l.qty, 0);
  const empty = cart.length === 0;

  return (
    <>
      {!empty && <Stepper step={0} />}
      <main style={{ ...PAGE, paddingTop: 24, paddingBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
          <H1>Your cart</H1>
          <Count>{plural(qty)}</Count>
        </div>
        {empty ? (
          <EmptyState
            icon={<BagIcon size={36} sw={1.5} />}
            title="Your cart is empty"
            text="Add a shirt, choose your size and personalise it. You can send the request when you are ready."
            actions={
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                <button onClick={() => navigate('/catalogue')} style={{ height: 52, padding: '0 28px', borderRadius: 999, border: 0, background: '#111', color: '#fff', fontSize: 15, fontWeight: 600 }}>Browse catalogue</button>
                <button onClick={() => navigate('/favourites')} style={{ height: 52, padding: '0 24px', borderRadius: 999, border: '1px solid #d4d4d1', background: '#fff', fontSize: 15, fontWeight: 500 }}>View favourites</button>
              </div>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 48px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 440px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {cart.map((line, i) => {
                const l = lineView(line, i);
                return (
                  <div key={l.id} style={{ display: 'flex', gap: 14, padding: '18px 0', borderBottom: '1px solid #ececea' }}>
                    <button
                      onClick={() => (l.productId ? navigate('/product/' + l.productId) : editLine(line))}
                      aria-label={l.productId ? 'Open product' : 'Edit special shirt'}
                      style={{ flex: '0 0 auto', position: 'relative', width: 'clamp(92px,22cqw,128px)', aspectRatio: '4 / 5', padding: 0, border: 0, clipPath: CHAMFER, overflow: 'hidden', alignSelf: 'flex-start' }}
                    >
                      <KitArt kit={l.kit} view={l.thumbView} cname={l.cname} cnum={l.cnum} style={{ position: 'absolute', inset: 0 }} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15.5, fontWeight: 500, lineHeight: 1.25 }}>{l.name}</div>
                        <div style={{ fontSize: 13, color: '#6b6b67', marginTop: 2 }}>{l.meta}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '4px 14px', fontSize: 13.5 }}>
                        {l.specs.map(sp => (
                          <div key={sp.k} style={{ display: 'contents' }}>
                            <span className="mono" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7a7a76', paddingTop: 2 }}>{sp.k}</span>
                            <span style={{ color: sp.v === 'None' ? '#9a9a96' : '#111', fontWeight: 500, overflowWrap: 'anywhere' }}>{sp.v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <QtyStepper qty={l.qty} onChange={q => updLine(l.id, { qty: q })} size="sm" />
                        <span style={{ flex: 1 }} />
                        <button onClick={() => editLine(line)} style={{ height: 40, padding: '0 10px', border: 0, background: 'none', fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><EditIcon />Edit</button>
                        <button onClick={() => rmLine(l.id)} style={{ height: 40, padding: '0 4px 0 10px', border: 0, background: 'none', fontSize: 13.5, fontWeight: 500, color: '#c4321f', display: 'flex', alignItems: 'center', gap: 6 }}><TrashIcon />Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button className="hover-dark-border" onClick={() => navigate('/catalogue')} style={{ ...dashed, marginTop: 18, height: 56 }}>
                <PlusIcon />Add another product
              </button>
              <button className="hover-dark-border" onClick={openSpecial} style={{ ...dashed, marginTop: 10, minHeight: 56, padding: '10px 16px', textAlign: 'center' }}>
                <CameraIcon />Add a special shirt (not in the catalogue)
              </button>
            </div>
            <aside style={{ flex: '1 1 300px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 14, padding: 22, borderRadius: 22, background: '#f4f4f1', position: 'sticky', top: 80 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>Order summary</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5 }}><span style={{ color: '#5d5d59' }}>Products</span><span style={{ fontWeight: 500 }}>{qty}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5 }}><span style={{ color: '#5d5d59' }}>Different items</span><span style={{ fontWeight: 500 }}>{cart.length}</span></div>
              <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 14, background: '#fff', fontSize: 13, lineHeight: 1.45, color: '#45453f' }}>
                <span style={{ flex: '0 0 auto', width: 8, height: 8, marginTop: 5, borderRadius: '50%', background: LIME, border: '1px solid #111' }} />
                No payment is taken online. You are sending a request that the seller reviews and confirms with you.
              </div>
              <button onClick={() => navigate('/details')} style={{ height: 56, borderRadius: 999, border: 0, background: '#111', color: '#fff', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                Continue to your details<ArrowRightIcon size={18} color="#fff" />
              </button>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
