'use client';

import { useEffect, useRef } from 'react';

export function useClock(): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    function tick() {
      const d = new Date();
      const yr = d.getUTCFullYear();
      const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dy = String(d.getUTCDate()).padStart(2, '0');
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
      const colonVis = d.getUTCSeconds() % 2 === 0 ? '' : ' off';
      if (ref.current)
        ref.current.innerHTML =
          `<span class="clock-date">${yr}-${mo}-${dy}</span>${h}<span class="clock-colon">:</span>${m}<span class="clock-colon${colonVis}">:</span>${s}<span class="clock-ms">.${ms}</span><span class="clock-z">Z</span>`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return ref;
}
