'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Send, Paperclip, AtSign, Slash } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

interface MenuOption {
  label: string;
  description: string;
}

const atMentionOptions: MenuOption[] = [
  { label: 'Tone Matcher', description: 'Match your writing style' },
  { label: 'Trend Researcher', description: 'Find trending topics' },
  { label: 'Hook Specialist', description: 'Create engaging hooks' },
];

const slashOptions: MenuOption[] = [
  { label: 'Summarize', description: 'Create a summary' },
  { label: 'Rewrite as Thread', description: 'Convert to thread format' },
  { label: 'Optimize Hooks', description: 'Improve your hooks' },
  { label: 'Brainstorm', description: 'Generate ideas' },
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showMenu, setShowMenu] = useState<'at' | 'slash' | null>(null);
  const [menuIndex, setMenuIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentOptions = showMenu === 'at' ? atMentionOptions : slashOptions;

  useEffect(() => {
    setMenuIndex(0);
  }, [showMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMenuIndex((prev) => (prev + 1) % currentOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMenuIndex((prev) => (prev - 1 + currentOptions.length) % currentOptions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectOption(currentOptions[menuIndex]);
      } else if (e.key === 'Escape') {
        setShowMenu(null);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Check for @ or / triggers
    const lastChar = newValue.slice(-1);
    const prevChar = newValue.slice(-2, -1);

    if (lastChar === '@' && (prevChar === '' || prevChar === ' ')) {
      setShowMenu('at');
    } else if (lastChar === '/' && (prevChar === '' || prevChar === ' ')) {
      setShowMenu('slash');
    } else if (showMenu && lastChar === ' ') {
      setShowMenu(null);
    }
  };

  const handleSelectOption = (option: MenuOption) => {
    const prefix = showMenu === 'at' ? '@' : '/';
    // Remove the trigger character and add the selected option
    const newValue = value.slice(0, -1) + prefix + option.label + ' ';
    setValue(newValue);
    setShowMenu(null);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
      setShowMenu(null);
    }
  };

  return (
    <div className="relative">
      {/* Command menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-0 w-64 bg-[#0c0c0c] border border-white/10 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-white/10">
              <span className="text-xs text-gray-500 font-medium">
                {showMenu === 'at' ? 'Mention Agent' : 'Quick Actions'}
              </span>
            </div>
            <div className="p-1">
              {currentOptions.map((option, index) => (
                <button
                  key={option.label}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    'w-full flex flex-col items-start px-3 py-2 rounded-lg transition-colors',
                    index === menuIndex ? 'bg-white/10' : 'hover:bg-white/5'
                  )}
                >
                  <span className="text-sm text-white">{option.label}</span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className="flex items-end gap-2 bg-[#0c0c0c] border border-white/10 rounded-2xl p-2">
        {/* Attachment button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Enfinotes..."
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none py-2 max-h-32',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ minHeight: '24px' }}
        />

        {/* Hint buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowMenu(showMenu === 'at' ? null : 'at')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showMenu === 'at' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
            )}
            aria-label="Mention agent"
          >
            <AtSign className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowMenu(showMenu === 'slash' ? null : 'slash')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              showMenu === 'slash' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
            )}
            aria-label="Quick actions"
          >
            <Slash className="w-4 h-4" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={cn(
            'p-2 rounded-xl transition-colors',
            value.trim() && !disabled
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-gray-600 mt-2 text-center">
        Press <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}
