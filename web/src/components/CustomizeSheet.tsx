import { useCallback, type ChangeEvent } from 'react';
import { productById } from '../data/catalogue';
import { appendChip, teamSeason, CHAMFER, cleanName, cleanNum, kitOf, OTHER_CHIPS, RED, SPECIAL_SIZES } from '../lib/constants';
import { useStore } from '../lib/store';
import { CameraIcon } from './Icons';
import KitArt from './KitArt';
import Sheet from './Sheet';
import { inputStyle, OptionalNote, OtherChips, QtyStepper, SizeGrid, Tag, textareaStyle } from './ui';

/** Downscale a picked photo to max 900px and return it as a JPEG data URL. */
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const sc = Math.min(1, 900 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * sc);
        c.height = Math.round(img.height * sc);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = r.result as string;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function CustomizeSheet({ isDesktop }: { isDesktop: boolean }) {
  const { sheet: SH, setSheet, closeSheet, addLine, updLine, showToast } = useStore();
  const close = useCallback(() => closeSheet(), [closeSheet]);
  if (!SH) return null;

  const isSpecial = !!SH.special;
  const product = isSpecial ? null : productById[SH.productId];
  if (!isSpecial && !product) return null;
  const sizesSrc = isSpecial ? { sizes: SPECIAL_SIZES, out: [] } : product!;
  const isShirt = isSpecial || product!.type === 'Shirt';
  const ready = !!SH.size && (!isSpecial || (!!SH.image && !!(SH.title || '').trim()));
  const title = isSpecial
    ? SH.mode === 'edit' ? 'Edit special shirt' : 'Special shirt request'
    : SH.mode === 'edit' ? 'Edit customization' : isShirt ? 'Customize your shirt' : 'Choose your size';

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      setSheet({ image: await readPhoto(f), imgErr: false });
    } catch {
      setSheet({ imgErr: true });
    }
  };

  const confirm = () => {
    const d = SH;
    if (d.special) {
      const tOk = (d.title || '').trim().length > 0;
      if (!d.size || !d.image || !tOk) return setSheet({ err: !d.size, imgErr: !d.image, titleErr: !tOk });
      const sd = { productId: 'special', special: true, image: d.image, title: (d.title || '').trim(), size: d.size, name: d.name.trim(), number: d.number, other: d.other.trim(), qty: d.qty };
      if (d.mode === 'edit' && d.lineId) { updLine(d.lineId, sd); showToast('Special shirt updated'); } else addLine(sd);
      return closeSheet();
    }
    if (!d.size) return setSheet({ err: true });
    const data = { productId: d.productId, size: d.size, name: isShirt ? d.name.trim() : '', number: isShirt ? d.number : '', other: isShirt ? d.other.trim() : '', qty: d.qty };
    if (d.mode === 'edit' && d.lineId) { updLine(d.lineId, data); showToast('Customization updated'); } else addLine(data);
    closeSheet();
  };

  return (
    <Sheet
      title={title}
      onClose={close}
      isDesktop={isDesktop}
      maxWidth={520}
      maxHeight="92%"
      variant="form"
      footer={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 20px 20px', borderTop: '1px solid #ececea', marginTop: 10 }}>
          <QtyStepper qty={SH.qty} onChange={qty => setSheet({ qty })} size="md" />
          <button onClick={confirm} style={{ flex: 1, minWidth: 0, height: 54, borderRadius: 999, border: 0, background: ready ? '#111' : '#d8d8d4', color: ready ? '#fff' : '#6f6f6b', fontSize: 16, fontWeight: 600 }}>
            {SH.mode === 'edit' ? 'Save changes' : 'Add to cart'}
          </button>
        </div>
      }
    >
      {isSpecial ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Photo of the shirt</span>
            <Tag color={SH.imgErr ? RED : '#6b6b67'}>Required</Tag>
          </div>
          <label style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center', padding: 12, borderRadius: 16, border: `1.5px dashed ${SH.imgErr ? RED : '#c4c4c0'}`, background: '#fafaf8', cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: 84, aspectRatio: '4 / 5', flex: '0 0 auto', borderRadius: 10, overflow: 'hidden', background: '#ececea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {SH.image ? <img src={SH.image} alt="Your shirt photo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <CameraIcon size={28} color="#6b6b67" sw={1.6} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{SH.image ? 'Change photo' : 'Upload a photo'}</span>
              <span style={{ fontSize: 13, color: '#6b6b67', lineHeight: 1.4 }}>A clear photo of the shirt you want to order. JPG or PNG.</span>
            </div>
            <input type="file" accept="image/*" onChange={onFile} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
          </label>
          {SH.imgErr && <span style={{ color: RED, fontSize: 13.5 }}>Please add a photo of the shirt.</span>}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#45453f' }}>Shirt description <span style={{ color: RED }}>*</span></span>
            <input
              className="focus-dark"
              value={SH.title || ''}
              onChange={e => setSheet({ title: e.target.value.slice(0, 80), titleErr: false })}
              placeholder="e.g. Benfica 2010/11 away"
              style={inputStyle(SH.titleErr ? RED : '#d6d6d3')}
            />
            {SH.titleErr && <span style={{ color: RED, fontSize: 13.5 }}>Please describe the shirt (team, season, version).</span>}
          </label>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 84, aspectRatio: '4 / 5', flex: '0 0 auto', clipPath: CHAMFER }}>
            <KitArt kit={kitOf(product!)} view={isShirt ? 'back' : 'front'} cname={SH.name} cnum={SH.number} artH="84%" style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.25 }}>{product!.name}</span>
            <span style={{ fontSize: 13, color: '#6b6b67' }}>{teamSeason(product!)}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Size</span>
          <Tag color={SH.err ? RED : '#6b6b67'}>Required</Tag>
        </div>
        <SizeGrid product={sizesSrc} value={SH.size} onPick={size => setSheet({ size, err: false })} height={48} />
        {SH.err && <span style={{ color: RED, fontSize: 13.5 }}>Please select a size to continue.</span>}
      </div>

      {isShirt && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 10 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#45453f' }}>Name <OptionalNote /></span>
              <input className="focus-dark" value={SH.name} onChange={e => setSheet({ name: cleanName(e.target.value) })} placeholder="e.g. MESSI" style={{ ...inputStyle(), letterSpacing: '0.04em' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#45453f' }}>Number <OptionalNote /></span>
              <input className="focus-dark" value={SH.number} onChange={e => setSheet({ number: cleanNum(e.target.value) })} inputMode="numeric" placeholder="10" style={inputStyle()} />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#45453f' }}>Other customization <OptionalNote /></span>
            <textarea className="focus-dark" value={SH.other} onChange={e => setSheet({ other: e.target.value })} rows={2} placeholder="Patches, league badges, sleeve sponsor, other requests" style={textareaStyle()} />
          </label>
          <OtherChips chips={OTHER_CHIPS} onPick={t => setSheet({ other: appendChip(SH.other, t) })} />
        </div>
      )}
    </Sheet>
  );
}
