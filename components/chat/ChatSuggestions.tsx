'use client';

import React from 'react';
import { PenTool, Lightbulb, FileText, Calendar } from 'lucide-react';

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: PenTool,
    label: 'Write a script',
    prompt: 'Help me write a script for a short video about productivity tips',
  },
  {
    icon: Lightbulb,
    label: 'Brainstorm ideas',
    prompt: 'Give me 5 content ideas for social media this week',
  },
  {
    icon: FileText,
    label: 'Draft a post',
    prompt: 'Help me draft a LinkedIn post about my recent project',
  },
  {
    icon: Calendar,
    label: 'Plan content',
    prompt: 'Help me plan my content calendar for the next month',
  },
];

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          onClick={() => onSelect(suggestion.prompt)}
          className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-white/20 transition-colors group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            <suggestion.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            {suggestion.label}
          </span>
        </button>
      ))}
    </div>
  );
}
