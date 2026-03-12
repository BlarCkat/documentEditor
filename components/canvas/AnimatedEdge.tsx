'use client';

import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

export function AnimatedDotEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const isDark = (data as { theme?: string } | undefined)?.theme !== 'light';
  const base = isDark ? '255,255,255' : '0,0,0';
  const strokeColor = selected ? `rgba(${base},0.45)` : `rgba(${base},0.15)`;
  const dotColor = selected ? `rgba(${base},0.85)` : `rgba(${base},0.5)`;
  // Faster animation for shorter paths, consistent feel
  const duration = `${Math.max(1, Math.min(3, Math.hypot(targetX - sourceX, targetY - sourceY) / 200))}s`;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: strokeColor, strokeWidth: 1.5, ...style }}
      />
      {/* Traveling dot */}
      <circle r={3} style={{ fill: dotColor }} filter="url(#dot-glow)">
        <animateMotion
          dur={duration}
          repeatCount="indefinite"
          path={edgePath}
          calcMode="linear"
        />
      </circle>

      {/* Subtle glow filter */}
      <defs>
        <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </>
  );
}
