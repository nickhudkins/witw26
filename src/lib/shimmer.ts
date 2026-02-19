export function buildShimmerGradient(phase: number): unknown[] {
  const p = Math.min(Math.max(phase % 1, 0), 1);
  const w = 0.06;
  const t0 = 'rgba(255,255,255,0)';
  const t1 = 'rgba(255,255,255,0.45)';

  const raw: [number, string][] = [
    [0, t0],
    [Math.max(p - w, 0.001), t0],
    [p, t1],
    [Math.min(p + w, 0.999), t0],
    [1, t0],
  ];

  // Deduplicate and enforce strictly ascending input values
  const stops: [number, string][] = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    if (raw[i][0] > stops[stops.length - 1][0] + 0.001) {
      stops.push(raw[i]);
    }
  }

  return ['interpolate', ['linear'], ['line-progress'], ...stops.flat()];
}
