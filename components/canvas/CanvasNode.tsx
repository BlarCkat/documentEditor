'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { FaXTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import {
  MoreHorizontal,
  FileText,
  BookOpen,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Bookmark,
  Trash2,
  ThumbsUp,
  Globe,
  Sparkles,
  ImagePlus,
  X,
  Loader2,
  Scissors,
  ArrowUpRight,
  AlignLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { SlashTextarea } from './SlashMenu';
import type { PostType } from '@/types';
import type { AIAction } from '@/components/editor/AIMenu';

export type NoteNodeData = {
  title: string;
  content: string;
  postType?: PostType;
  createdAt?: string;
  image?: string; // data URL or external URL
};

export type NoteNodeType = Node<NoteNodeData, 'note'>;

const HANDLE = '!w-2 !h-2 !bg-muted-foreground/40 !border-border hover:!bg-foreground transition-colors';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Menu item ────────────────────────────────────────────────────────────────
function MenuItem({
  icon: Icon, label, onClick, danger, subtle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  subtle?: boolean;
}) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left',
        danger  ? 'text-red-400 hover:bg-red-500/10' :
        subtle  ? 'text-muted-foreground/60 hover:bg-accent hover:text-muted-foreground' :
                  'text-foreground hover:bg-accent'
      )}
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </button>
  );
}

// Wrappers so react-icons accept className
const XIcon  = ({ className }: { className?: string }) => <FaXTwitter  className={className} />;
const IGIcon = ({ className }: { className?: string }) => <FaInstagram className={className} />;
const LIIcon = ({ className }: { className?: string }) => <FaLinkedin  className={className} />;

// ── AI actions config ────────────────────────────────────────────────────────
const AI_MENU_ITEMS: { label: string; value: AIAction; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Improve writing',  value: 'improve',   icon: Sparkles     },
  { label: 'Make shorter',     value: 'shorten',   icon: Scissors     },
  { label: 'Make longer',      value: 'lengthen',  icon: ArrowUpRight },
  { label: 'Continue writing', value: 'continue',  icon: ChevronRight },
  { label: 'Summarize',        value: 'summarize', icon: AlignLeft    },
];

// ── Image upload helper ──────────────────────────────────────────────────────
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Main NoteNode ─────────────────────────────────────────────────────────────
export function NoteNode({ id, data, selected }: NodeProps<NoteNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const { userProfile } = useAuth();

  const [isEditing,   setIsEditing]   = useState(false);
  const [focusField,  setFocusField]  = useState<'title' | 'content'>('title');
  const [editTitle,   setEditTitle]   = useState(data.title);
  const [editContent, setEditContent] = useState(data.content);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [showAISub,   setShowAISub]   = useState(false);
  const [aiLoading,   setAiLoading]   = useState(false);
  const menuRef    = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  const username = userProfile?.displayName || userProfile?.email?.split('@')[0] || 'user';
  const handle   = '@' + username.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15);
  const postType: PostType = data.postType ?? 'note';

  // Close context menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setMenuOpen(false);
        setShowAISub(false);
      }
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const openEdit = (field: 'title' | 'content' = 'title') => {
    setEditTitle(data.title);
    setEditContent(data.content);
    setFocusField(field);
    setIsEditing(true);
    setMenuOpen(false);
  };

  const saveEdit = () => {
    setIsEditing(false);
    updateNodeData(id, { title: editTitle, content: editContent });
  };

  const convertTo  = (type: PostType) => { updateNodeData(id, { postType: type }); setMenuOpen(false); };
  const deleteNode = () => deleteElements({ nodes: [{ id }] });

  // ── Image upload ────────────────────────────────────────────────────────────
  const handleImageFile = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      updateNodeData(id, { image: dataUrl });
    } catch { /* ignore */ }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeData(id, { image: undefined });
  };

  // ── Run AI command on the whole node content ────────────────────────────────
  const runAI = async (action: AIAction) => {
    setMenuOpen(false);
    setShowAISub(false);
    setAiLoading(true);
    try {
      const res  = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: stripHtml(data.content), selection: '' }),
      });
      const json = await res.json() as { text?: string; error?: string };
      if (json.text) updateNodeData(id, { content: json.text });
    } catch { /* ignore */ } finally {
      setAiLoading(false);
    }
  };

  const nodeWidth =
    postType === 'instagram' ? 'w-72' :
    postType === 'linkedin'  ? 'w-72' :
    postType === 'document'  ? 'w-80' : 'w-64';

  const previewText = stripHtml(data.content);

  // ── Shared image block ──────────────────────────────────────────────────────
  const ImageBlock = ({ aspectSquare }: { aspectSquare?: boolean }) => (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-accent',
        aspectSquare ? 'aspect-square' : 'h-32'
      )}
      style={{ borderTop: postType === 'instagram' ? undefined : '1px solid var(--border)' }}
    >
      {data.image ? (
        <>
          <img
            src={data.image}
            alt=""
            className="w-full h-full object-cover"
          />
          <button
            onClick={removeImage}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors nodrag"
          >
            <X className="w-3 h-3" />
          </button>
        </>
      ) : (
        <button
          className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-accent/80 transition-colors nodrag"
          onClick={() => fileRef.current?.click()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-[10px]">Add image</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
      />
    </div>
  );

  // ── Shared ··· context menu ─────────────────────────────────────────────────
  const ContextMenu = () => (
    <div className="absolute right-0 top-7 w-56 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden py-1">

      {/* Enfin AI section */}
      <p className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
        Enfin AI
      </p>
      <div className="relative">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors text-left"
          onClick={() => setShowAISub((v) => !v)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
          <span className="flex-1">AI commands</span>
          <ChevronRight className={cn('w-3.5 h-3.5 text-muted-foreground/40 transition-transform', showAISub && 'rotate-90')} />
        </button>
        {showAISub && (
          <div className="border-t border-border bg-accent/30">
            {AI_MENU_ITEMS.map((item) => (
              <button
                key={item.value}
                className="w-full flex items-center gap-2.5 pl-6 pr-3 py-2 text-xs text-foreground hover:bg-accent transition-colors text-left"
                onClick={() => runAI(item.value)}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/60" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="my-1 border-t border-border" />

      {/* Image */}
      <MenuItem
        icon={ImagePlus}
        label={data.image ? 'Replace image' : 'Add image'}
        onClick={() => { setMenuOpen(false); fileRef.current?.click(); }}
      />

      <div className="my-1 border-t border-border" />

      {/* Convert to */}
      <p className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
        Convert to
      </p>
      {postType !== 'note'      && <MenuItem icon={FileText} label="Note"      onClick={() => convertTo('note')}      subtle />}
      {postType !== 'document'  && <MenuItem icon={BookOpen} label="Document"  onClick={() => convertTo('document')}  subtle />}
      {postType !== 'twitter'   && <MenuItem icon={XIcon}    label="Twitter"   onClick={() => convertTo('twitter')}   subtle />}
      {postType !== 'instagram' && <MenuItem icon={IGIcon}   label="Instagram" onClick={() => convertTo('instagram')} subtle />}
      {postType !== 'linkedin'  && <MenuItem icon={LIIcon}   label="LinkedIn"  onClick={() => convertTo('linkedin')}  subtle />}

      <div className="my-1 border-t border-border" />
      <MenuItem icon={Trash2} label="Delete" onClick={deleteNode} danger />
    </div>
  );

  return (
    <div
      className={cn(
        'rounded-xl border shadow-md relative bg-card text-foreground overflow-hidden',
        nodeWidth,
        selected ? 'border-foreground/25 ring-1 ring-foreground/15' : 'border-border'
      )}
    >
      <Handle type="source" position={Position.Top}    id="t" className={HANDLE} />
      <Handle type="source" position={Position.Right}  id="r" className={HANDLE} />
      <Handle type="source" position={Position.Bottom} id="b" className={HANDLE} />
      <Handle type="source" position={Position.Left}   id="l" className={HANDLE} />

      {/* AI loading overlay */}
      {aiLoading && (
        <div className="absolute inset-0 z-30 bg-background/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-xs text-muted-foreground">Generating…</span>
          </div>
        </div>
      )}

      {/* ··· context menu trigger */}
      <div
        ref={menuRef}
        className="absolute top-2 right-2 z-20 nodrag nopan"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); setShowAISub(false); }}
          className={cn(
            'p-1 rounded-md transition-colors text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent',
            menuOpen && 'bg-accent text-muted-foreground'
          )}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
        {menuOpen && <ContextMenu />}
      </div>

      {/* ─── NOTE ─── */}
      {postType === 'note' && (
        <div>
          <div
            className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-border"
            onDoubleClick={(e) => { e.stopPropagation(); openEdit('title'); }}
          >
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                onBlur={saveEdit}
                className="flex-1 bg-transparent text-foreground text-xs font-medium focus:outline-none nodrag pr-6"
                autoFocus={focusField === 'title'}
              />
            ) : (
              <h3 className="flex-1 text-foreground text-xs font-medium truncate pr-6">
                {data.title || 'Untitled'}
              </h3>
            )}
          </div>
          <div
            className="p-3 pr-8"
            onDoubleClick={(e) => { e.stopPropagation(); openEdit('content'); }}
          >
            {isEditing ? (
              <SlashTextarea
                value={editContent}
                onChange={setEditContent}
                onBlur={saveEdit}
                title={data.title}
                placeholder="Write something… or type / for commands"
                className="w-full h-20 bg-transparent text-muted-foreground text-xs resize-none focus:outline-none placeholder:text-muted-foreground/30 nodrag"
                autoFocus={focusField === 'content'}
              />
            ) : (
              <p className="text-muted-foreground text-xs whitespace-pre-wrap min-h-[4rem]">
                {previewText || <span className="opacity-25 italic">Double-click to edit…</span>}
              </p>
            )}
          </div>
          <ImageBlock />
        </div>
      )}

      {/* ─── DOCUMENT ─── */}
      {postType === 'document' && (
        <div>
          <div
            className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-border"
            onDoubleClick={(e) => { e.stopPropagation(); openEdit('title'); }}
          >
            <BookOpen className="w-3 h-3 text-blue-400 flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                onBlur={saveEdit}
                className="flex-1 bg-transparent text-foreground text-xs font-semibold focus:outline-none nodrag pr-6"
                autoFocus={focusField === 'title'}
              />
            ) : (
              <h3 className="flex-1 text-foreground text-xs font-semibold truncate pr-6">
                {data.title || 'Untitled Document'}
              </h3>
            )}
          </div>
          <div
            className="p-3 pr-8"
            onDoubleClick={(e) => { e.stopPropagation(); openEdit('content'); }}
          >
            {isEditing ? (
              <SlashTextarea
                value={editContent}
                onChange={setEditContent}
                onBlur={saveEdit}
                title={data.title}
                placeholder="Write something… or type / for commands"
                className="w-full h-24 bg-transparent text-muted-foreground text-xs resize-none focus:outline-none placeholder:text-muted-foreground/30 nodrag"
                autoFocus={focusField === 'content'}
              />
            ) : (
              <p className="text-muted-foreground text-xs line-clamp-5 min-h-[4rem]">
                {previewText || <span className="opacity-25 italic">Double-click to edit…</span>}
              </p>
            )}
          </div>
          <ImageBlock />
          <div className="px-3 pb-2.5">
            <span className="text-[10px] text-blue-400/50 font-medium uppercase tracking-wide">Document</span>
          </div>
        </div>
      )}

      {/* ─── TWITTER / X ─── */}
      {postType === 'twitter' && (
        <div>
          <div className="p-3 pr-8" onDoubleClick={(e) => { e.stopPropagation(); openEdit('content'); }}>
            <div className="flex items-start gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-sky-400">
                {username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{username}</span>
                  <span className="text-[11px] text-muted-foreground">{handle}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">just now</span>
              </div>
              <FaXTwitter className="w-3.5 h-3.5 text-foreground/40 flex-shrink-0 mt-0.5" />
            </div>

            {isEditing ? (
              <SlashTextarea
                value={editContent}
                onChange={setEditContent}
                onBlur={saveEdit}
                title={data.title}
                placeholder="What's happening? Type / for commands"
                maxLength={280}
                className="w-full h-20 bg-transparent text-foreground text-sm resize-none focus:outline-none placeholder:text-muted-foreground/30 nodrag"
                autoFocus
              />
            ) : (
              <p className="text-sm text-foreground leading-relaxed mb-3 min-h-[3rem]">
                {previewText || <span className="text-muted-foreground/30 italic text-xs">Double-click to write…</span>}
              </p>
            )}
          </div>

          {/* Image */}
          <ImageBlock />

          <div className="px-3 pb-2">
            <div className="flex items-center gap-4 pt-2 border-t border-border">
              {[
                { Icon: MessageCircle, hover: 'hover:text-sky-400' },
                { Icon: Repeat2,       hover: 'hover:text-green-400' },
                { Icon: Heart,         hover: 'hover:text-red-400' },
              ].map(({ Icon, hover }) => (
                <button key={hover} className={cn('flex items-center gap-1 text-muted-foreground/40 text-[11px] transition-colors nodrag', hover)}>
                  <Icon className="w-3.5 h-3.5" />0
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTAGRAM ─── */}
      {postType === 'instagram' && (
        <div>
          <div className="flex items-center gap-2 px-3 py-2.5 pr-8">
            <div
              className="w-7 h-7 rounded-full p-0.5 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}
            >
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-[10px] font-bold text-foreground">
                {username[0]?.toUpperCase()}
              </div>
            </div>
            <span className="text-xs font-semibold text-foreground flex-1 truncate">{username}</span>
            <FaInstagram className="w-3.5 h-3.5 text-muted-foreground/40 mr-6" />
          </div>

          {/* Image (square — primary Instagram element) */}
          <div className="relative w-full aspect-square border-y border-border overflow-hidden">
            {data.image ? (
              <>
                <img src={data.image} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={removeImage}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors nodrag"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <button
                className="w-full h-full flex flex-col items-center justify-center gap-2 nodrag"
                style={{ background: 'linear-gradient(135deg,rgba(131,58,180,.07),rgba(253,29,29,.07),rgba(252,176,69,.07))' }}
                onClick={() => fileRef.current?.click()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <ImagePlus className="w-6 h-6 text-muted-foreground/20" />
                <span className="text-[11px] text-muted-foreground/30">Tap to add image</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            />
          </div>

          <div className="px-3 pt-2 pb-3">
            <div className="flex items-center gap-3 mb-1.5">
              {[Heart, MessageCircle, Send].map((Icon) => (
                <button key={Icon.displayName} className="text-muted-foreground/50 hover:text-foreground transition-colors nodrag">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <div className="flex-1" />
              <button className="text-muted-foreground/50 hover:text-foreground transition-colors nodrag">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-foreground font-semibold mb-0.5">0 likes</p>
            <div onDoubleClick={(e) => { e.stopPropagation(); openEdit('content'); }}>
              {isEditing ? (
                <SlashTextarea
                  value={editContent}
                  onChange={setEditContent}
                  onBlur={saveEdit}
                  title={data.title}
                  placeholder="Write a caption… or type / for commands"
                  className="w-full h-14 bg-transparent text-xs text-foreground resize-none focus:outline-none placeholder:text-muted-foreground/30 nodrag"
                  autoFocus
                />
              ) : (
                <p className="text-xs text-foreground">
                  <span className="font-semibold">{username} </span>
                  <span className="text-muted-foreground">
                    {previewText || <em className="opacity-30">Double-click to add a caption…</em>}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── LINKEDIN ─── */}
      {postType === 'linkedin' && (
        <div className="p-3 pr-8" onDoubleClick={(e) => { e.stopPropagation(); openEdit('content'); }}>
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-400">
              {username[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">{username}</p>
              <p className="text-[11px] text-muted-foreground">Content Creator · just now</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Globe className="w-2.5 h-2.5 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/40">Public</span>
              </div>
            </div>
            <FaLinkedin className="w-4 h-4 text-[#0a66c2] flex-shrink-0 mt-0.5" />
          </div>

          {isEditing ? (
            <SlashTextarea
              value={editContent}
              onChange={setEditContent}
              onBlur={saveEdit}
              title={data.title}
              placeholder="Share an insight… or type / for commands"
              className="w-full h-20 bg-transparent text-foreground text-sm resize-none focus:outline-none placeholder:text-muted-foreground/30 nodrag"
              autoFocus
            />
          ) : (
            <p className="text-sm text-foreground leading-relaxed mb-3 min-h-[3rem]">
              {previewText || <span className="text-muted-foreground/30 italic text-xs">Double-click to write…</span>}
            </p>
          )}

          {/* Image */}
          <div className="mb-3 -mx-3">
            <ImageBlock />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            {[
              { Icon: ThumbsUp,      label: 'Like',    hover: 'hover:text-blue-400' },
              { Icon: MessageCircle, label: 'Comment', hover: 'hover:text-foreground' },
              { Icon: Repeat2,       label: 'Repost',  hover: 'hover:text-green-400' },
              { Icon: Send,          label: 'Send',    hover: 'hover:text-foreground' },
            ].map(({ Icon, label, hover }) => (
              <button key={label} className={cn('flex items-center gap-1 text-muted-foreground/40 text-[11px] transition-colors nodrag', hover)}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
