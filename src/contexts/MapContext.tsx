'use client';

import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';
import type { Map as MaplibreMap } from 'maplibre-gl';
import type { RouteFeature } from '@/lib/types';
import { hexToRgb } from '@/lib/utils';
import { useMapStore } from '@/store/mapStore';
import { COLORS } from '@/lib/constants';

interface CrosshairMethods {
  show: (x: number, y: number, color: string) => void;
  hide: () => void;
  showAtCoords: (lngLat: [number, number], color: string) => void;
}

interface MapContextValue {
  mapRef: React.RefObject<MaplibreMap | null>;
  flyToRoute: (route: RouteFeature) => void;
  flyToPoint: (coords: [number, number]) => void;
  snapToSelection: () => void;
  crosshairRefs: {
    elRef: React.RefObject<HTMLDivElement | null>;
    hRef: React.RefObject<HTMLDivElement | null>;
    hgRef: React.RefObject<HTMLDivElement | null>;
    vRef: React.RefObject<HTMLDivElement | null>;
    vgRef: React.RefObject<HTMLDivElement | null>;
    diamondRef: React.RefObject<HTMLDivElement | null>;
    bloomRef: React.RefObject<HTMLDivElement | null>;
  };
  crosshair: CrosshairMethods;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<MaplibreMap | null>(null);

  // Crosshair DOM refs
  const elRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const hgRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const vgRef = useRef<HTMLDivElement>(null);
  const diamondRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);

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

  const showAtCoords = useCallback((lngLat: [number, number], color: string) => {
    const map = mapRef.current;
    if (!map) return;
    const pt = map.project(lngLat);
    show(pt.x, pt.y, color);
  }, [show]);

  const flyToRoute = useCallback((route: RouteFeature) => {
    const map = mapRef.current;
    if (!map) return;
    const cs = route.geometry.coordinates;
    let b = [Infinity, Infinity, -Infinity, -Infinity];
    cs.forEach(([x, y]) => {
      b[0] = Math.min(b[0], x);
      b[1] = Math.min(b[1], y);
      b[2] = Math.max(b[2], x);
      b[3] = Math.max(b[3], y);
    });
    map.fitBounds(
      [
        [b[0], b[1]],
        [b[2], b[3]],
      ],
      { padding: 80, duration: 1500 },
    );
  }, []);

  const flyToPoint = useCallback((c: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: c, zoom: 13, duration: 1500 });
  }, []);

  // Ease map back to the currently selected item
  const snapToSelection = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const { selectedItem, data } = useMapStore.getState();
    if (!selectedItem || !data) return;

    const folder = data.folders[selectedItem.fi];
    if (!folder) return;

    if (selectedItem.type === 'poi') {
      const poi = folder.pois[selectedItem.idx];
      if (poi) {
        map.easeTo({ center: poi.geometry.coordinates, duration: 600 });
      }
    } else {
      const route = folder.routes[selectedItem.idx];
      if (route) {
        const cs = route.geometry.coordinates;
        let b = [Infinity, Infinity, -Infinity, -Infinity];
        cs.forEach(([x, y]) => {
          b[0] = Math.min(b[0], x);
          b[1] = Math.min(b[1], y);
          b[2] = Math.max(b[2], x);
          b[3] = Math.max(b[3], y);
        });
        map.fitBounds(
          [[b[0], b[1]], [b[2], b[3]]],
          { padding: 80, duration: 600 },
        );
      }
    }
  }, []);

  const crosshairRefs = { elRef, hRef, hgRef, vRef, vgRef, diamondRef, bloomRef };
  const crosshair = { show, hide, showAtCoords };

  return (
    <MapContext.Provider value={{ mapRef, flyToRoute, flyToPoint, snapToSelection, crosshairRefs, crosshair }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}
