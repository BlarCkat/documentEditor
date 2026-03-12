import type { Node, Edge } from '@xyflow/react';

const storageKey = (userId: string) => `enfinotes_canvas_${userId}`;

export function loadCanvasState(userId: string): { nodes: Node[]; edges: Edge[] } {
  if (typeof window === 'undefined') return { nodes: [], edges: [] };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { nodes: [], edges: [] };
    return JSON.parse(raw) as { nodes: Node[]; edges: Edge[] };
  } catch {
    return { nodes: [], edges: [] };
  }
}

export function saveCanvasState(userId: string, nodes: Node[], edges: Edge[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify({ nodes, edges }));
  } catch {}
}
