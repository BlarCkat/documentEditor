'use client';

import React, { useState } from 'react';
import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkflowNodeData = { name: string };
export type WorkflowNodeType = Node<WorkflowNodeData, 'workflow'>;

export function WorkflowNode({ id, data, selected }: NodeProps<WorkflowNodeType>) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);

  const save = () => {
    setEditing(false);
    updateNodeData(id, { name });
  };

  return (
    // w-full / h-full fills the style.width / style.height set on the node object
    <div className="w-full h-full">
      {/* Dashed border fill */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl border-2 border-dashed pointer-events-none',
          selected ? 'border-foreground/30' : 'border-border',
          'bg-accent/10'
        )}
      />

      {/* Label */}
      <div
        className="absolute top-3 left-4 flex items-center gap-1.5 nodrag nopan"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Workflow className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="bg-transparent text-[11px] font-medium text-muted-foreground focus:outline-none w-32"
            autoFocus
          />
        ) : (
          <span
            className="text-[11px] font-medium text-muted-foreground/60 cursor-text select-none"
            onDoubleClick={() => setEditing(true)}
          >
            {data.name}
          </span>
        )}
      </div>
    </div>
  );
}
