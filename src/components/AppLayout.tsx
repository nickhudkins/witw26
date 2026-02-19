'use client';

import { useEffect } from 'react';
import type { AppData } from '@/lib/types';
import { useMapStore } from '@/store/mapStore';
import { MapProvider } from '@/contexts/MapContext';
import { Sidebar } from './Sidebar/Sidebar';
import { MapContainer } from './Map/MapContainer';
import { BriefingModal } from './Modal/BriefingModal';
import { TourHud } from './Tour/TourHud';
import { PreloadStatus } from './PreloadStatus';

interface Props {
  data: AppData;
}

export function AppLayout({ data }: Props) {
  const setData = useMapStore((s) => s.setData);

  useEffect(() => {
    setData(data);
  }, [data, setData]);

  return (
    <MapProvider>
      <div id="app">
        <Sidebar />
        <MapContainer />
        <BriefingModal />
        <PreloadStatus />
        <TourHud />
      </div>
    </MapProvider>
  );
}
