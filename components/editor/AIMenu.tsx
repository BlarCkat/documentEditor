'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIAction =
  | 'continue'
  | 'improve'
  | 'shorten'
  | 'lengthen'
  | 'summarize'
  | 'tone_professional'
  | 'tone_casual'
  | 'tone_creative'
  | 'custom';

const ACTIONS: { label: string; value: AIAction; description: string }[] = [
  { label: 'Continue writing',   value: 'continue',          description: 'Generate the next part of your text'     },
  { label: 'Improve writing',    value: 'improve',           description: 'Rewrite for clarity and flow'            },
  { label: 'Make shorter',       value: 'shorten',           description: 'Condense without losing meaning'         },
  { label: 'Make longer',        value: 'lengthen',          description: 'Expand with more detail'                 },
  { label: 'Summarize',          value: 'summarize',         description: 'Create a brief summary'                  },
];

const TONES: { label: string; value: AIAction }[] = [
  { label: 'Professional', value: 'tone_professional' },
  { label: 'Casual',       value: 'tone_casual'       },
  { label: 'Creative',     value: 'tone_creative'     },
];

interface AIMenuProps {
  open: boolean;
  position: { x: number; y: number };
  loading: boolean;
  onAction: (action: AIAction, customPrompt?: string) => void;
  onClose: () => void;
}

export function AIMenu({ open, position, loading, onAction, onClose }: AIMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showTones,    setShowTones]    = useState(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => window.addEventListener('mousedown', handler), 0);
    return () => window.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  // Clamp position to viewport
  const MENU_W = 248, MENU_H = 340;
  const x = Math.min(position.x, window.innerWidth  - MENU_W - 8);
  const y = Math.min(position.y, window.innerHeight - MENU_H - 8);

  const handleCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) { onAction('custom', customPrompt.trim()); setCustomPrompt(''); }
  };

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: x, top: y, zIndex: 9999, width: MENU_W }}
      className="bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[rgba(255,255,255,0.07)]">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-[#f0f0f0]">Enfin AI</span>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-purple-400 ml-auto" />}
        {!loading && (
          <button onClick={onClose} className="ml-auto text-[#555] hover:text-[#888] transition-colors">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="px-4 py-6 flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <p className="text-xs text-[#888]">Generating…</p>
        </div>
      ) : (
        <>
          {/* Actions */}
          <div className="py-1">
            {ACTIONS.map((a) => (
              <button
                key={a.value}
                onClick={() => onAction(a.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/5 transition-colors group"
              >
                <span className="text-xs text-[#f0f0f0] flex-1">{a.label}</span>
                <span className="text-[10px] text-[#444] group-hover:text-[#666] transition-colors hidden group-hover:block">
                  {a.description}
                </span>
              </button>
            ))}

            {/* Change tone submenu */}
            <button
              onClick={() => setShowTones((v) => !v)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-xs text-[#f0f0f0] flex-1">Change tone</span>
              <ChevronRight className={cn('w-3 h-3 text-[#555] transition-transform', showTones && 'rotate-90')} />
            </button>
            {showTones && (
              <div className="pl-6 border-l border-[rgba(255,255,255,0.05)] ml-3">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onAction(t.value)}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#888] hover:text-[#f0f0f0] hover:bg-white/5 transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom prompt */}
          <div className="border-t border-[rgba(255,255,255,0.07)] p-2">
            <form onSubmit={handleCustom} className="flex gap-1.5">
              <input
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask Enfin AI anything…"
                className="flex-1 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-md px-2.5 py-1.5 text-xs text-[#f0f0f0] placeholder:text-[#444] focus:outline-none focus:border-purple-500/50"
                autoFocus
              />
              <button
                type="submit"
                disabled={!customPrompt.trim()}
                className="p-1.5 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>

          <div className="px-3 pb-2">
            <p className="text-[10px] text-[#333]">
              ⌃Space to open · Esc to close
            </p>
          </div>
        </>
      )}
    </div>
  );
}
