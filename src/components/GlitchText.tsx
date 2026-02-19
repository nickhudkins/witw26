'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function GlitchText({ children }: Props) {
  return (
    <span data-glitch data-text={typeof children === 'string' ? children : undefined}>
      {children}
    </span>
  );
}
