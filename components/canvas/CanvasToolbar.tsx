'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface CanvasToolbarProps {
  onAddNote: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  zoom: number;
}

export function CanvasToolbar({
  onAddNote,
  onZoomIn,
  onZoomOut,
  onResetView,
  zoom,
}: CanvasToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-[#111] border border-white/10 rounded-xl shadow-lg">
      {/* Add note button */}
      <button
        onClick={onAddNote}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Add Note</span>
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-white/10" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="px-2 text-sm text-gray-400 min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/10" />

      {/* Reset view */}
      <button
        onClick={onResetView}
        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Reset view"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}
