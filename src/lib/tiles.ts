import type { AppData } from './types';

function lng2tile(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * (1 << z));
}

function lat2tile(lat: number, z: number): number {
  return Math.floor(
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
        Math.PI) /
      2) *
      (1 << z),
  );
}

function getTilesForBounds(
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number,
  zoom: number,
) {
  const tiles: { z: number; x: number; y: number }[] = [];
  const x0 = lng2tile(minLng, zoom);
  const x1 = lng2tile(maxLng, zoom);
  const y0 = lat2tile(maxLat, zoom);
  const y1 = lat2tile(minLat, zoom);
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      tiles.push({ z: zoom, x, y });
    }
  }
  return tiles;
}

function getTilesAroundPoint(lng: number, lat: number, zoom: number, radius: number) {
  const cx = lng2tile(lng, zoom);
  const cy = lat2tile(lat, zoom);
  const tiles: { z: number; x: number; y: number }[] = [];
  for (let x = cx - radius; x <= cx + radius; x++) {
    for (let y = cy - radius; y <= cy + radius; y++) {
      tiles.push({ z: zoom, x, y });
    }
  }
  return tiles;
}

function tileUrl(z: number, x: number, y: number): string {
  return `https://a.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}@2x.png`;
}

export async function preloadTiles(
  data: AppData,
  onProgress: (done: number, total: number) => void,
): Promise<void> {
  const [[minLng, minLat], [maxLng, maxLat]] = data.bounds;
  const seen = new Set<string>();
  const urls: string[] = [];

  function addTile(z: number, x: number, y: number) {
    const key = `${z}/${x}/${y}`;
    if (!seen.has(key)) {
      seen.add(key);
      urls.push(tileUrl(z, x, y));
    }
  }

  // Full bounds at zoom 5-11
  for (let z = 5; z <= 11; z++) {
    for (const t of getTilesForBounds(minLng, minLat, maxLng, maxLat, z)) {
      addTile(t.z, t.x, t.y);
    }
  }

  // Along every route at zoom 12-13
  data.folders.forEach((folder) => {
    folder.routes.forEach((route) => {
      const coords = route.geometry.coordinates;
      for (let ci = 0; ci < coords.length; ci += Math.max(1, Math.floor(coords.length / 40))) {
        const [lng, lat] = coords[ci];
        for (let z = 12; z <= 13; z++) {
          addTile(z, lng2tile(lng, z), lat2tile(lat, z));
          addTile(z, lng2tile(lng, z) + 1, lat2tile(lat, z));
          addTile(z, lng2tile(lng, z), lat2tile(lat, z) + 1);
          addTile(z, lng2tile(lng, z) + 1, lat2tile(lat, z) + 1);
        }
      }
    });
  });

  // Around each POI at zoom 12-14
  data.folders.forEach((folder) => {
    folder.pois.forEach((poi) => {
      const [lng, lat] = poi.geometry.coordinates;
      for (let z = 12; z <= 14; z++) {
        for (const t of getTilesAroundPoint(lng, lat, z, 2)) {
          addTile(t.z, t.x, t.y);
        }
      }
    });
  });

  let done = 0;
  const total = urls.length;
  const concurrency = 24;

  async function fetchOne(url: string) {
    try {
      await fetch(url);
    } catch {}
    done++;
    onProgress(done, total);
  }

  let i = 0;
  async function batch(): Promise<void> {
    const promises: Promise<void>[] = [];
    while (i < urls.length && promises.length < concurrency) {
      promises.push(fetchOne(urls[i++]));
    }
    await Promise.all(promises);
    if (i < urls.length) return batch();
  }

  await batch();
}
