'use client';

import { useEffect, useRef } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
import { useHudValues } from '@/hooks/useHudValues';
import { useHexStream } from '@/hooks/useHexStream';

interface Props {
  mapReady: boolean;
}

export function InfoCard({ mapReady }: Props) {
  const { mapRef } = useMapContext();
  const { bearingRef } = useHudValues(mapReady);
  const hexRef = useHexStream();
  const data = useMapStore((s) => s.data);
  const vis = useMapStore((s) => s.vis);
  const visibleRef = useRef<HTMLSpanElement>(null);
  const extentRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // Update stats on map move
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data) return;

    function updateStats() {
      if (!map || !data) return;
      const bounds = map.getBounds();
      const currentVis = useMapStore.getState().vis;

      let vRoutes = 0,
        vPois = 0;
      data.folders.forEach((folder, fi) => {
        if (!currentVis[fi]) return;
        folder.routes.forEach((r) => {
          if (
            r.geometry.coordinates.some(([lng, lat]) => bounds.contains([lng, lat]))
          )
            vRoutes++;
        });
        folder.pois.forEach((p) => {
          const [lng, lat] = p.geometry.coordinates;
          if (bounds.contains([lng, lat])) vPois++;
        });
      });

      if (visibleRef.current)
        visibleRef.current.innerHTML = `<span class="hi">${vRoutes}</span> routes / <span class="hi">${vPois}</span> pts`;

      const sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();
      const latMiles = Math.abs(ne.lat - sw.lat) * 69;
      const lngMiles =
        Math.abs(ne.lng - sw.lng) *
        69 *
        Math.cos(((sw.lat + ne.lat) / 2) * (Math.PI / 180));
      if (extentRef.current)
        extentRef.current.textContent = `${Math.round(lngMiles)} x ${Math.round(latMiles)} mi`;
    }

    map.on('move', updateStats);
    map.on('zoom', updateStats);
    updateStats();

    return () => {
      map.off('move', updateStats);
      map.off('zoom', updateStats);
    };
  }, [mapRef, mapReady, data]);

  return (
    <div className="hud-panel hud-bl">
      <div className="info-card">
        <div className="info-card-head">
          <div className="ic-status" />
          <span className="ic-title">Route Spec</span>
          <span className="ic-tag">Live</span>
        </div>
        <div className="info-card-body">
          <div className="ic-row">
            <span className="ic-label">Brg</span>
            <span className="ic-value" ref={bearingRef}>
              <span className="hi">000</span>&deg;
            </span>
          </div>
          <div className="ic-row">
            <span className="ic-label">Visible</span>
            <span className="ic-value" ref={visibleRef}>
              -- routes / -- pts
            </span>
          </div>
          <div className="ic-row">
            <span className="ic-label">Extent</span>
            <span className="ic-value" ref={extentRef}>
              --
            </span>
          </div>
          <div className="ic-divider" />
          <div className="ic-hover-name" ref={nameRef}>
            &nbsp;
          </div>
          <div className="ic-hover-detail" ref={detailRef}>
            &nbsp;
          </div>
          <div className="hex-stream" ref={hexRef} />
        </div>
      </div>
    </div>
  );
}
