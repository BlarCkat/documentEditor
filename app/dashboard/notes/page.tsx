'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { loadCanvasState, saveCanvasState } from '@/lib/canvas-store';
import { cn } from '@/lib/utils';
import type { NoteNodeData, NoteNodeType } from '@/components/canvas/CanvasNode';
import type { PostType } from '@/types';
import { FaXTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { FileText, BookOpen, SlidersHorizontal, Plus, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type SortOption   = 'newest' | 'oldest' | 'az' | 'za';
type FilterOption = 'all' | PostType;

const TYPE_CONFIG: Record<PostType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  note:      { label: 'Note',      icon: FileText,   color: 'text-muted-foreground' },
  document:  { label: 'Document',  icon: BookOpen,   color: 'text-blue-400'   },
  twitter:   { label: 'Twitter',   icon: ({ className }) => <FaXTwitter  className={className} />, color: 'text-sky-400'    },
  instagram: { label: 'Instagram', icon: ({ className }) => <FaInstagram className={className} />, color: 'text-pink-400'   },
  linkedin:  { label: 'LinkedIn',  icon: ({ className }) => <FaLinkedin  className={className} />, color: 'text-blue-400'   },
};

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'note',      label: 'Notes'     },
  { value: 'document',  label: 'Documents' },
  { value: 'twitter',   label: 'Twitter'   },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin',  label: 'LinkedIn'  },
];

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function NotesPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [notes,  setNotes]  = useState<NoteNodeType[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort,   setSort]   = useState<SortOption>('newest');

  const loadNotes = useCallback(() => {
    if (!user) return;
    const { nodes } = loadCanvasState(user.id);
    setNotes(nodes.filter((n) => n.type === 'note') as NoteNodeType[]);
  }, [user]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const visible = notes
    .filter((n) => filter === 'all' || ((n.data as NoteNodeData).postType ?? 'note') === filter)
    .sort((a, b) => {
      const ad = a.data as NoteNodeData, bd = b.data as NoteNodeData;
      if (sort === 'newest') return new Date(bd.createdAt ?? 0).getTime() - new Date(ad.createdAt ?? 0).getTime();
      if (sort === 'oldest') return new Date(ad.createdAt ?? 0).getTime() - new Date(bd.createdAt ?? 0).getTime();
      if (sort === 'az') return (ad.title ?? '').localeCompare(bd.title ?? '');
      if (sort === 'za') return (bd.title ?? '').localeCompare(ad.title ?? '');
      return 0;
    });

  const counts: Record<FilterOption, number> = {
    all:       notes.length,
    note:      notes.filter((n) => ((n.data as NoteNodeData).postType ?? 'note') === 'note').length,
    document:  notes.filter((n) => (n.data as NoteNodeData).postType === 'document').length,
    twitter:   notes.filter((n) => (n.data as NoteNodeData).postType === 'twitter').length,
    instagram: notes.filter((n) => (n.data as NoteNodeData).postType === 'instagram').length,
    linkedin:  notes.filter((n) => (n.data as NoteNodeData).postType === 'linkedin').length,
  };

  const handleAddNew = () => {
    if (!user) return;
    const id = `note-${Date.now()}`;
    const newNode: NoteNodeType = {
      id,
      type: 'note',
      position: { x: 120, y: 120 },
      data: {
        title: '',
        content: '',
        postType: (filter !== 'all' ? filter : 'note') as PostType,
        createdAt: new Date().toISOString(),
      },
    };
    const { nodes, edges } = loadCanvasState(user.id);
    saveCanvasState(user.id, [...nodes, newNode], edges);
    router.push(`/dashboard/notes/${id}`);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground">Notes &amp; Documents</h1>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs bg-card border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">Title A → Z</option>
            <option value="za">Title Z → A</option>
          </select>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-3 h-3" />New
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-5 py-2 border-b border-border flex-shrink-0 flex-wrap">
        {FILTERS.map(({ value, label }) => {
          const cfg = value !== 'all' ? TYPE_CONFIG[value as PostType] : null;
          const Icon = cfg?.icon;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                filter === value
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {label}
              <span className={cn('text-[10px] tabular-nums', filter === value ? 'opacity-60' : 'text-muted-foreground/50')}>
                {counts[value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pb-20 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {filter === 'all'
                ? 'No notes yet — create one on the canvas or click New.'
                : `No ${TYPE_CONFIG[filter as PostType]?.label ?? ''} items yet.`}
            </p>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 transition-all"
            >
              <Plus className="w-3 h-3" />
              New {filter !== 'all' ? TYPE_CONFIG[filter as PostType]?.label : 'Note'}
            </button>
          </div>
        ) : (
          visible.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              onClick={() => router.push(`/dashboard/notes/${note.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NoteRow({ note, onClick }: { note: NoteNodeType; onClick: () => void }) {
  const postType: PostType = (note.data as NoteNodeData).postType ?? 'note';
  const cfg = TYPE_CONFIG[postType] ?? TYPE_CONFIG.note;
  const Icon = cfg.icon;
  const preview = stripHtml((note.data as NoteNodeData).content || '');

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer text-left group"
    >
      <div className={cn('mt-0.5 flex-shrink-0', cfg.color)}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-0.5">
          <p className="text-xs font-medium text-foreground truncate">
            {(note.data as NoteNodeData).title || 'Untitled'}
          </p>
          {(note.data as NoteNodeData).createdAt && (
            <span className="text-[11px] text-muted-foreground flex-shrink-0 tabular-nums">
              {formatDistanceToNow(new Date((note.data as NoteNodeData).createdAt!), { addSuffix: true })}
            </span>
          )}
        </div>
        {preview ? (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{preview}</p>
        ) : (
          <p className="text-[11px] text-muted-foreground/30 italic">No content</p>
        )}
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground flex-shrink-0 mt-0.5 transition-colors" />
    </button>
  );
}
