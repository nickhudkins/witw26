'use client';

import { useEffect, useState, useRef, type RefObject } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
import { MAP_CENTER, MAP_ZOOM, MAP_MAX_ZOOM, MAP_STYLE } from '@/lib/constants';

export function useMap(containerRef: RefObject<HTMLDivElement | null>) {
  const { mapRef } = useMapContext();
  const data = useMapStore((s) => s.data);
  const [mapReady, setMapReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !data || initRef.current) return;
    initRef.current = true;

    let cancelled = false;

    (async () => {
      const maplibregl = await import('maplibre-gl');

      if (cancelled) return;

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style: MAP_STYLE,
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        maxZoom: MAP_MAX_ZOOM,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        'bottom-right',
      );
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showAccuracyCircle: false,
        }),
        'bottom-right',
      );

      mapRef.current = map;

      map.on('load', () => {
        if (!cancelled) setMapReady(true);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef, data, mapRef]);

  return { mapReady };
}
