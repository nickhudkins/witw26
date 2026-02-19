'use client';

import { useRef, useEffect } from 'react';
import { useMap } from '@/hooks/useMap';
import { useMapLayers } from '@/hooks/useMapLayers';
import { useShimmer } from '@/hooks/useShimmer';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
import { COLORS } from '@/lib/constants';
import { HudOverlay } from './HudOverlay';
import { InfoCard } from './InfoCard';
import { Crosshair } from './Crosshair';
import { Tooltip } from './Tooltip';

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { mapReady } = useMap(mapContainerRef);
  useMapLayers(mapReady);
  useShimmer(mapReady);
  const { mapRef, crosshairRefs, crosshair } = useMapContext();
  const selectedItem = useMapStore((s) => s.selectedItem);
  const data = useMapStore((s) => s.data);

  // Keep crosshair pinned to selected item's coordinates during map movement
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectedItem || !data) return;

    const folder = data.folders[selectedItem.fi];
    if (!folder) return;

    let coords: [number, number] | null = null;
    const color = COLORS[selectedItem.fi % COLORS.length];

    if (selectedItem.type === 'poi') {
      const poi = folder.pois[selectedItem.idx];
      if (poi) coords = poi.geometry.coordinates;
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
        coords = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
      }
    }

    if (!coords) return;

    const onMove = () => crosshair.showAtCoords(coords, color);
    // Show immediately
    crosshair.showAtCoords(coords, color);
    map.on('move', onMove);

    return () => {
      map.off('move', onMove);
    };
  }, [mapRef, mapReady, selectedItem, data, crosshair]);

  return (
    <div id="map-container" ref={containerRef}>
      <div id="map" ref={mapContainerRef} />
      <Tooltip containerRef={containerRef} mapReady={mapReady} crosshair={crosshair} />
      <Crosshair refs={crosshairRefs} />
      <div className="scanlines">
        <div className="scanline scanline-a" />
      </div>
      <div className="hud-corners">
        <div className="hud-corner tl" />
        <div className="hud-corner tr" />
        <div className="hud-corner bl" />
        <div className="hud-corner br" />
      </div>
      <div className="grain" />
      <HudOverlay mapReady={mapReady} />
      <InfoCard mapReady={mapReady} />
    </div>
  );
}
