'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
import { COLORS } from '@/lib/constants';
import { glitchBurst } from '@/lib/glitch';
import { stripHtml, truncate } from '@/lib/utils';

interface Props {
  containerRef: RefObject<HTMLDivElement | null>;
  mapReady: boolean;
}

export function Tooltip({ containerRef, mapReady }: Props) {
  const { mapRef } = useMapContext();
  const data = useMapStore((s) => s.data);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data) return;

    const rLayers: string[] = [];
    const pLayers: string[] = [];
    data.folders.forEach((_, fi) => {
      rLayers.push(`r-core-${fi}`);
      pLayers.push(`p-core-${fi}`);
    });
    const all = [...rLayers, ...pLayers];

    function onMouseMove(e: any) {
      const tooltip = tooltipRef.current;
      if (!tooltip || !map) return;

      const allFeats = map.queryRenderedFeatures(e.point, { layers: all });

      if (allFeats.length) {
        const f = allFeats[0];
        const p = f.properties as any;
        const color = COLORS[p.fi % COLORS.length];
        const isR = f.geometry.type.includes('Line');
        let desc = stripHtml(p.description || '');
        desc = truncate(desc, 120);

        tooltip.innerHTML = `
          <div class="tt-name"><span class="tt-dot" style="background:${color};box-shadow:0 0 6px ${color}"></span><span data-glitch>${p.name}</span></div>
          <div class="tt-folder">${p.folder} // ${isR ? 'ROUTE' : 'POI'}</div>
          ${desc ? `<div class="tt-desc">${desc}</div>` : ''}`;
        tooltip.style.display = 'block';
        tooltip.style.borderLeftColor = color;
        glitchBurst(tooltip, true);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          let x = e.point.x + 16;
          let y = e.point.y - 10;
          if (x + 260 > rect.width) x = e.point.x - 276;
          if (y + 100 > rect.height) y = e.point.y - 100;
          tooltip.style.left = x + 'px';
          tooltip.style.top = y + 'px';
        }
        map.getCanvas().style.cursor = 'pointer';
      } else {
        tooltip.style.display = 'none';
        map.getCanvas().style.cursor = '';
      }
    }

    // Click handlers
    function onPoiClick(e: any) {
      if (e.features?.length) {
        map!.flyTo({ center: e.features[0].geometry.coordinates.slice(), zoom: 13, duration: 1500 });
      }
    }

    function onRouteClick(e: any) {
      if (e.features?.length) {
        const p = e.features[0].properties;
        const route = data!.folders[p.fi]?.routes.find(
          (r) => r.properties.name === p.name,
        );
        if (route) {
          const cs = route.geometry.coordinates;
          let b = [Infinity, Infinity, -Infinity, -Infinity];
          cs.forEach(([x, y]) => {
            b[0] = Math.min(b[0], x);
            b[1] = Math.min(b[1], y);
            b[2] = Math.max(b[2], x);
            b[3] = Math.max(b[3], y);
          });
          map!.fitBounds(
            [
              [b[0], b[1]],
              [b[2], b[3]],
            ],
            { padding: 80, duration: 1500 },
          );
        }
      }
    }

    map.on('mousemove', onMouseMove);
    pLayers.forEach((id) => map.on('click', id, onPoiClick));
    rLayers.forEach((id) => map.on('click', id, onRouteClick));

    return () => {
      map.off('mousemove', onMouseMove);
      pLayers.forEach((id) => map.off('click', id, onPoiClick));
      rLayers.forEach((id) => map.off('click', id, onRouteClick));
    };
  }, [mapRef, mapReady, data, containerRef]);

  return <div className="tooltip" ref={tooltipRef} />;
}
