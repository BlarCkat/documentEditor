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

/** Count canvas nodes of a given postType created in the current calendar month. */
export function countThisMonthByType(userId: string, postType: string): number {
  const { nodes } = loadCanvasState(userId);
  const now = new Date();
  return nodes.filter((n) => {
    const d = n.data as { postType?: string; createdAt?: string };
    if ((d.postType ?? 'note') !== postType) return false;
    if (!d.createdAt) return false;
    const created = new Date(d.createdAt);
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth()
    );
  }).length;
}
