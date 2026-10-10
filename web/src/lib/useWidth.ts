import { useEffect, useState } from 'react';

export function useWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

/** Desktop layout (top nav, centred sheets) from 860px; otherwise bottom nav and bottom sheets. */
export const useIsDesktop = () => useWidth() >= 860;
