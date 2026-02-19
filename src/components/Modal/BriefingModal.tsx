'use client';

import { useState, useCallback, useRef } from 'react';
import { useMapStore } from '@/store/mapStore';
import { glitchBurst } from '@/lib/glitch';
import { GlitchText } from '../GlitchText';

export function BriefingModal() {
  const data = useMapStore((s) => s.data);
  const startTour = useMapStore((s) => s.startTour);
  const showStep = useMapStore((s) => s.showStep);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const briefRef = useRef<HTMLButtonElement>(null);
  const exploreRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => {
    setFading(true);
    setTimeout(() => setVisible(false), 500);
  }, []);

  const onBriefing = useCallback(() => {
    dismiss();
    setTimeout(() => {
      startTour();
      showStep(0);
    }, 600);
  }, [dismiss, startTour, showStep]);

  if (!visible || !data) return null;

  let nR = 0,
    nP = 0;
  data.folders.forEach((f) => {
    nR += f.routes.length;
    nP += f.pois.length;
  });

  return (
    <div className={`modal-overlay ${fading ? 'out' : ''}`}>
      <div className="modal">
        <div className="modal-inner">
          <div className="modal-head">
            <div className="m-dot" />
            <span className="m-tag">System Ready</span>
            <span className="m-status">WITW 26</span>
          </div>
          <div className="modal-title">
            Smoky Mountain
            <br />
            Route Network
          </div>
          <div className="modal-subtitle">
            9 route groups across Appalachia. Tail of the Dragon, Cherohala Skyway,
            Blue Ridge Parkway, and more.
          </div>
          <div className="modal-stats">
            <div className="modal-stat">
              <div className="ms-val">{nR}</div>
              <div className="ms-label">Routes</div>
            </div>
            <div className="modal-stat">
              <div className="ms-val">{nP}</div>
              <div className="ms-label">Waypoints</div>
            </div>
            <div className="modal-stat">
              <div className="ms-val">{data.folders.length}</div>
              <div className="ms-label">Groups</div>
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="btn-briefing"
              ref={briefRef}
              onClick={onBriefing}
              onMouseEnter={() => briefRef.current && glitchBurst(briefRef.current)}
              onMouseLeave={() => briefRef.current && glitchBurst(briefRef.current, true)}
            >
              <GlitchText>Route Briefing</GlitchText>
            </button>
            <button
              className="btn-explore"
              ref={exploreRef}
              onClick={dismiss}
              onMouseEnter={() => exploreRef.current && glitchBurst(exploreRef.current)}
              onMouseLeave={() => exploreRef.current && glitchBurst(exploreRef.current, true)}
            >
              <GlitchText>Free Roam</GlitchText>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
