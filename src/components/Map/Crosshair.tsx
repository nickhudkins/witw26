'use client';

import type { CrosshairRefs } from '@/hooks/useCrosshair';

interface Props {
  refs: CrosshairRefs;
}

export function Crosshair({ refs }: Props) {
  return (
    <div className="crosshair" ref={refs.elRef}>
      <div className="ch-h-glow" ref={refs.hgRef} />
      <div className="ch-h" ref={refs.hRef} />
      <div className="ch-v-glow" ref={refs.vgRef} />
      <div className="ch-v" ref={refs.vRef} />
      <div className="ch-bloom" ref={refs.bloomRef} />
      <div className="ch-diamond" ref={refs.diamondRef} />
    </div>
  );
}
