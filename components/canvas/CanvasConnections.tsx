'use client';

import React from 'react';
import { Note, NoteConnection } from '@/types';

interface CanvasConnectionsProps {
  connections: NoteConnection[];
  notes: Note[];
  connecting: { sourceId: string; x: number; y: number } | null;
  onDelete: (id: string) => void;
}

export function CanvasConnections({
  connections,
  notes,
  connecting,
  onDelete,
}: CanvasConnectionsProps) {
  const getNoteCenter = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return null;
    return {
      x: note.position.x + note.size.width / 2,
      y: note.position.y + note.size.height / 2,
    };
  };

  const getConnectionPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): string => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const controlOffset = Math.min(Math.abs(dx), Math.abs(dy), 100) / 2;

    // Create a smooth bezier curve
    const cx1 = x1 + (dx > 0 ? controlOffset : -controlOffset);
    const cy1 = y1;
    const cx2 = x2 - (dx > 0 ? controlOffset : -controlOffset);
    const cy2 = y2;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 0 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="rgba(99, 102, 241, 0.6)"
          />
        </marker>
      </defs>

      {/* Existing connections */}
      {connections.map((connection) => {
        const source = getNoteCenter(connection.sourceNoteId);
        const target = getNoteCenter(connection.targetNoteId);

        if (!source || !target) return null;

        return (
          <g key={connection.id}>
            {/* Click target (invisible, wider) */}
            <path
              d={getConnectionPath(source.x, source.y, target.x, target.y)}
              stroke="transparent"
              strokeWidth="20"
              fill="none"
              className="pointer-events-auto cursor-pointer"
              onClick={() => onDelete(connection.id)}
            />
            {/* Visible line */}
            <path
              d={getConnectionPath(source.x, source.y, target.x, target.y)}
              stroke="rgba(99, 102, 241, 0.5)"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="transition-colors hover:stroke-indigo-400"
            />
          </g>
        );
      })}

      {/* Connection being drawn */}
      {connecting && (
        <path
          d={(() => {
            const source = getNoteCenter(connecting.sourceId);
            if (!source) return '';
            return getConnectionPath(source.x, source.y, connecting.x, connecting.y);
          })()}
          stroke="rgba(99, 102, 241, 0.8)"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
        />
      )}
    </svg>
  );
}
