'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Note, CanvasViewport } from '@/types';
import { cn } from '@/lib/utils';
import { Trash2, GripVertical } from 'lucide-react';

interface CanvasNodeProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
  onStartConnection: (sourceId: string, x: number, y: number) => void;
  onEndConnection: (targetId: string) => void;
  viewport: CanvasViewport;
}

export function CanvasNode({
  note,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onStartConnection,
  onEndConnection,
  viewport,
}: CanvasNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; noteX: number; noteY: number } | null>(null);

  useEffect(() => {
    setEditTitle(note.title);
    setEditContent(note.content);
  }, [note.title, note.content]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-anchor]') || isEditing) {
      return;
    }

    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      noteX: note.position.x,
      noteY: note.position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.x) / viewport.zoom;
        const dy = (e.clientY - dragStartRef.current.y) / viewport.zoom;
        onUpdate({
          position: {
            x: dragStartRef.current.noteX + dx,
            y: dragStartRef.current.noteY + dy,
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, viewport.zoom, onUpdate]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editTitle !== note.title || editContent !== note.content) {
      onUpdate({ title: editTitle, content: editContent });
    }
  };

  const handleAnchorMouseDown = (e: React.MouseEvent, position: 'top' | 'right' | 'bottom' | 'left') => {
    e.stopPropagation();
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      let x = note.position.x;
      let y = note.position.y;

      switch (position) {
        case 'top':
          x += note.size.width / 2;
          break;
        case 'right':
          x += note.size.width;
          y += note.size.height / 2;
          break;
        case 'bottom':
          x += note.size.width / 2;
          y += note.size.height;
          break;
        case 'left':
          y += note.size.height / 2;
          break;
      }

      onStartConnection(note.id, x, y);
    }
  };

  const handleAnchorMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEndConnection(note.id);
  };

  return (
    <div
      ref={nodeRef}
      data-node
      className={cn(
        'absolute rounded-xl border shadow-lg transition-shadow',
        'bg-[#111] border-white/10',
        isSelected && 'ring-2 ring-indigo-500 border-indigo-500/50',
        isDragging && 'cursor-grabbing shadow-2xl',
        !isDragging && !isEditing && 'cursor-grab'
      )}
      style={{
        left: note.position.x,
        top: note.position.y,
        width: note.size.width,
        minHeight: note.size.height,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Connection anchors */}
      {isSelected && (
        <>
          <div
            data-anchor
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => handleAnchorMouseDown(e, 'top')}
            onMouseUp={handleAnchorMouseUp}
          />
          <div
            data-anchor
            className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => handleAnchorMouseDown(e, 'right')}
            onMouseUp={handleAnchorMouseUp}
          />
          <div
            data-anchor
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => handleAnchorMouseDown(e, 'bottom')}
            onMouseUp={handleAnchorMouseUp}
          />
          <div
            data-anchor
            className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full cursor-crosshair hover:scale-125 transition-transform"
            onMouseDown={(e) => handleAnchorMouseDown(e, 'left')}
            onMouseUp={handleAnchorMouseUp}
          />
        </>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <GripVertical className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="flex-1 bg-transparent text-white text-sm font-medium focus:outline-none"
            autoFocus
          />
        ) : (
          <h3 className="flex-1 text-white text-sm font-medium truncate">{note.title}</h3>
        )}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            aria-label="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            placeholder="Write something..."
            className="w-full h-24 bg-transparent text-gray-300 text-sm resize-none focus:outline-none placeholder:text-gray-600"
          />
        ) : (
          <p className="text-gray-400 text-sm whitespace-pre-wrap">
            {note.content || (
              <span className="text-gray-600 italic">Double-click to edit...</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
