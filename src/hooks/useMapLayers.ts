'use client';

import { useEffect, useRef } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { useMapStore } from '@/store/mapStore';
import { COLORS } from '@/lib/constants';
import { buildShimmerGradient } from '@/lib/shimmer';

export function useMapLayers(mapReady: boolean) {
  const { mapRef } = useMapContext();
  const data = useMapStore((s) => s.data);
  const vis = useMapStore((s) => s.vis);
  const layersAdded = useRef(false);

  // Add routes + POIs once on map load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data || layersAdded.current) return;
    layersAdded.current = true;

    addRoutes(map, data);
    addPOIs(map, data);
    map.fitBounds(data.bounds, { padding: 60, duration: 1500 });
  }, [mapRef, mapReady, data]);

  // Sync visibility when vis changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data) return;
    if (!map.isStyleLoaded()) return;

    data.folders.forEach((folder, fi) => {
      const v = vis[fi] ? 'visible' : 'none';
      [
        `r-mega-${fi}`,
        `r-glow-${fi}`,
        `r-mid-${fi}`,
        `r-core-${fi}`,
        `r-hot-${fi}`,
        `p-outer-${fi}`,
        `p-glow-${fi}`,
        `p-core-${fi}`,
        `p-label-${fi}`,
      ].forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
      });
      folder.routes.forEach((_, ri) => {
        const id = `shimmer-${fi}-${ri}`;
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
      });
    });
  }, [mapRef, mapReady, data, vis]);
}

function addRoutes(map: any, data: any) {
  data.folders.forEach((folder: any, fi: number) => {
    const color = COLORS[fi % COLORS.length];
    const fc = {
      type: 'FeatureCollection',
      features: folder.routes.map((r: any) => ({
        ...r,
        properties: { ...r.properties, fi },
      })),
    };

    map.addSource(`r-${fi}`, { type: 'geojson', data: fc });

    // Shimmer sources (one per route for line-gradient)
    folder.routes.forEach((route: any, ri: number) => {
      const shimmerFc = {
        type: 'FeatureCollection',
        features: [{ ...route, properties: { ...route.properties, fi } }],
      };
      map.addSource(`shimmer-${fi}-${ri}`, {
        type: 'geojson',
        data: shimmerFc,
        lineMetrics: true,
      });
    });

    // Mega glow
    map.addLayer({
      id: `r-mega-${fi}`,
      type: 'line',
      source: `r-${fi}`,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': 28, 'line-opacity': 0.06, 'line-blur': 16 },
    });

    // Glow
    map.addLayer({
      id: `r-glow-${fi}`,
      type: 'line',
      source: `r-${fi}`,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': 16, 'line-opacity': 0.14, 'line-blur': 8 },
    });

    // Mid glow
    map.addLayer({
      id: `r-mid-${fi}`,
      type: 'line',
      source: `r-${fi}`,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': 7, 'line-opacity': 0.3, 'line-blur': 2 },
    });

    // Core
    map.addLayer({
      id: `r-core-${fi}`,
      type: 'line',
      source: `r-${fi}`,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': 2.5, 'line-opacity': 1 },
    });

    // Hot center
    map.addLayer({
      id: `r-hot-${fi}`,
      type: 'line',
      source: `r-${fi}`,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 1, 'line-opacity': 0.15 },
    });

    // Shimmer layers
    folder.routes.forEach((_: any, ri: number) => {
      map.addLayer({
        id: `shimmer-${fi}-${ri}`,
        type: 'line',
        source: `shimmer-${fi}-${ri}`,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': 'white',
          'line-width': 3,
          'line-opacity': 0.6,
          'line-blur': 1,
          'line-gradient': buildShimmerGradient(0),
        },
      });
    });
  });
}

function addPOIs(map: any, data: any) {
  data.folders.forEach((folder: any, fi: number) => {
    const color = COLORS[fi % COLORS.length];
    const fc = {
      type: 'FeatureCollection',
      features: folder.pois.map((p: any) => ({
        ...p,
        properties: { ...p.properties, fi },
      })),
    };

    map.addSource(`p-${fi}`, { type: 'geojson', data: fc });

    map.addLayer({
      id: `p-outer-${fi}`,
      type: 'circle',
      source: `p-${fi}`,
      paint: { 'circle-radius': 20, 'circle-color': color, 'circle-opacity': 0.06, 'circle-blur': 1.2 },
    });

    map.addLayer({
      id: `p-glow-${fi}`,
      type: 'circle',
      source: `p-${fi}`,
      paint: { 'circle-radius': 10, 'circle-color': color, 'circle-opacity': 0.18, 'circle-blur': 0.8 },
    });

    map.addLayer({
      id: `p-core-${fi}`,
      type: 'circle',
      source: `p-${fi}`,
      paint: {
        'circle-radius': 4,
        'circle-color': color,
        'circle-opacity': 1,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 0.8,
        'circle-stroke-opacity': 0.35,
      },
    });

    map.addLayer({
      id: `p-label-${fi}`,
      type: 'symbol',
      source: `p-${fi}`,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 10,
        'text-offset': [0, 1.3],
        'text-anchor': 'top',
        'text-max-width': 12,
        'text-font': ['Open Sans Regular'],
      },
      paint: {
        'text-color': '#8888aa',
        'text-halo-color': 'rgba(6,6,9,0.85)',
        'text-halo-width': 1.5,
      },
      minzoom: 10,
    });
  });
}
