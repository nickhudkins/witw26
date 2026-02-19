export interface RouteFeature {
  type: 'Feature';
  properties: {
    name: string;
    description: string;
    folder: string;
    fi?: number;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface PoiFeature {
  type: 'Feature';
  properties: {
    name: string;
    description: string;
    folder: string;
    fi?: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface Folder {
  name: string;
  routes: RouteFeature[];
  pois: PoiFeature[];
}

export interface AppData {
  folders: Folder[];
  bounds: [[number, number], [number, number]];
}

export interface TourStep {
  type: 'folder' | 'poi';
  fi: number;
  pi?: number;
  poi?: PoiFeature;
  folder: Folder;
}
