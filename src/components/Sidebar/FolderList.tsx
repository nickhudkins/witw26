'use client';

import { useEffect, useRef } from 'react';
import { useMapStore } from '@/store/mapStore';
import { COLORS } from '@/lib/constants';
import { FolderItem } from './FolderItem';

export function FolderList() {
  const data = useMapStore((s) => s.data);
  const searchQuery = useMapStore((s) => s.searchQuery);
  const tourFocus = useMapStore((s) => s.tourFocus);
  const ref = useRef<HTMLDivElement>(null);

  // Auto-scroll tour focus into view
  useEffect(() => {
    if (!tourFocus || !ref.current) return;
    const focused = ref.current.querySelector('.tour-focus');
    if (focused) {
      focused.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [tourFocus]);

  if (!data) return <div className="folders" />;

  const q = searchQuery.toLowerCase();

  return (
    <div className="folders" ref={ref}>
      {data.folders.map((folder, fi) => {
        const color = COLORS[fi % COLORS.length];
        const routes = folder.routes.filter(
          (r) => !q || r.properties.name.toLowerCase().includes(q),
        );
        const pois = folder.pois.filter(
          (p) => !q || p.properties.name.toLowerCase().includes(q),
        );
        const nameMatch = !q || folder.name.toLowerCase().includes(q);
        if (!nameMatch && !routes.length && !pois.length) return null;

        return (
          <FolderItem
            key={fi}
            fi={fi}
            folder={folder}
            color={color}
            routes={routes}
            pois={pois}
          />
        );
      })}
    </div>
  );
}
