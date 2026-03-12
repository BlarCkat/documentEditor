'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Wand2, Scissors, Sparkles, AlignLeft, Globe, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Command = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const COMMANDS: Command[] = [
  { id: 'extend',    label: 'Extend',    description: 'Make it longer',           icon: ArrowUpRight },
  { id: 'autowrite', label: 'Autowrite', description: 'Generate from title',      icon: Wand2 },
  { id: 'shorten',   label: 'Shorten',   description: 'Make it shorter',          icon: Scissors },
  { id: 'improve',   label: 'Improve',   description: 'Improve writing quality',  icon: Sparkles },
  { id: 'summarize', label: 'Summarize', description: 'Condense to key points',   icon: AlignLeft },
  { id: 'translate', label: 'Translate', description: 'Translate to a language',  icon: Globe },
];

interface SlashTextareaProps {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  title?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

export function SlashTextarea({
  value,
  onChange,
  onBlur,
  title = '',
  placeholder,
  className,
  maxLength,
  autoFocus,
}: SlashTextareaProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashPosRef = useRef(-1);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().startsWith(query.toLowerCase())
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setQuery('');
    setActiveIndex(0);
    slashPosRef.current = -1;
  }, []);

  const runCommand = useCallback(
    async (commandId: string) => {
      closeMenu();
      setBusy(true);

      const slashIdx = slashPosRef.current;
      // Remove the "/command" text the user typed
      const before = slashIdx >= 0 ? value.slice(0, slashIdx) : value;

      let result = before;
      switch (commandId) {
        case 'extend':
          result = before
            ? before.trimEnd() + '\n\nThis idea can be explored further — continue developing the thought here.'
            : `Here's an expanded exploration of "${title || 'this topic'}":\n\nAdd more depth by developing key themes, adding examples, or expanding on the core concept.`;
          break;
        case 'autowrite':
          result = before.trimEnd()
            || `Here's a draft for "${title || 'this note'}":\n\nBegin with a clear statement of your main idea. Support it with relevant points, evidence, or examples. Conclude with the key takeaway or call to action.`;
          break;
        case 'shorten': {
          const sentences = before.match(/[^.!?]+[.!?]+/g) ?? [before];
          result = sentences.slice(0, 2).join(' ').trim();
          break;
        }
        case 'improve':
          result = before
            .replace(/\bi\b/g, 'I')
            .replace(/\s{2,}/g, ' ')
            .trim();
          break;
        case 'summarize': {
          const words = before.trim().split(/\s+/);
          result = words.length > 20
            ? 'Summary: ' + words.slice(0, 20).join(' ') + '…'
            : before;
          break;
        }
        case 'translate':
          result = before
            ? `[Translation of: "${before.slice(0, 60)}${before.length > 60 ? '…' : ''}"]\n\n(Connect an AI service to enable live translation.)`
            : '';
          break;
      }

      onChange(result);
      setBusy(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    },
    [value, onChange, title, closeMenu]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    onChange(v);

    const cursor = e.target.selectionStart;
    const textBefore = v.slice(0, cursor);
    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const currentLine = textBefore.slice(lineStart);

    if (currentLine.startsWith('/')) {
      slashPosRef.current = lineStart;
      setQuery(currentLine.slice(1));
      setMenuOpen(true);
      setActiveIndex(0);
    } else {
      if (menuOpen) closeMenu();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!menuOpen) return;
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIndex]) runCommand(filtered[activeIndex].id); }
    else if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={busy ? '⚙ Processing…' : value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => { setTimeout(closeMenu, 120); onBlur(); }}
        placeholder={placeholder}
        maxLength={maxLength}
        className={className}
        autoFocus={autoFocus}
        disabled={busy}
      />

      {menuOpen && filtered.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
            Commands
          </p>
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors nodrag',
                i === activeIndex ? 'bg-accent' : 'hover:bg-accent/60'
              )}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); runCommand(cmd.id); }}
            >
              <cmd.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">{cmd.label}</p>
                <p className="text-[10px] text-muted-foreground">{cmd.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
