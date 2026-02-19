const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789';

export function glitchBurst(el: HTMLElement, fast = false) {
  const target = el.querySelector<HTMLElement>('[data-glitch]') || el;
  clearTimeout((target as any)._glitchTimer);
  const original = target.dataset.text || target.textContent || '';
  target.dataset.text = original;
  const nonSpace = original.replace(/ /g, '').length;
  const maxGlitch = Math.max(3, Math.floor(nonSpace * 0.5));
  const count = 3 + Math.floor(Math.random() * Math.max(1, maxGlitch - 2));
  const indices: number[] = [];
  const candidates: number[] = [];
  for (let i = 0; i < original.length; i++) {
    if (original[i] !== ' ') candidates.push(i);
  }
  while (indices.length < Math.min(count, candidates.length)) {
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    if (!indices.includes(idx)) indices.push(idx);
  }
  const totalDuration = fast
    ? 50 + Math.floor(Math.random() * 30)
    : 60 + Math.floor(Math.random() * 240);
  const steps = fast
    ? 2 + Math.floor(Math.random() * 2)
    : 3 + Math.floor(Math.random() * 4);
  const delay = Math.round(totalDuration / steps);
  let step = 0;

  (function tick() {
    const arr = original.split('');
    indices.forEach((i) => {
      arr[i] = `<span style="opacity:0.7">${GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]}</span>`;
    });
    target.innerHTML = arr.join('');
    step++;
    if (step < steps) {
      (target as any)._glitchTimer = setTimeout(tick, delay);
    } else {
      setTimeout(() => {
        target.textContent = original;
      }, delay);
    }
  })();
}
