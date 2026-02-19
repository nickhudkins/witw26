'use client';

import { useCallback } from 'react';
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
  const { flyToPoint, mapRef } = useMapContext();
  const tourFocus = useMapStore((s) => s.tourFocus);
  const isFocused = tourFocus?.fi === fi && tourFocus?.pi === pi;

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      flyToPoint(poi.geometry.coordinates);
    },
    [poi, flyToPoint],
  );

  const onMouseEnter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const coords = poi.geometry.coordinates;
    map.easeTo({ center: coords, duration: 600 });
  }, [poi, mapRef]);

  return (
    <div
      className={`f-item ${isFocused ? 'tour-focus' : ''}`}
      data-t="p"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
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
