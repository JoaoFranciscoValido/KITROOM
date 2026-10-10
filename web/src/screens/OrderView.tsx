import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, ReadTicks } from '../components/Icons';
import KitArt from '../components/KitArt';
import { H1, PAGE, plural } from '../components/ui';
import { LIME } from '../lib/constants';
import { customerRows, formatDate, formatTime, lineView, orderText, whatsappHref } from '../lib/order';
import { useStore, validateCustomer } from '../lib/store';
import { Stepper } from './Cart';

/** Review (/review) and confirmation (/submitted) screens: the order as the seller receives it. */
export default function OrderView({ mode }: { mode: 'review' | 'done' }) {
  const navigate = useNavigate();
  const { cart, customer, order, submitOrder, setCErr, showToast } = useStore();
  const isDone = mode === 'done';

  if (isDone && !order) return <Navigate to="/" replace />;
  if (!isDone && !cart.length) return <Navigate to="/cart" replace />;

  const src = isDone ? order! : { ref: null, date: new Date().toISOString(), lines: cart, customer };
  const dt = new Date(src.date);
  const lines = src.lines.map(lineView);
  const cust = customerRows(src.customer);
  const dateLabel = formatDate(dt);
  const time = formatTime(dt);
  const text = orderText(src.ref, dateLabel, lines, cust);
  const refLabel = src.ref ? 'Order request ' + src.ref : 'Order request (reference assigned on submit)';
  const qty = src.lines.reduce((a, l) => a + l.qty, 0);

  const submit = () => {
    const e = validateCustomer(customer);
    if (Object.keys(e).length) { setCErr(e); navigate('/details'); return; }
    if (submitOrder()) navigate('/submitted', { replace: true });
  };
  const copy = () => {
    try {
      navigator.clipboard.writeText(text).then(() => showToast('Order summary copied'), () => showToast('Could not copy'));
    } catch {
      showToast('Could not copy');
    }
  };

  const bubble = { alignSelf: 'flex-end', width: 'min(88%, 330px)', background: '#1f4a35', borderRadius: '14px 14px 4px 14px' } as const;
  const stamp = (
    <span style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.62)', marginTop: 2 }}>
      {time}<ReadTicks />
    </span>
  );
  const panelRows = (rows: { k: string; v: string }[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '6px 16px', fontSize: 14 }}>
      {rows.map(r => (
        <div key={r.k} style={{ display: 'contents' }}>
          <span style={{ color: '#6b6b67' }}>{r.k}</span><span style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{r.v}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {!isDone && <Stepper step={2} />}
      <main style={{ ...PAGE, paddingTop: 24, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {isDone ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, maxWidth: 640 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: LIME, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon /></div>
            <H1>Order request submitted</H1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span className="mono" style={{ padding: '7px 12px', borderRadius: 999, background: '#111', color: '#fff', fontSize: 13, letterSpacing: '0.04em' }}>{src.ref}</span>
              <span style={{ padding: '7px 12px', borderRadius: 999, background: '#f1f1ee', fontSize: 13 }}>{dateLabel}</span>
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: '#2c2c28' }}>Your order request has been submitted. We will contact you to confirm availability, customization details and the next steps.</p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#6b6b67' }}>This is not an online payment or an automatic purchase. The seller reviews your request manually.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
            <H1>Review your request</H1>
            <p style={{ margin: 0, fontSize: 15, color: '#5d5d59', lineHeight: 1.5 }}>This is how the seller receives your order. Check sizes, names and numbers before you submit.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 48px', alignItems: 'flex-start' }}>
          {/* Chat preview */}
          <div style={{ flex: '1 1 360px', maxWidth: 520, minWidth: 0, borderRadius: 26, backgroundColor: '#0f1a15', backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)', backgroundSize: '16px 16px', paddingBottom: 18, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#16241d' }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: LIME, color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>K</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>KITROOM · Orders</span>
                <span className="mono" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{refLabel}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
              <span style={{ padding: '4px 10px', borderRadius: 8, background: '#1d2b24', color: 'rgba(255,255,255,0.7)', fontSize: 11.5 }}>{isDone ? 'Today' : 'Preview'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 12px 0' }}>
              {/* Message 1 per item: shirt image + size, name, Nº number */}
              {lines.map(l => (
                <div key={l.id} style={{ ...bubble, padding: 4, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', borderRadius: 11, overflow: 'hidden' }}>
                    <KitArt kit={l.kit} tone="dark" artH="82%" style={{ position: 'absolute', inset: 0 }} />
                  </div>
                  <div style={{ padding: '8px 8px 2px', color: '#fff', fontSize: 14.5, lineHeight: 1.45, display: 'flex', flexDirection: 'column' }}>
                    {l.first.map((t, i) => <span key={i} style={{ fontSize: 16.5, lineHeight: 1.3, overflowWrap: 'anywhere' }}>{t}</span>)}
                    {stamp}
                  </div>
                </div>
              ))}
              {/* Message 2: everything else */}
              <div style={{ ...bubble, padding: '10px 12px 6px', color: '#fff', fontSize: 14.5, lineHeight: 1.5, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{refLabel}</span>
                {lines.map(l => (
                  <div key={l.id} style={{ display: 'flex', flexDirection: 'column', paddingTop: 8 }}>
                    <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{l.n}. {l.name}</span>
                    {l.rest.map(r => <span key={r.k} style={{ overflowWrap: 'anywhere' }}>{r.k}: {r.v}</span>)}
                  </div>
                ))}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '10px 0 6px' }} />
                {cust.map(r => <span key={r.k} style={{ overflowWrap: 'anywhere' }}>{r.k}: <span style={{ fontWeight: 600 }}>{r.v}</span></span>)}
                {stamp}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>
            {isDone ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 22, borderRadius: 22, background: '#f4f4f1' }}>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>Order details</span>
                  {panelRows([
                    { k: 'Reference', v: src.ref! }, { k: 'Submitted', v: dateLabel }, { k: 'Products', v: String(qty) },
                    { k: 'Customer', v: src.customer.name }, { k: 'Phone', v: src.customer.phone }, { k: 'Contact via', v: src.customer.contact },
                  ])}
                </div>
                <a className="btn-dark" href={whatsappHref(text)} target="_blank" rel="noopener noreferrer" style={{ height: 56, borderRadius: 999, background: '#111', color: '#fff', fontSize: 15.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  Send summary on WhatsApp
                </a>
                <button onClick={copy} style={{ height: 56, borderRadius: 999, border: '1px solid #d4d4d1', background: '#fff', fontSize: 15, fontWeight: 500 }}>Copy order summary</button>
                <button onClick={() => navigate('/')} style={{ height: 48, border: 0, background: 'none', fontSize: 15, fontWeight: 500, textDecoration: 'underline' }}>Continue browsing</button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 22, borderRadius: 22, background: '#f4f4f1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 17, fontWeight: 600 }}>Contact details</span>
                    <button onClick={() => navigate('/details')} style={{ border: 0, background: 'none', padding: 0, fontSize: 14, fontWeight: 500, textDecoration: 'underline' }}>Edit</button>
                  </div>
                  {panelRows(cust)}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #e0e0dc', fontSize: 14 }}>
                    <span>{plural(qty)}</span>
                    <button onClick={() => navigate('/cart')} style={{ border: 0, background: 'none', padding: 0, fontSize: 14, fontWeight: 500, textDecoration: 'underline' }}>Edit cart</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 16, border: '1px solid #e3e3e0', fontSize: 13.5, lineHeight: 1.5, color: '#45453f' }}>
                  <span style={{ flex: '0 0 auto', width: 8, height: 8, marginTop: 6, borderRadius: '50%', background: LIME, border: '1px solid #111' }} />
                  Submitting does not charge you or complete a purchase. The seller reviews the request and contacts you to confirm availability and customization details.
                </div>
                <button className="hover-lime" onClick={submit} style={{ height: 60, borderRadius: 999, border: 0, background: LIME, color: '#111', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  Submit Order Request<ArrowRightIcon size={18} sw={2} />
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
