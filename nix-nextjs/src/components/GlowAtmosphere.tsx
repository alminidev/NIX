'use client';

import { useEffect, useRef } from 'react';

/**
 * GlowAtmosphere — Efeito esfumaçado de iluminação ambiente do Hero Stage.
 * Idêntico ao .glow-container + .glow-* do HTML original.
 * aria-hidden="true" — puramente decorativo.
 */
export default function GlowAtmosphere() {
  return (
    <div className="glow-container" aria-hidden="true">
      <div className="glow glow-blue glow-1"></div>
      <div className="glow glow-accent glow-2"></div>
      <div className="glow glow-blue glow-3"></div>
    </div>
  );
}
