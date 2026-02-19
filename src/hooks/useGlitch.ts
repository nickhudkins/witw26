'use client';

import { useCallback, useEffect } from 'react';
import { glitchBurst } from '@/lib/glitch';

export function useGlitch() {
  // Ambient glitch on hoverable text (~35% chance)
  useEffect(() => {
    function onMouseOver(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest(
        '.f-item-name, .f-head-name, .hud-chip, .ic-value, .ic-title, .ic-hover-name, .tour-folder-name, .tour-poi-name, .ms-val, .ms-label, .tt-folder, .tt-desc',
      ) as HTMLElement | null;
      if (!el || (el as any)._glitching) return;
      if (Math.random() > 0.35) return;
      (el as any)._glitching = true;
      glitchBurst(el, true);
      setTimeout(() => {
        (el as any)._glitching = false;
      }, 400);
    }

    document.addEventListener('mouseover', onMouseOver);
    return () => document.removeEventListener('mouseover', onMouseOver);
  }, []);

  const triggerGlitch = useCallback((hoveredBtn: HTMLElement) => {
    const visible = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '#sidebar button, .modal button, .tour-hud button',
      ),
    ).filter((b) => b.offsetParent !== null);
    const others = visible.filter((b) => b !== hoveredBtn);
    const chance = 1 / visible.length;
    glitchBurst(hoveredBtn);
    others.forEach((b) => {
      if (Math.random() < chance) glitchBurst(b);
    });
  }, []);

  return { triggerGlitch };
}
