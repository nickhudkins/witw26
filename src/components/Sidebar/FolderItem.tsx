'use client';

import { useCallback } from 'react';
import { useMapStore } from '@/store/mapStore';
import type { Folder, RouteFeature, PoiFeature } from '@/lib/types';
import { RouteItem } from './RouteItem';
import { PoiItem } from './PoiItem';

interface Props {
  fi: number;
  folder: Folder;
  color: string;
  routes: RouteFeature[];
  pois: PoiFeature[];
}

export function FolderItem({ fi, folder, color, routes, pois }: Props) {
  const vis = useMapStore((s) => s.vis);
  const openFolders = useMapStore((s) => s.openFolders);
  const toggleVis = useMapStore((s) => s.toggleVis);
  const toggleFolder = useMapStore((s) => s.toggleFolder);

  const isVisible = vis[fi];
  const isOpen = openFolders[fi];

  const onToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleVis(fi);
    },
    [fi, toggleVis],
  );

  const onHeadClick = useCallback(() => {
    toggleFolder(fi);
  }, [fi, toggleFolder]);

  return (
    <div className="folder">
      <div className="folder-head" onClick={onHeadClick}>
        <div
          className={`f-toggle ${isVisible ? 'on' : ''}`}
          style={{ color, borderColor: color }}
          onClick={onToggleClick}
        />
        <svg
          className={`f-chevron ${isOpen ? 'open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="f-name">{folder.name}</span>
        <span className="f-badge">{routes.length + pois.length}</span>
      </div>
      <div className={`f-items ${isOpen ? 'open' : ''}`}>
        {routes.map((route, ri) => (
          <RouteItem key={`r-${ri}`} fi={fi} ri={ri} route={route} color={color} folderName={folder.name} />
        ))}
        {pois.map((poi, pi) => (
          <PoiItem key={`p-${pi}`} fi={fi} pi={pi} poi={poi} color={color} folderName={folder.name} />
        ))}
      </div>
    </div>
  );
}
