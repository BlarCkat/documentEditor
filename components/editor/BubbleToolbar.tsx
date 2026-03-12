'use client';

import React, { useState } from 'react';
import { BubbleMenu, type Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Code, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIAction } from './AIMenu';

function Btn({
  icon: Icon, active, onClick, title, className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active
          ? 'bg-white/20 text-white'
          : 'text-white/60 hover:text-white hover:bg-white/10',
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

const AI_QUICK: { label: string; value: AIAction }[] = [
  { label: 'Improve',  value: 'improve'  },
  { label: 'Shorten',  value: 'shorten'  },
  { label: 'Lengthen', value: 'lengthen' },
  { label: 'Professional tone', value: 'tone_professional' },
  { label: 'Casual tone',       value: 'tone_casual'       },
];

interface BubbleToolbarProps {
  editor: Editor;
  onAIAction: (action: AIAction) => void;
  aiLoading: boolean;
}

export function BubbleToolbar({ editor, onAIAction, aiLoading }: BubbleToolbarProps) {
  const [showAI, setShowAI] = useState(false);

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 120, placement: 'top', zIndex: 9990, offset: [0, 8] }}
    >
      <div className="flex items-center gap-0.5 px-1.5 py-1.5 bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl backdrop-blur-sm">
        {/* Formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}   active={editor.isActive('bold')}   icon={Bold}          title="Bold"          />
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic}        title="Italic"        />
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}   active={editor.isActive('code')}   icon={Code}          title="Code"          />

        <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />

        {/* AI quick actions */}
        {aiLoading ? (
          <div className="flex items-center gap-1.5 px-2 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span className="text-[11px] text-purple-300">Generating…</span>
          </div>
        ) : (
          <div className="relative">
            <button
              onMouseDown={(e) => { e.preventDefault(); setShowAI((v) => !v); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-purple-300 hover:text-white hover:bg-purple-500/20 transition-colors text-xs font-medium"
            >
              <Sparkles className="w-3 h-3" />
              Enfin AI
              <ChevronDown className={cn('w-3 h-3 transition-transform', showAI && 'rotate-180')} />
            </button>

            {showAI && (
              <div className="absolute bottom-full mb-2 left-0 bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl py-1 min-w-[160px]">
                <p className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-[#555] uppercase tracking-wider">
                  Apply to selection
                </p>
                {AI_QUICK.map((a) => (
                  <button
                    key={a.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowAI(false);
                      onAIAction(a.value);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#e0e0e0] hover:bg-white/5 transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}
