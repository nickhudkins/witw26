'use client';

import { useCallback, useRef } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
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
  const { flyToRoute, mapRef, crosshair } = useMapContext();
  const selectedItem = useMapStore((s) => s.selectedItem);
  const selectItem = useMapStore((s) => s.selectItem);
  const isSelected = selectedItem?.type === 'route' && selectedItem.fi === fi && selectedItem.idx === ri;
  const cleanupRef = useRef<(() => void) | null>(null);

  const getCenter = useCallback((): [number, number] => {
    const cs = route.geometry.coordinates;
    let b = [Infinity, Infinity, -Infinity, -Infinity];
    cs.forEach(([x, y]) => {
      b[0] = Math.min(b[0], x);
      b[1] = Math.min(b[1], y);
      b[2] = Math.max(b[2], x);
      b[3] = Math.max(b[3], y);
    });
    return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  }, [route]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectItem({ type: 'route', fi, idx: ri });
      flyToRoute(route);
      const center = getCenter();
      const map = mapRef.current;
      if (map) {
        const onMove = () => crosshair.showAtCoords(center, color);
        map.on('move', onMove);
        map.once('moveend', () => {
          map.off('move', onMove);
          crosshair.showAtCoords(center, color);
        });
      }
    },
    [route, flyToRoute, mapRef, crosshair, color, getCenter, selectItem, fi, ri],
  );

  const onMouseEnter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const center = getCenter();
    map.easeTo({ center, duration: 600 });
    crosshair.showAtCoords(center, color);
    const onMove = () => crosshair.showAtCoords(center, color);
    map.on('move', onMove);
    cleanupRef.current = () => map.off('move', onMove);
  }, [route, mapRef, crosshair, color, getCenter]);

  const onMouseLeave = useCallback(() => {
    crosshair.hide();
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, [crosshair]);

  return (
    <div className={`f-item ${isSelected ? 'tour-focus' : ''}`} data-t="r" onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div
        className="f-item-dot route"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
      <span className="f-item-name">{cleanName(route.properties.name)}</span>
      <span className="f-item-tag">route</span>
    </div>
  );
}
