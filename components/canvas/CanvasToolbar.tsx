'use client';

import React from 'react';
import { Plus, BookOpen } from 'lucide-react';

interface CanvasToolbarProps {
  onAddNote: () => void;
  onAddDocument: () => void;
}

export function CanvasToolbar({ onAddNote, onAddDocument }: CanvasToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
      <button
        onClick={onAddNote}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-foreground text-background text-xs font-medium rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Note
      </button>
      <button
        onClick={onAddDocument}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-card border border-border text-foreground text-xs font-medium rounded-lg shadow-lg hover:bg-accent active:scale-95 transition-all"
      >
        <BookOpen className="w-3.5 h-3.5" />
        Add Document
      </button>
    </div>
  );
}
