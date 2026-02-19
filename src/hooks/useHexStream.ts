'use client';

import { useEffect, useRef } from 'react';

export function useHexStream(): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (!ref.current) return;
      let s = '';
      for (let i = 0; i < 28; i++) s += Math.floor(Math.random() * 16).toString(16);
      ref.current.textContent = s
        .toUpperCase()
        .match(/.{4}/g)!
        .join(' ');
    }, 120);
    return () => clearInterval(id);
  }, []);

  return ref;
}
