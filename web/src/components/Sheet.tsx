import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './Icons';

/** Modal sheet: bottom sheet on mobile, centred dialog on desktop. */
export default function Sheet({ title, onClose, isDesktop, maxWidth, maxHeight, children, footer, variant }: {
  title: string; onClose: () => void; isDesktop: boolean; maxWidth: number; maxHeight: string;
  children: ReactNode; footer: ReactNode; variant: 'filters' | 'form';
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(17,17,17,0.45)', display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth, maxHeight, background: '#fff', borderRadius: isDesktop ? 24 : '26px 26px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: variant === 'filters' ? '18px 20px 10px' : '18px 20px 6px' }}>
          <span style={{ fontSize: 20, fontWeight: 500, textTransform: 'uppercase' }}>{title}</span>
          <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #e3e3e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: variant === 'filters' ? '4px 20px 16px' : '10px 20px 4px', display: 'flex', flexDirection: 'column', gap: variant === 'filters' ? 20 : 18 }}>
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}
