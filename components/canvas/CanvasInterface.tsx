'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
  type OnConnect,
  type Edge,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NoteNode, type NoteNodeType } from './CanvasNode';
import { AnimatedDotEdge } from './AnimatedEdge';
import { WorkflowNode } from './WorkflowNode';
import { CanvasToolbar } from './CanvasToolbar';
import { useTheme } from '@/components/theme';
import { useAuth } from '@/lib/auth-context';
import { loadCanvasState, saveCanvasState } from '@/lib/canvas-store';
import { Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTypes = { note: NoteNode, workflow: WorkflowNode };
const edgeTypes = { animatedDot: AnimatedDotEdge };

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { theme } = useTheme();
  const defaultEdgeOptions = React.useMemo(
    () => ({ type: 'animatedDot', data: { theme } }),
    [theme]
  );
  const { user } = useAuth();
  const { fitView } = useReactFlow();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // ── Load persisted state once user is available ──────────────────────────
  useEffect(() => {
    if (!user || loaded.current) return;
    loaded.current = true;
    const { nodes: saved, edges: savedEdges } = loadCanvasState(user.id);
    if (saved.length > 0 || savedEdges.length > 0) {
      setNodes(saved);
      setEdges(savedEdges);
      requestAnimationFrame(() => fitView({ padding: 0.3, maxZoom: 1 }));
    }
  }, [user, setNodes, setEdges, fitView]);

  // ── Debounced save ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !loaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveCanvasState(user.id, nodes, edges), 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [nodes, edges, user]);

  // ── Connect ───────────────────────────────────────────────────────────────
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // ── Add note ──────────────────────────────────────────────────────────────
  const addNote = useCallback(() => {
    const id = `note-${Date.now()}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: 'note',
        position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
        data: { title: 'New Note', content: '', postType: 'note', createdAt: new Date().toISOString() },
      } as NoteNodeType,
    ]);
  }, [setNodes]);

  // ── Add document ──────────────────────────────────────────────────────────
  const addDocument = useCallback(() => {
    const id = `note-${Date.now()}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: 'note',
        position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
        data: { title: 'New Document', content: '', postType: 'document', createdAt: new Date().toISOString() },
      } as NoteNodeType,
    ]);
  }, [setNodes]);

  // ── Group selected notes as workflow ─────────────────────────────────────
  const createWorkflow = useCallback(() => {
    const selected = nodes.filter((n) => n.selected && n.type !== 'workflow');
    if (selected.length < 2) return;

    const PAD = 44;
    const xs      = selected.map((n) => n.position.x);
    const ys      = selected.map((n) => n.position.y);
    const rights  = selected.map((n) => n.position.x + (n.measured?.width  ?? 256));
    const bottoms = selected.map((n) => n.position.y + (n.measured?.height ?? 200));

    const minX = Math.min(...xs)      - PAD;
    const minY = Math.min(...ys)      - PAD;
    const maxX = Math.max(...rights)  + PAD;
    const maxY = Math.max(...bottoms) + PAD;

    const wId  = `workflow-${Date.now()}`;
    const wW   = maxX - minX;
    const wH   = maxY - minY;

    const workflowNode: Node = {
      id:   wId,
      type: 'workflow',
      position: { x: minX, y: minY },
      data: { name: 'Workflow' },
      style: { width: wW, height: wH },
      zIndex: -1,
      selectable: true,
      draggable:  true,
    };

    setNodes((prev) => {
      const updated = prev.map((n) => {
        if (!n.selected || n.type === 'workflow') return n;
        return {
          ...n,
          parentId: wId,
          extent: 'parent' as const,
          position: { x: n.position.x - minX, y: n.position.y - minY },
          selected: false,
        };
      });
      return [workflowNode, ...updated];
    });
  }, [nodes, setNodes]);

  // How many note-type nodes are selected
  const selectedNoteCount = nodes.filter((n) => n.selected && n.type !== 'workflow').length;

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={theme}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        isValidConnection={() => true}
        fitView
        fitViewOptions={{ padding: 0.5, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={['Delete', 'Backspace']}
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)'}
        />
        <Controls
          position="bottom-left"
          style={{ marginBottom: '1.5rem', marginLeft: '1rem' }}
        />
      </ReactFlow>

      {/* Workflow selection toolbar */}
      {selectedNoteCount >= 2 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3 py-2 bg-card border border-border rounded-lg shadow-xl">
          <span className="text-xs text-muted-foreground">{selectedNoteCount} notes selected</span>
          <button
            onClick={createWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Workflow className="w-3.5 h-3.5" />
            Group as Workflow
          </button>
        </div>
      )}

      <CanvasToolbar onAddNote={addNote} onAddDocument={addDocument} />

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-base font-medium text-foreground mb-1">Your canvas is empty</p>
            <p className="text-sm text-muted-foreground">Click Add Note or Add Document to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CanvasInterface() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
