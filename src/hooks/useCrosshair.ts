'use client';

import { useRef, useCallback } from 'react';
import { hexToRgb } from '@/lib/utils';
import { useMapContext } from '@/contexts/MapContext';

export interface CrosshairRefs {
  elRef: React.RefObject<HTMLDivElement | null>;
  hRef: React.RefObject<HTMLDivElement | null>;
  hgRef: React.RefObject<HTMLDivElement | null>;
  vRef: React.RefObject<HTMLDivElement | null>;
  vgRef: React.RefObject<HTMLDivElement | null>;
  diamondRef: React.RefObject<HTMLDivElement | null>;
  bloomRef: React.RefObject<HTMLDivElement | null>;
  show: (x: number, y: number, color: string) => void;
  hide: () => void;
  showAtCoords: (lngLat: [number, number], color: string) => void;
}

export function useCrosshair(): CrosshairRefs {
  const elRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const hgRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const vgRef = useRef<HTMLDivElement>(null);
  const diamondRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const { mapRef } = useMapContext();

  const show = useCallback((x: number, y: number, color: string) => {
    const rgb = hexToRgb(color);
    if (elRef.current) elRef.current.classList.add('active');

    if (hRef.current) {
      hRef.current.style.top = y + 'px';
      hRef.current.style.background = `linear-gradient(90deg, transparent, rgba(${rgb},0) 5%, rgba(${rgb},0.55) 25%, rgba(${rgb},1) 50%, rgba(${rgb},0.55) 75%, rgba(${rgb},0) 95%, transparent)`;
    }
    if (hgRef.current) {
      hgRef.current.style.top = y + 'px';
      hgRef.current.style.background = color;
    }
    if (vRef.current) {
      vRef.current.style.left = x + 'px';
      vRef.current.style.background = `linear-gradient(0deg, transparent, rgba(${rgb},0) 5%, rgba(${rgb},0.55) 25%, rgba(${rgb},1) 50%, rgba(${rgb},0.55) 75%, rgba(${rgb},0) 95%, transparent)`;
    }
    if (vgRef.current) {
      vgRef.current.style.left = x + 'px';
      vgRef.current.style.background = color;
    }
    if (diamondRef.current) {
      diamondRef.current.style.top = y + 'px';
      diamondRef.current.style.left = x + 'px';
      diamondRef.current.style.borderColor = color;
      diamondRef.current.style.boxShadow = `0 0 10px ${color}, 0 0 24px rgba(${rgb},0.35)`;
    }
    if (bloomRef.current) {
      bloomRef.current.style.top = y + 'px';
      bloomRef.current.style.left = x + 'px';
      bloomRef.current.style.background = color;
    }
  }, []);

  const hide = useCallback(() => {
    if (elRef.current) elRef.current.classList.remove('active');
  }, []);

  const showAtCoords = useCallback(
    (lngLat: [number, number], color: string) => {
      const map = mapRef.current;
      if (!map) return;
      const pt = map.project(lngLat);
      show(pt.x, pt.y, color);
    },
    [mapRef, show],
  );

  return { elRef, hRef, hgRef, vRef, vgRef, diamondRef, bloomRef, show, hide, showAtCoords };
}
