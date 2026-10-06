export const COLORS = [
  '#00d2ff', // cyan
  '#ff2d55', // racing red
  '#e4e4f0', // ghost white
  '#0090b3', // deep cyan
  '#ff6b7f', // soft red
  '#7ecbdb', // pale cyan
  '#c0c0d0', // silver
  '#ff4466', // hot pink
  '#00a5cc', // mid cyan
];

export const MAP_CENTER: [number, number] = [-83, 35.6];
export const MAP_ZOOM = 7;
export const MAP_MAX_ZOOM = 18;

// CARTO basemaps need a free API key (https://carto.com/basemaps/apikey/),
// otherwise every tile shows an "API KEY REQUIRED" watermark.
// Set NEXT_PUBLIC_CARTO_KEY in .env.local and in your Vercel project settings.
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY ?? '';
const CARTO_KEY_PARAM = CARTO_KEY ? `?key=${encodeURIComponent(CARTO_KEY)}` : '';

export const TILE_URL_TEMPLATE = `https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png${CARTO_KEY_PARAM}`;

export function tileUrl(z: number, x: number, y: number): string {
  return TILE_URL_TEMPLATE.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
}

export const MAP_STYLE = {
  version: 8 as const,
  sources: {
    carto: {
      type: 'raster' as const,
      tiles: [TILE_URL_TEMPLATE],
      tileSize: 256,
      attribution: '&copy; CARTO &copy; OSM',
    },
  },
  layers: [{ id: 'base', type: 'raster' as const, source: 'carto' }],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

