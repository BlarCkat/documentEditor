'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { CanvasBackground } from './CanvasBackground';
import { CanvasNode } from './CanvasNode';
import { CanvasConnections } from './CanvasConnections';
import { CanvasToolbar } from './CanvasToolbar';
import { Note, NoteConnection, CanvasViewport } from '@/types';

export function CanvasInterface() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, zoom: 1 });
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<NoteConnection[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<{ sourceId: string; x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pan and zoom with gestures
  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        // Only pan if not dragging a node
        if (!(event.target as HTMLElement).closest('[data-node]')) {
          setViewport((prev) => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
          }));
        }
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        const zoomFactor = dy > 0 ? 0.95 : 1.05;
        setViewport((prev) => ({
          ...prev,
          zoom: Math.min(Math.max(prev.zoom * zoomFactor, 0.25), 2),
        }));
      },
      onPinch: ({ offset: [scale] }) => {
        setViewport((prev) => ({
          ...prev,
          zoom: Math.min(Math.max(scale, 0.25), 2),
        }));
      },
    },
    {
      target: containerRef,
      drag: { filterTaps: true },
      wheel: { eventOptions: { passive: false } },
      pinch: { scaleBounds: { min: 0.25, max: 2 } },
    }
  );

  const addNote = useCallback(() => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const centerX = containerRect ? containerRect.width / 2 : 400;
    const centerY = containerRect ? containerRect.height / 2 : 300;

    // Convert screen position to canvas position
    const canvasX = (centerX - viewport.x) / viewport.zoom;
    const canvasY = (centerY - viewport.y) / viewport.zoom;

    const newNote: Note = {
      id: Date.now().toString(),
      userId: '',
      title: 'New Note',
      content: '',
      position: { x: canvasX - 150, y: canvasY - 100 },
      size: { width: 300, height: 200 },
      color: '#1a1a1a',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes((prev) => [...prev, newNote]);
    setSelectedNoteId(newNote.id);
  }, [viewport]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    setConnections((prev) =>
      prev.filter((conn) => conn.sourceNoteId !== id && conn.targetNoteId !== id)
    );
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  const startConnection = useCallback((sourceId: string, x: number, y: number) => {
    setConnecting({ sourceId, x, y });
  }, []);

  const endConnection = useCallback((targetId: string) => {
    if (connecting && connecting.sourceId !== targetId) {
      // Check if connection already exists
      const exists = connections.some(
        (c) =>
          (c.sourceNoteId === connecting.sourceId && c.targetNoteId === targetId) ||
          (c.sourceNoteId === targetId && c.targetNoteId === connecting.sourceId)
      );

      if (!exists) {
        const newConnection: NoteConnection = {
          id: Date.now().toString(),
          sourceNoteId: connecting.sourceId,
          targetNoteId: targetId,
          createdAt: new Date(),
        };
        setConnections((prev) => [...prev, newConnection]);
      }
    }
    setConnecting(null);
  }, [connecting, connections]);

  const cancelConnection = useCallback(() => {
    setConnecting(null);
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id));
  }, []);

  const handleZoomIn = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 2) }));
  };

  const handleZoomOut = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.25) }));
  };

  const handleResetView = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  // Handle click on canvas to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-background]')) {
      setSelectedNoteId(null);
      cancelConnection();
    }
  };

  // Handle mouse move for connection preview
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (connecting) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setConnecting((prev) => prev ? {
          ...prev,
          x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
          y: (e.clientY - rect.top - viewport.y) / viewport.zoom,
        } : null);
      }
    }
  }, [connecting, viewport]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#0a0a0a] cursor-grab active:cursor-grabbing"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={cancelConnection}
    >
      {/* Background */}
      <CanvasBackground viewport={viewport} />

      {/* Canvas content */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Connections */}
        <CanvasConnections
          connections={connections}
          notes={notes}
          connecting={connecting}
          onDelete={deleteConnection}
        />

        {/* Notes */}
        {notes.map((note) => (
          <CanvasNode
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            onSelect={() => setSelectedNoteId(note.id)}
            onUpdate={(updates) => updateNote(note.id, updates)}
            onDelete={() => deleteNote(note.id)}
            onStartConnection={startConnection}
            onEndConnection={endConnection}
            viewport={viewport}
          />
        ))}
      </div>

      {/* Toolbar */}
      <CanvasToolbar
        onAddNote={addNote}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        zoom={viewport.zoom}
      />

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Your canvas is empty</h2>
            <p className="text-gray-400 mb-4">Click the + button to add your first note</p>
          </div>
        </div>
      )}
    </div>
  );
}
