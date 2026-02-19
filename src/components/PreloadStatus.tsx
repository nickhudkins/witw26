'use client';

import { useState, useEffect } from 'react';
import { useMapStore } from '@/store/mapStore';

export function PreloadStatus() {
  // Listen for preload progress via a custom event pattern
  // The OfflineButton drives progress; this component shows it
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    function onProgress(e: CustomEvent<{ done: number; total: number }>) {
      setVisible(true);
      setProgress(e.detail);
      if (e.detail.done >= e.detail.total && e.detail.total > 0) {
        setTimeout(() => setVisible(false), 3000);
      }
    }
    window.addEventListener('preload-progress', onProgress as EventListener);
    return () => window.removeEventListener('preload-progress', onProgress as EventListener);
  }, []);

  const pct = progress.total > 0 ? ((progress.done / progress.total) * 100).toFixed(1) : '0';

  return (
    <div className="preload-status" style={{ display: visible ? 'flex' : 'none' }}>
      <div className="preload-label">Caching tiles for offline</div>
      <div className="preload-track">
        <div className="preload-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="preload-text">
        {progress.total > 0
          ? `${progress.done}/${progress.total} tiles`
          : '0/0 tiles'}
      </div>
    </div>
  );
}
