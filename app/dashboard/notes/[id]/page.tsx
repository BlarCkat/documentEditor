'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { loadCanvasState, saveCanvasState } from '@/lib/canvas-store';
import { DocumentEditor } from '@/components/editor';
import type { MentionItem } from '@/components/editor/MentionList';
import { cn } from '@/lib/utils';
import type { NoteNodeData } from '@/components/canvas/CanvasNode';
import type { PostType } from '@/types';
import { ArrowLeft, BookOpen, FileText, Check } from 'lucide-react';
import { FaXTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import type { Node } from '@xyflow/react';

const TYPE_META: Record<PostType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  note:      { label: 'Note',      icon: ({ className }) => <FileText    className={className} />, color: 'text-muted-foreground' },
  document:  { label: 'Document',  icon: ({ className }) => <BookOpen    className={className} />, color: 'text-blue-400' },
  twitter:   { label: 'Twitter',   icon: ({ className }) => <FaXTwitter  className={className} />, color: 'text-sky-400' },
  instagram: { label: 'Instagram', icon: ({ className }) => <FaInstagram className={className} />, color: 'text-pink-400' },
  linkedin:  { label: 'LinkedIn',  icon: ({ className }) => <FaLinkedin  className={className} />, color: 'text-blue-400' },
};

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [node,        setNode]        = useState<Node | null>(null);
  const [title,       setTitle]       = useState('');
  const [content,     setContent]     = useState('');
  const [postType,    setPostType]    = useState<PostType>('note');
  const [mentionItems, setMentionItems] = useState<MentionItem[]>([]);
  const [saved,       setSaved]       = useState(false);
  const [notFound,    setNotFound]    = useState(false);

  // ── Load note ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !id) return;
    const { nodes } = loadCanvasState(user.id);
    const found = nodes.find((n) => n.id === id);

    if (!found) { setNotFound(true); return; }

    const d = found.data as NoteNodeData;
    setNode(found);
    setTitle(d.title || '');
    setContent(d.content || '');
    setPostType(d.postType ?? 'note');

    // Build mention items from all other notes
    const items: MentionItem[] = nodes
      .filter((n) => n.type === 'note' && n.id !== id)
      .map((n) => ({
        id:    n.id,
        label: (n.data as NoteNodeData).title || 'Untitled',
        type:  ((n.data as NoteNodeData).postType ?? 'note') as PostType,
      }));
    setMentionItems(items);
  }, [user, id]);

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const save = useCallback(
    (newTitle: string, newContent: string) => {
      if (!user || !id) return;
      const { nodes, edges } = loadCanvasState(user.id);
      const updated = nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, title: newTitle, content: newContent } } : n
      );
      saveCanvasState(user.id, updated, edges);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
    [user, id]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    save(val, content);
  };

  const handleContentChange = (html: string) => {
    setContent(html);
    save(title, html);
  };

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm text-muted-foreground">Note not found.</p>
        <button
          onClick={() => router.push('/dashboard/notes')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:opacity-90"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to notes
        </button>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-xs text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const meta = TYPE_META[postType] ?? TYPE_META.note;
  const Icon = meta.icon;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0 bg-card">
        <button
          onClick={() => router.push('/dashboard/notes')}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Back to notes"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', meta.color)} />

        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="flex-1 bg-transparent text-foreground font-semibold text-sm focus:outline-none placeholder:text-muted-foreground/40"
        />

        {/* Type badge */}
        <span className={cn('text-[11px] font-medium flex-shrink-0', meta.color)}>
          {meta.label}
        </span>

        {/* Save indicator */}
        <div className={cn(
          'flex items-center gap-1 text-[11px] transition-opacity flex-shrink-0',
          saved ? 'opacity-100 text-green-400' : 'opacity-0'
        )}>
          <Check className="w-3 h-3" />
          Saved
        </div>
      </div>

      {/* ── Editor (fills remaining height) ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <DocumentEditor
          key={id}
          content={content}
          onChange={handleContentChange}
          mentionItems={mentionItems}
          placeholder={
            postType === 'document'
              ? 'Start writing your document… type @ to link other content, right-click or ⌃Space for Enfin AI.'
              : 'Write something… type @ to reference notes, right-click or ⌃Space for Enfin AI.'
          }
          showToolbar
        />
      </div>
    </div>
  );
}
