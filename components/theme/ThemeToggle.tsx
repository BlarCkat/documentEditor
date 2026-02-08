'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg transition-colors',
        'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20',
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-yellow-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
      {showLabel && (
        <span className="text-sm">
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
}
