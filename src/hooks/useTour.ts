'use client';

import { useEffect, useCallback } from 'react';
import { useMapStore } from '@/store/mapStore';
import { useMapContext } from '@/contexts/MapContext';
import { COLORS } from '@/lib/constants';
import type { CrosshairRefs } from './useCrosshair';

export function useTour(crosshair: CrosshairRefs, mapReady: boolean) {
  const { mapRef } = useMapContext();
  const tourActive = useMapStore((s) => s.tourActive);
  const tourSteps = useMapStore((s) => s.tourSteps);
  const tourIdx = useMapStore((s) => s.tourIdx);
  const showStep = useMapStore((s) => s.showStep);
  const endTour = useMapStore((s) => s.endTour);
  const data = useMapStore((s) => s.data);

  // Navigate camera to current step
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !tourActive || !tourSteps.length || !data) return;

    const step = tourSteps[tourIdx];
    if (!step) return;
    const color = COLORS[step.fi % COLORS.length];

    if (step.type === 'folder') {
      // Fit to folder bounds
      let b = [Infinity, Infinity, -Infinity, -Infinity];
      step.folder.routes.forEach((r) => {
        r.geometry.coordinates.forEach(([x, y]) => {
          b[0] = Math.min(b[0], x);
          b[1] = Math.min(b[1], y);
          b[2] = Math.max(b[2], x);
          b[3] = Math.max(b[3], y);
        });
      });
      step.folder.pois.forEach((p) => {
        const [x, y] = p.geometry.coordinates;
        b[0] = Math.min(b[0], x);
        b[1] = Math.min(b[1], y);
        b[2] = Math.max(b[2], x);
        b[3] = Math.max(b[3], y);
      });
      if (b[0] !== Infinity) {
        map.fitBounds(
          [
            [b[0], b[1]],
            [b[2], b[3]],
          ],
          { padding: 100, duration: 1500 },
        );
      }
      crosshair.hide();
    } else if (step.poi) {
      const coords = step.poi.geometry.coordinates;
      map.flyTo({ center: coords, zoom: 12, duration: 1800 });

      const onMove = () => crosshair.showAtCoords(coords, color);
      map.on('move', onMove);
      map.once('moveend', () => {
        map.off('move', onMove);
        crosshair.showAtCoords(coords, color);
      });
    }
  }, [mapRef, mapReady, tourActive, tourSteps, tourIdx, data, crosshair]);

  // Keyboard nav
  useEffect(() => {
    if (!tourActive) return;

    function onKeydown(e: KeyboardEvent) {
      const { tourIdx, tourSteps, nextStep, prevStep, endTour } = useMapStore.getState();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (tourIdx < tourSteps.length - 1) nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (tourIdx > 0) prevStep();
      } else if (e.key === 'Escape') {
        endTour();
      }
    }

    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [tourActive]);

  return { tourActive, tourSteps, tourIdx, showStep, endTour };
}
