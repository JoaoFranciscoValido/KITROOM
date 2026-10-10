import type { CSSProperties } from 'react';
import type { Kit } from '../data/types';

export type ArtKit = Partial<Kit> & { type?: string; image?: string | null };

interface Props {
  kit: ArtKit;
  view?: 'front' | 'back' | 'detail';
  cname?: string;
  cnum?: string;
  tone?: 'light' | 'dark' | 'bare';
  artH?: string;
  style?: CSSProperties;
}

const SHADE =
  'linear-gradient(90deg, rgba(0,0,0,.24), rgba(0,0,0,0) 30%, rgba(255,255,255,.08) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,.24)), linear-gradient(180deg, rgba(255,255,255,.10), rgba(0,0,0,0) 40%, rgba(0,0,0,.14))';

/** Product image: the real photo when there is one, otherwise a colour illustration of the kit. */
export default function KitArt({ kit, view = 'front', cname = '', cnum = '', tone = 'light', artH = '76%', style }: Props) {
  const c = kit.c && kit.c.length ? kit.c : ['#bdbdb9'];
  const c1 = c[1] || c[0];
  const type = kit.type || 'Shirt';
  const pats: Record<string, string> = {
    stripes: `repeating-linear-gradient(90deg, ${c[0]} 0 11.1%, ${c1} 11.1% 22.2%)`,
    hoops: `repeating-linear-gradient(180deg, ${c[0]} 0 11%, ${c1} 11% 22%)`,
    sleeves: `linear-gradient(90deg, ${c1} 0 24.5%, ${c[0]} 24.5% 75.5%, ${c1} 75.5%)`,
    halves: `linear-gradient(90deg, ${c[0]} 0 50%, ${c1} 50%)`,
    sash: `linear-gradient(125deg, ${c[0]} 0 44%, ${c1} 44% 56%, ${c[0]} 56%)`,
    yoke: `linear-gradient(180deg, ${c1} 0 21%, ${c[0]} 21%)`,
  };
  const base = (kit.p && pats[kit.p]) || `linear-gradient(${c[0]}, ${c[0]})`;
  const isShorts = type === 'Shorts';
  const isLong = type === 'Tracksuit' || type === 'Jacket' || type === 'LongShirt';
  const hasZip = type === 'Tracksuit' || type === 'Jacket';
  const clip = isShorts
    ? 'polygon(14% 12%, 86% 12%, 95% 84%, 56% 90%, 50% 46%, 44% 90%, 5% 84%)'
    : isLong
      ? 'polygon(31% 5%, 41% 3%, 50% 8%, 59% 3%, 69% 5%, 86% 13%, 97% 85%, 86% 88%, 77% 35%, 78% 97%, 22% 97%, 23% 35%, 14% 88%, 3% 85%, 14% 13%)'
      : 'polygon(31% 5%, 41% 3%, 50% 8%, 59% 3%, 69% 5%, 97% 19%, 88% 39%, 76% 34%, 77% 97%, 23% 97%, 24% 34%, 12% 39%, 3% 19%)';
  const bgFill =
    tone === 'bare' ? 'transparent' : tone === 'dark' ? 'linear-gradient(180deg, #5d5e5b, #313230)' : 'linear-gradient(180deg, #e3e3e0, #c9c9c5)';
  const trim = kit.trim || '#ffffff';
  const ink = kit.ink || '#ffffff';
  const name = cname.trim();
  const num = cnum.trim();
  const showPrint = view === 'back' && !isShorts && type !== 'Casual' && !!(name || num);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: bgFill, ...style }}>
      {kit.image ? (
        <img
          src={kit.image}
          alt=""
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: view === 'detail' ? 'scale(2)' : 'none' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute', left: '50%', top: '50%', height: artH, aspectRatio: '1 / 1',
            transform: view === 'detail' ? 'translate(-50%,-50%) scale(2.6)' : 'translate(-50%,-50%)',
            transformOrigin: '60% 22%', containerType: 'size', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.22))',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, clipPath: clip, background: `${SHADE}, ${base}` }} />
          {!isShorts && (
            <div style={{ position: 'absolute', left: '39.5%', top: '2.6%', width: '21%', height: '7.6%', clipPath: 'polygon(0 0, 21% 0, 50% 62%, 79% 0, 100% 0, 50% 100%)', background: trim }} />
          )}
          {hasZip && view !== 'back' && <div style={{ position: 'absolute', left: '49.6%', width: '0.8%', top: '9%', bottom: '3%', background: trim }} />}
          {isShorts && <div style={{ position: 'absolute', left: '14%', right: '14%', top: '12%', height: '6%', background: trim }} />}
          {view !== 'back' && (
            <div
              style={{
                position: 'absolute', left: isShorts ? '64%' : '59%', top: isShorts ? '28%' : '18.5%', width: '7%', height: '8.5%',
                borderRadius: '30% 30% 50% 50%', background: trim, boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.18)',
              }}
            />
          )}
          {showPrint && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '18.5%', textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '7.5cqh', letterSpacing: '0.08em', lineHeight: 1, color: ink }}>{name}</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '27%', textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '31cqh', lineHeight: 1, color: ink }}>{num}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
