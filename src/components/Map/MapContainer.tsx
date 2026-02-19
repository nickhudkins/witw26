'use client';

import { useRef } from 'react';
import { useMap } from '@/hooks/useMap';
import { useMapLayers } from '@/hooks/useMapLayers';
import { useShimmer } from '@/hooks/useShimmer';
import { useMapContext } from '@/contexts/MapContext';
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
  const { crosshairRefs, crosshair } = useMapContext();

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
