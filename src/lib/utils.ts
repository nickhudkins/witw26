export function cleanName(n: string): string {
  return n
    .replace(/^(Start|End) of (Track|TRK)[\s-]*/i, '')
    .replace(/\s*\(Track\)\s*$/i, '')
    .replace(/\s*- SHP\s*$/i, '')
    .trim();
}

export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/g, ' \u00b7 ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '\u2026' : s;
}
