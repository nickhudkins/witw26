'use client';

import { useCallback } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import type { RouteFeature } from '@/lib/types';
import { cleanName } from '@/lib/utils';

interface Props {
  fi: number;
  ri: number;
  route: RouteFeature;
  color: string;
  folderName: string;
}

export function RouteItem({ fi, ri, route, color, folderName }: Props) {
  const { flyToRoute, mapRef } = useMapContext();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      flyToRoute(route);
    },
    [route, flyToRoute],
  );

  const onMouseEnter = useCallback(() => {
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
    const center: [number, number] = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    map.easeTo({ center, duration: 600 });
  }, [route, mapRef]);

  return (
    <div className="f-item" data-t="r" onClick={onClick} onMouseEnter={onMouseEnter}>
      <div
        className="f-item-dot route"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
      <span className="f-item-name">{cleanName(route.properties.name)}</span>
      <span className="f-item-tag">route</span>
    </div>
  );
}
