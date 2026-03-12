'use client';

import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, FileText, BookOpen } from 'lucide-react';
import { FaXTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { DocumentEditor } from './DocumentEditor';
import { cn } from '@/lib/utils';
import type { MentionItem } from './MentionList';
import type { PostType } from '@/types';

const TYPE_META: Record<
  PostType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  note:      { label: 'Note',      icon: ({ className }) => <FileText   className={className} />, color: 'text-[#888]'    },
  document:  { label: 'Document',  icon: ({ className }) => <BookOpen   className={className} />, color: 'text-blue-400'  },
  twitter:   { label: 'Twitter',   icon: ({ className }) => <FaXTwitter  className={className} />, color: 'text-sky-400'   },
  instagram: { label: 'Instagram', icon: ({ className }) => <FaInstagram className={className} />, color: 'text-pink-400'  },
  linkedin:  { label: 'LinkedIn',  icon: ({ className }) => <FaLinkedin  className={className} />, color: 'text-blue-400'  },
};

// Tiny helper to strip HTML for displaying word / char counts
function textLength(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length;
}

export interface EditorPanelItem {
  id: string;
  title: string;
  content: string;
  postType: PostType;
}

interface EditorPanelProps {
  open: boolean;
  item: EditorPanelItem | null;
  mentionItems: MentionItem[];
  onClose: () => void;
  onSave: (id: string, title: string, content: string) => void;
}

export function EditorPanel({ open, item, mentionItems, onClose, onSave }: EditorPanelProps) {
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');

  // Sync when a new item is selected
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content);
    }
  }, [item?.id]); // re-sync only when the item id changes

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const postType = item?.postType ?? 'note';
  const meta = TYPE_META[postType] ?? TYPE_META.note;
  const Icon = meta.icon;
  const charCount = textLength(content);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (item) onSave(item.id, val, content);
  };

  const handleContentChange = (html: string) => {
    setContent(html);
    if (item) onSave(item.id, title, html);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 flex flex-col',
          'w-full max-w-2xl',
          'bg-[#0f0f0f] border-l border-[rgba(255,255,255,0.07)]',
          'shadow-[−20px_0_60px_rgba(0,0,0,0.6)]',
          'transition-transform duration-300 ease-out will-change-transform',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5 text-[#555] hover:text-[#f0f0f0] transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', meta.color)} />

          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="flex-1 bg-transparent text-[#f0f0f0] font-semibold text-sm focus:outline-none placeholder:text-[#444]"
            placeholder="Untitled"
          />

          <span className="text-[11px] text-[#444] tabular-nums flex-shrink-0 hidden sm:block">
            {charCount} chars
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5 text-[#555] hover:text-[#f0f0f0] transition-colors flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Editor body ── */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          {item && (
            <DocumentEditor
              key={item.id}
              content={content}
              onChange={handleContentChange}
              mentionItems={mentionItems}
              placeholder={
                postType === 'document'
                  ? 'Write your document… type @ to reference notes or posts.'
                  : postType === 'twitter'
                  ? "What's happening? (280 chars) — type @ to reference content."
                  : 'Write something… type @ to reference notes or documents.'
              }
            />
          )}
        </div>

        {/* ── Footer hint ── */}
        <div className="px-8 py-2.5 border-t border-[rgba(255,255,255,0.05)] flex-shrink-0 flex items-center gap-4">
          <span className="text-[11px] text-[#333]">
            <kbd className="px-1 py-0.5 bg-white/5 rounded text-[10px]">@</kbd>
            {' '}mention a note, document, or post
          </span>
          <span className="text-[11px] text-[#333] ml-auto">Auto-saved</span>
        </div>
      </div>
    </>
  );
}
