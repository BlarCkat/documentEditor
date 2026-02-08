'use client';

import React from 'react';
import { CanvasViewport } from '@/types';

interface CanvasBackgroundProps {
  viewport: CanvasViewport;
}

export function CanvasBackground({ viewport }: CanvasBackgroundProps) {
  const gridSize = 24 * viewport.zoom;
  const offsetX = viewport.x % gridSize;
  const offsetY = viewport.y % gridSize;

  return (
    <div
      data-background
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
}
