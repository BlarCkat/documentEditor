'use client';

import React from 'react';
import { ThemePreference } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Sun, Moon, Check, Loader2, Sparkles } from 'lucide-react';

interface StepThemeProps {
  themePreference: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function StepTheme({
  themePreference,
  onThemeChange,
  onComplete,
  onBack,
  isSubmitting,
}: StepThemeProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-3">Pick your vibe</h1>
        <p className="text-gray-400">Choose your preferred appearance</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Dark Theme Option */}
        <button
          type="button"
          onClick={() => onThemeChange('dark')}
          disabled={isSubmitting}
          className={cn(
            'relative p-6 rounded-2xl border transition-all text-left',
            themePreference === 'dark'
              ? 'bg-white/10 border-white/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {themePreference === 'dark' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          )}

          {/* Preview */}
          <div className="mb-4 p-4 bg-[#0a0a0a] rounded-xl border border-white/10">
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/20 rounded" />
              <div className="h-2 w-3/4 bg-white/10 rounded" />
              <div className="h-2 w-1/2 bg-white/10 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Moon className="w-5 h-5 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Dark</h3>
          </div>
          <p className="text-sm text-gray-400">Easy on the eyes, perfect for late nights</p>
        </button>

        {/* Light Theme Option */}
        <button
          type="button"
          onClick={() => onThemeChange('light')}
          disabled={isSubmitting}
          className={cn(
            'relative p-6 rounded-2xl border transition-all text-left',
            themePreference === 'light'
              ? 'bg-white/10 border-white/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {themePreference === 'light' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          )}

          {/* Preview */}
          <div className="mb-4 p-4 bg-gray-100 rounded-xl border border-gray-200">
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-300 rounded" />
              <div className="h-2 w-3/4 bg-gray-200 rounded" />
              <div className="h-2 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Sun className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Light</h3>
          </div>
          <p className="text-sm text-gray-400">Clean and bright, great for daytime</p>
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={cn(
            'flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
            isSubmitting
              ? 'bg-white/50 text-black cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-200'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get started
            </>
          )}
        </button>
      </div>
    </div>
  );
}
