'use client';

import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';
import type { Map as MaplibreMap } from 'maplibre-gl';
import type { RouteFeature } from '@/lib/types';

interface MapContextValue {
  mapRef: React.RefObject<MaplibreMap | null>;
  flyToRoute: (route: RouteFeature) => void;
  flyToPoint: (coords: [number, number]) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<MaplibreMap | null>(null);

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

  return (
    <MapContext.Provider value={{ mapRef, flyToRoute, flyToPoint }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}
