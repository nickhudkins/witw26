'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMapContext } from '@/contexts/MapContext';

export interface HudRefs {
  latRef: React.RefObject<HTMLSpanElement | null>;
  lngRef: React.RefObject<HTMLSpanElement | null>;
  zoomRef: React.RefObject<HTMLSpanElement | null>;
  bearingRef: React.RefObject<HTMLSpanElement | null>;
}

export function useHudValues(mapReady: boolean): HudRefs {
  const { mapRef } = useMapContext();
  const latRef = useRef<HTMLSpanElement>(null);
  const lngRef = useRef<HTMLSpanElement>(null);
  const zoomRef = useRef<HTMLSpanElement>(null);
  const bearingRef = useRef<HTMLSpanElement>(null);

  const update = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    if (latRef.current) latRef.current.innerHTML = `${c.lat.toFixed(4)}<span class="deg">\u00b0</span>`;
    if (lngRef.current) lngRef.current.innerHTML = `${c.lng.toFixed(4)}<span class="deg">\u00b0</span>`;
    if (zoomRef.current) zoomRef.current.textContent = map.getZoom().toFixed(1);
    const b = Math.round((map.getBearing() + 360) % 360);
    if (bearingRef.current)
      bearingRef.current.innerHTML = `<span class="hi">${String(b).padStart(3, '0')}</span>\u00b0`;
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    map.on('move', update);
    map.on('zoom', update);
    update();

    return () => {
      map.off('move', update);
      map.off('zoom', update);
    };
  }, [mapRef, mapReady, update]);

  return { latRef, lngRef, zoomRef, bearingRef };
}
