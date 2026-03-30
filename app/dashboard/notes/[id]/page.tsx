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
import { ArrowLeft, BookOpen, FileText, Check, Share2, Loader2, X } from 'lucide-react';
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
  const [publishOpen, setPublishOpen] = useState(false);

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

        {/* Publish button (for social posts) */}
        {['twitter', 'instagram', 'linkedin'].includes(postType) && (
          <button
            onClick={() => setPublishOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:opacity-90 transition-colors flex-shrink-0"
            title="Publish to social media"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        )}

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

      {/* ── Publish Modal ── */}
      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        noteId={id}
        userProfile={user}
        onPublish={() => {
          setPublishOpen(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      />
    </div>
  );
}

// ── Publish Modal Component ────────────────────────────────────────────────────
interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  userProfile: any;
  onPublish: () => void;
}

function PublishModal({ isOpen, onClose, noteId, userProfile, onPublish }: PublishModalProps) {
  const [platforms, setPlatforms] = useState<Array<'twitter' | 'instagram' | 'linkedin'>>([]);
  const [immediate, setImmediate] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const socialAccounts = userProfile?.socialAccounts || {};

  const handlePublish = async () => {
    if (platforms.length === 0) {
      setError('Select at least one platform');
      return;
    }

    setPublishing(true);
    setError('');

    try {
      const payload: any = {
        noteId,
        platforms,
        immediate,
      };

      if (!immediate && scheduledDate) {
        const dt = new Date(`${scheduledDate}T${scheduledTime}`);
        payload.scheduledFor = dt.toISOString();
      }

      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Publishing failed');
      }

      onPublish();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Publish post</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select platforms and timing</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platforms */}
        <div className="p-6 space-y-3 border-b border-border">
          <p className="text-xs font-medium text-foreground">Post to:</p>
          <div className="space-y-2">
            {['twitter', 'instagram', 'linkedin'].map((platform) => (
              <label
                key={platform}
                className="flex items-center gap-2 p-2.5 rounded-md bg-accent/50 hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={platforms.includes(platform as any)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPlatforms([...platforms, platform as 'twitter' | 'instagram' | 'linkedin']);
                    } else {
                      setPlatforms(platforms.filter((p) => p !== platform));
                    }
                  }}
                  disabled={!socialAccounts[platform]}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-foreground flex-1">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </span>
                {socialAccounts[platform] ? (
                  <span className="text-[10px] text-green-400">Connected</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Not connected</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="p-6 space-y-4 border-b border-border">
          <p className="text-xs font-medium text-foreground">When to post:</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={immediate}
                onChange={() => setImmediate(true)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-foreground">Post immediately</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!immediate}
                onChange={() => setImmediate(false)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-foreground">Schedule for later</span>
            </label>
          </div>
          {!immediate && (
            <div className="flex gap-2 pt-2">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1 px-2.5 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-20 px-2.5 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="px-6 pt-4 text-xs text-red-400">{error}</p>
        )}

        {/* Footer */}
        <div className="px-6 pb-6 pt-4">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {publishing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
            ) : (
              <>Publish</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
