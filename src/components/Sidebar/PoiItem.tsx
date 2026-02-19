'use client';

import { useCallback, useRef } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
import type { PoiFeature } from '@/lib/types';

interface Props {
  fi: number;
  pi: number;
  poi: PoiFeature;
  color: string;
  folderName: string;
}

export function PoiItem({ fi, pi, poi, color, folderName }: Props) {
  const { flyToPoint, mapRef, crosshair } = useMapContext();
  const tourFocus = useMapStore((s) => s.tourFocus);
  const selectedItem = useMapStore((s) => s.selectedItem);
  const selectItem = useMapStore((s) => s.selectItem);
  const isTourFocused = tourFocus?.fi === fi && tourFocus?.pi === pi;
  const isSelected = selectedItem?.type === 'poi' && selectedItem.fi === fi && selectedItem.idx === pi;
  const isFocused = isTourFocused || isSelected;
  const cleanupRef = useRef<(() => void) | null>(null);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectItem({ type: 'poi', fi, idx: pi });
      const coords = poi.geometry.coordinates;
      flyToPoint(coords);

      // Track crosshair during fly animation
      const map = mapRef.current;
      if (map) {
        const onMove = () => crosshair.showAtCoords(coords, color);
        map.on('move', onMove);
        map.once('moveend', () => {
          map.off('move', onMove);
          crosshair.showAtCoords(coords, color);
        });
      }
    },
    [poi, flyToPoint, mapRef, crosshair, color, selectItem, fi, pi],
  );

  const onMouseEnter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const coords = poi.geometry.coordinates;
    map.easeTo({ center: coords, duration: 600 });
    crosshair.showAtCoords(coords, color);
    const onMove = () => crosshair.showAtCoords(coords, color);
    map.on('move', onMove);
    cleanupRef.current = () => map.off('move', onMove);
  }, [poi, mapRef, crosshair, color]);

  const onMouseLeave = useCallback(() => {
    crosshair.hide();
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, [crosshair]);

  return (
    <div
      className={`f-item ${isFocused ? 'tour-focus' : ''}`}
      data-t="p"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="f-item-dot"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
      <span className="f-item-name">{poi.properties.name}</span>
      <span className="f-item-tag">poi</span>
    </div>
  );
}
