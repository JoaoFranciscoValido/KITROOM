import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { categoryLabel, productById } from '../data/catalogue';
import type { Product } from '../data/types';
import { BagIcon, HeartIcon } from '../components/Icons';
import KitArt from '../components/KitArt';
import { inputStyle, OptionalNote, OtherChips, PAGE, QtyStepper, SizeGrid, Tag, textareaStyle } from '../components/ui';
import { appendChip, AV, CHAMFER, cleanName, cleanNum, descOf, kitOf, OTHER_CHIPS, OVAL, RED } from '../lib/constants';
import { useStore } from '../lib/store';

type View = 'front' | 'back' | 'detail';

export default function ProductDetailRoute() {
  const { id = '' } = useParams();
  const p = productById[id];
  if (!p) return <Navigate to="/catalogue" replace />;
  return <ProductDetail key={p.id} p={p} />;
}

function ProductDetail({ p }: { p: Product }) {
  const { favs, toggleFav, addLine } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [other, setOther] = useState('');
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<View>('front');
  const [imgIdx, setImgIdx] = useState(0);
  const [err, setErr] = useState(false);

  const isShirt = p.type === 'Shirt';
  const kit = kitOf(p);
  const photos = p.images;
  const hasPhotos = photos.length > 0;
  const pi = Math.min(imgIdx, Math.max(0, photos.length - 1));
  const fav = favs.includes(p.id);

  const gal = hasPhotos ? { kit: { ...kit, image: photos[pi] }, view: 'front' as View, cname: '', cnum: '' } : { kit, view, cname: name, cnum: number };
  const thumbs = hasPhotos
    ? photos.map((u, i) => ({ key: u + i, view: 'front' as View, kit: { ...kit, image: u }, cname: '', cnum: '', on: pi === i, clip: CHAMFER, label: `Photo ${i + 1}`, pick: () => setImgIdx(i) }))
    : (isShirt ? (['front', 'back', 'detail'] as View[]) : (['front', 'detail'] as View[])).map(v => ({
        key: v, view: v, kit, cname: name, cnum: number, on: view === v, clip: v === 'detail' ? OVAL : CHAMFER, label: v, pick: () => setView(v),
      }));
  const viewLabel = hasPhotos
    ? `Photo ${pi + 1} of ${photos.length}`
    : { front: 'Front', back: name || number ? 'Back · your print preview' : 'Back', detail: 'Detail' }[view];

  const add = () => {
    if (!size) return setErr(true);
    addLine({ productId: p.id, size, name: isShirt ? name.trim() : '', number: isShirt ? number : '', other: isShirt ? other.trim() : '', qty });
  };
  const toBack = () => setView('back');

  return (
    <main style={{ ...PAGE, paddingTop: 20, paddingBottom: 48, display: 'flex', flexWrap: 'wrap', gap: '28px 56px', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', maxHeight: 760, clipPath: !hasPhotos && view === 'detail' ? OVAL : CHAMFER, overflow: 'hidden' }}>
          <KitArt kit={gal.kit} view={gal.view} cname={gal.cname} cnum={gal.cnum} artH="80%" style={{ position: 'absolute', inset: 0 }} />
          <span style={{ position: 'absolute', left: 14, bottom: 14, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', fontSize: 12, fontWeight: 500 }}>{viewLabel}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {thumbs.map(t => (
            <button key={t.key} onClick={t.pick} aria-label={t.label} aria-pressed={t.on} style={{ position: 'relative', width: 72, aspectRatio: '4 / 5', padding: 0, background: '#fff', border: `2px solid ${t.on ? '#111' : 'transparent'}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 3, clipPath: t.clip, overflow: 'hidden' }}>
                <KitArt kit={t.kit} view={t.view} cname={t.cname} cnum={t.cnum} style={{ position: 'absolute', inset: 0 }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="mono" style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b6b67' }}>{categoryLabel(p.cat)} · {p.league}</span>
          <h1 style={{ margin: 0, fontWeight: 400, fontSize: 'clamp(30px,4.4cqw,48px)', lineHeight: 1.04, textTransform: 'uppercase', letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}>{p.name}</h1>
          <span style={{ fontSize: 15, color: '#5d5d59' }}>{p.team} · {p.country} · Season {p.season}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: '#f1f1ee', fontSize: 13, fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: AV[p.av].dot }} />{AV[p.av].label}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 15, lineHeight: 1.55, color: '#45453f' }}>{descOf(p)}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Size</span>
            <Tag color={err ? RED : '#6b6b67'}>Required</Tag>
          </div>
          <SizeGrid product={p} value={size} onPick={s => { setSize(s); setErr(false); }} />
          {err && <span style={{ color: RED, fontSize: 13.5 }}>Please select a size before adding this item to your cart.</span>}
        </div>

        {isShirt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 20, background: '#f4f4f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Personalise your shirt</span>
              <Tag>Optional</Tag>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 10 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#45453f' }}>Name <OptionalNote /></span>
                <input className="focus-dark" value={name} onChange={e => { setName(cleanName(e.target.value)); toBack(); }} onFocus={toBack} placeholder="e.g. MESSI" style={{ ...inputStyle(), letterSpacing: '0.04em' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#45453f' }}>Number <OptionalNote /></span>
                <input className="focus-dark" value={number} onChange={e => { setNumber(cleanNum(e.target.value)); toBack(); }} onFocus={toBack} inputMode="numeric" placeholder="10" style={inputStyle()} />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#45453f' }}>Other customization <OptionalNote /></span>
              <textarea className="focus-dark" value={other} onChange={e => setOther(e.target.value)} rows={2} placeholder="Patches, league badges, sleeve sponsor, other requests" style={textareaStyle()} />
            </label>
            <OtherChips chips={OTHER_CHIPS} onPick={t => setOther(o => appendChip(o, t))} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <QtyStepper qty={qty} onChange={setQty} />
            <button onClick={add} style={{ flex: 1, minWidth: 0, height: 54, borderRadius: 999, border: 0, background: size ? '#111' : '#d8d8d4', color: size ? '#fff' : '#6f6f6b', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <BagIcon color="currentColor" />
              Add to cart
            </button>
            <button onClick={() => toggleFav(p.id)} aria-label={fav ? 'Remove from favourites' : 'Save to favourites'} aria-pressed={fav} style={{ flex: '0 0 auto', width: 54, height: 54, borderRadius: '50%', border: '1px solid #d4d4d1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartIcon size={21} fill={fav ? '#111' : 'none'} />
            </button>
          </div>
          {!size && !err && <span style={{ fontSize: 13, color: '#6b6b67' }}>Select a size to add this item to your cart.</span>}
        </div>
        <div style={{ borderTop: '1px solid #ececea', paddingTop: 16, fontSize: 13.5, color: '#5d5d59', lineHeight: 1.5 }}>
          No online payment. After you send your request, the seller confirms availability and customization details with you.
        </div>
      </div>
    </main>
  );
}
