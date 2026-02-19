'use client';

import { useCallback, useRef, useState } from 'react';
import { useMapStore } from '@/store/mapStore';
import { preloadTiles } from '@/lib/tiles';
import { glitchBurst } from '@/lib/glitch';
import { GlitchText } from '../GlitchText';

export function OfflineButton() {
  const data = useMapStore((s) => s.data);
  const [state, setState] = useState<'idle' | 'caching' | 'done'>('idle');
  const [progress, setProgress] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);

  const onClick = useCallback(async () => {
    if (!data || state !== 'idle') return;
    setState('caching');

    await preloadTiles(data, (done, total) => {
      setProgress(`${done}/${total} tiles`);
      window.dispatchEvent(
        new CustomEvent('preload-progress', { detail: { done, total } }),
      );
    });

    setState('done');
  }, [data, state]);

  const className = `btn-offline ${state === 'caching' ? 'caching' : ''} ${state === 'done' ? 'done' : ''}`;

  return (
    <button
      className={className}
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={() => btnRef.current && glitchBurst(btnRef.current)}
      onMouseLeave={() => btnRef.current && glitchBurst(btnRef.current, true)}
    >
      {state === 'done' ? (
        <svg
          className="btn-offline-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6.5 5 9l4.5-6" />
        </svg>
      ) : (
        <svg
          className="btn-offline-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M6 2v6M3.5 5.5 6 8l2.5-2.5M2 10h8" />
        </svg>
      )}
      <GlitchText>
        {state === 'idle'
          ? 'Cache for Offline'
          : state === 'caching'
            ? progress || 'Caching...'
            : 'Cached for Offline'}
      </GlitchText>
    </button>
  );
}
