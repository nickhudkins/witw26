'use client';

import { useMapStore } from '@/store/mapStore';

export function SidebarHeader() {
  const data = useMapStore((s) => s.data);

  let nR = 0,
    nP = 0,
    nF = 0;
  if (data) {
    nF = data.folders.length;
    data.folders.forEach((f) => {
      nR += f.routes.length;
      nP += f.pois.length;
    });
  }

  return (
    <div className="header">
      <div className="header-title">
        <span className="blink" />
        WITW // 26
      </div>
      <div className="header-sub">Smoky Mountain Route Database</div>
      <div className="stats">
        <div className="stat-cell">
          <div className="stat-val">{nR}</div>
          <div className="stat-label">Routes</div>
        </div>
        <div className="stat-cell">
          <div className="stat-val">{nP}</div>
          <div className="stat-label">POIs</div>
        </div>
        <div className="stat-cell">
          <div className="stat-val">{nF}</div>
          <div className="stat-label">Groups</div>
        </div>
      </div>
    </div>
  );
}
