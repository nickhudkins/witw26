'use client';

import { useHudValues } from '@/hooks/useHudValues';
import { useClock } from '@/hooks/useClock';

interface Props {
  mapReady: boolean;
}

export function HudOverlay({ mapReady }: Props) {
  const { latRef, lngRef, zoomRef } = useHudValues(mapReady);
  const clockRef = useClock();

  return (
    <>
      <div className="hud-panel hud-tl">
        <div className="hud-coords-panel">
          <div className="hud-coord-cell">
            <span className="hud-coord-label">lat</span>
            <span className="hud-coord-val" ref={latRef}>
              ---.---<span className="deg">&deg;</span>
            </span>
          </div>
          <div className="hud-coord-cell">
            <span className="hud-coord-label">lng</span>
            <span className="hud-coord-val" ref={lngRef}>
              ---.---<span className="deg">&deg;</span>
            </span>
          </div>
        </div>
      </div>
      <div className="hud-panel hud-tr">
        <div className="hud-chip">
          <span className="hud-lbl">zoom</span>
          <span className="hud-val" ref={zoomRef}>
            7.0
          </span>
        </div>
        <div className="hud-clock" ref={clockRef}>
          00<span className="blink">:</span>00<span className="blink">:</span>00Z
        </div>
      </div>
    </>
  );
}
