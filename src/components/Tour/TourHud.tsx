'use client';

import { useRef } from 'react';
import { useMapStore } from '@/store/mapStore';
import { useMapContext } from '@/contexts/MapContext';
import { useTour } from '@/hooks/useTour';
import { useCrosshair } from '@/hooks/useCrosshair';
import { COLORS } from '@/lib/constants';
import { glitchBurst } from '@/lib/glitch';
import { GlitchText } from '../GlitchText';

export function TourHud() {
  const { mapRef } = useMapContext();
  const data = useMapStore((s) => s.data);
  const crosshair = useCrosshair();
  const mapReady = !!mapRef.current;
  const { tourActive, tourSteps, tourIdx, endTour } = useTour(crosshair, mapReady);
  const nextStep = useMapStore((s) => s.nextStep);
  const prevStep = useMapStore((s) => s.prevStep);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const exitRef = useRef<HTMLButtonElement>(null);

  if (!tourActive || !tourSteps.length) return null;

  const step = tourSteps[tourIdx];
  const color = COLORS[step.fi % COLORS.length];

  let poiLabel = '--';
  if (step.type === 'folder') {
    poiLabel = `${step.folder.routes.length} routes, ${step.folder.pois.length} waypoints`;
  } else if (step.poi) {
    poiLabel = step.poi.properties.name;
  }

  // Restore bounds on end
  const onEnd = () => {
    endTour();
    crosshair.hide();
    const map = mapRef.current;
    if (map && data) {
      map.fitBounds(data.bounds, { padding: 60, duration: 1200 });
    }
  };

  return (
    <div className={`tour-hud ${tourActive ? 'active' : ''}`}>
      <button
        className="tour-btn"
        ref={prevRef}
        onClick={prevStep}
        onMouseEnter={() => prevRef.current && glitchBurst(prevRef.current)}
        onMouseLeave={() => prevRef.current && glitchBurst(prevRef.current, true)}
      >
        <GlitchText>Prev</GlitchText>
      </button>
      <div className="tour-divider" />
      <div className="tour-info">
        <div className="tour-folder-name" style={{ color }}>
          {step.folder.name}
        </div>
        <div className="tour-poi-name">{poiLabel}</div>
      </div>
      <div className="tour-progress">
        {tourIdx + 1}/{tourSteps.length}
      </div>
      <div className="tour-divider" />
      <button
        className="tour-btn primary"
        ref={nextRef}
        onClick={nextStep}
        onMouseEnter={() => nextRef.current && glitchBurst(nextRef.current)}
        onMouseLeave={() => nextRef.current && glitchBurst(nextRef.current, true)}
      >
        <GlitchText>Next</GlitchText>
      </button>
      <button
        className="tour-btn"
        ref={exitRef}
        onClick={onEnd}
        onMouseEnter={() => exitRef.current && glitchBurst(exitRef.current)}
        onMouseLeave={() => exitRef.current && glitchBurst(exitRef.current, true)}
      >
        <GlitchText>Exit</GlitchText>
      </button>
    </div>
  );
}
