'use client';

import { useEffect, useRef } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
import { buildShimmerGradient } from '@/lib/shimmer';

export function useShimmer(mapReady: boolean) {
  const { mapRef } = useMapContext();
  const data = useMapStore((s) => s.data);
  const phaseRef = useRef(0);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data) return;

    const speed = 0.003;
    let raf: number;

    function tick() {
      phaseRef.current = (phaseRef.current + speed) % 1.3;
      const gradient = buildShimmerGradient(phaseRef.current);
      const vis = useMapStore.getState().vis;

      data!.folders.forEach((folder, fi) => {
        if (!vis[fi]) return;
        folder.routes.forEach((_, ri) => {
          const layerId = `shimmer-${fi}-${ri}`;
          if (map!.getLayer(layerId)) {
            map!.setPaintProperty(layerId, 'line-gradient', gradient);
          }
        });
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mapRef, mapReady, data]);
}
