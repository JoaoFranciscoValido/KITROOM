import { Navigate, useNavigate } from 'react-router-dom';
import { H1, PAGE, plural } from '../components/ui';
import { RED } from '../lib/constants';
import { useStore, validateCustomer, type Contact } from '../lib/store';
import { Stepper } from './Cart';

const CONTACTS: Contact[] = ['WhatsApp', 'SMS', 'Phone call'];

export default function Details() {
  const navigate = useNavigate();
  const { cart, customer: c, setCustomer, cErr, setCErr } = useStore();
  if (!cart.length) return <Navigate to="/cart" replace />;
  const qty = cart.reduce((a, l) => a + l.qty, 0);
  const field = (k: 'name' | 'phone' | 'email') => ({
    className: 'focus-dark',
    'aria-invalid': !!cErr[k],
    style: { width: '100%', height: 54, borderRadius: 14, border: `1px solid ${cErr[k] ? RED : '#d6d6d3'}`, padding: '0 16px', fontSize: 16, background: '#fff', outline: 'none' } as const,
  });
  const label = { fontSize: 14, fontWeight: 500 } as const;
  const errText = (k: 'name' | 'phone' | 'email') => cErr[k] && <span style={{ fontSize: 13, color: RED }}>{cErr[k]}</span>;
  const toReview = () => {
    const e = validateCustomer(c);
    if (Object.keys(e).length) return setCErr(e);
    navigate('/review');
  };

  return (
    <>
      <Stepper step={1} />
      <main style={{ ...PAGE, paddingTop: 24, paddingBottom: 48 }}>
        <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <H1>Your details</H1>
          <p style={{ margin: 0, fontSize: 15, color: '#5d5d59', lineHeight: 1.5 }}>
            The seller uses these details to confirm your order request. Your phone number is needed so they can reach you on WhatsApp, by SMS or with a call.
          </p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>Full name <span style={{ color: RED }}>*</span></span>
            <input {...field('name')} value={c.name} onChange={e => setCustomer({ name: e.target.value })} placeholder="e.g. João Ferreira" autoComplete="name" />
            {errText('name')}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>Phone number <span style={{ color: RED }}>*</span></span>
            <input {...field('phone')} value={c.phone} onChange={e => setCustomer({ phone: e.target.value.replace(/[^\d+ ()-]/g, '') })} type="tel" placeholder="+351 912 345 678" autoComplete="tel" />
            {errText('phone')}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>Email <span style={{ color: '#8a8a86', fontWeight: 400 }}>· optional</span></span>
            <input {...field('email')} value={c.email} onChange={e => setCustomer({ email: e.target.value })} type="email" placeholder="name@email.com" autoComplete="email" />
            {errText('email')}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={label}>Preferred contact</span>
            <div role="radiogroup" aria-label="Preferred contact" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 6, padding: 4, borderRadius: 999, background: '#f1f1ee' }}>
              {CONTACTS.map(o => (
                <button key={o} role="radio" aria-checked={c.contact === o} onClick={() => setCustomer({ contact: o })} style={{ height: 44, borderRadius: 999, border: 0, background: c.contact === o ? '#fff' : 'transparent', fontSize: 14, fontWeight: 500, boxShadow: c.contact === o ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>Notes or additional request <span style={{ color: '#8a8a86', fontWeight: 400 }}>· optional</span></span>
            <textarea className="focus-dark" value={c.notes} onChange={e => setCustomer({ notes: e.target.value })} rows={3} placeholder="Delivery or pickup preferences, deadlines, questions for the seller" style={{ width: '100%', borderRadius: 14, border: '1px solid #d6d6d3', padding: '14px 16px', fontSize: 16, background: '#fff', outline: 'none', resize: 'vertical', lineHeight: 1.45 }} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 16px', borderRadius: 16, background: '#f4f4f1', fontSize: 14 }}>
            <span>{plural(qty)} in your request</span>
            <button onClick={() => navigate('/cart')} style={{ border: 0, background: 'none', padding: 0, fontSize: 14, fontWeight: 500, textDecoration: 'underline' }}>Edit cart</button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/cart')} style={{ flex: '1 1 140px', height: 56, borderRadius: 999, border: '1px solid #d4d4d1', background: '#fff', fontSize: 15, fontWeight: 500 }}>Back to cart</button>
            <button onClick={toReview} style={{ flex: '2 1 220px', height: 56, borderRadius: 999, border: 0, background: '#111', color: '#fff', fontSize: 16, fontWeight: 600 }}>Review order request</button>
          </div>
        </div>
      </main>
    </>
  );
}
