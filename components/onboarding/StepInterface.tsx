'use client';

import React from 'react';
import { InterfaceStyle } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft, MessageSquare, Layout, Check } from 'lucide-react';

interface StepInterfaceProps {
  interfaceStyle: InterfaceStyle;
  onInterfaceChange: (style: InterfaceStyle) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepInterface({
  interfaceStyle,
  onInterfaceChange,
  onNext,
  onBack,
}: StepInterfaceProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-3">Choose your workspace</h1>
        <p className="text-gray-400">You can change this anytime in settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chat Style Option */}
        <button
          type="button"
          onClick={() => onInterfaceChange('chat')}
          className={cn(
            'relative p-6 rounded-2xl border transition-all text-left group',
            interfaceStyle === 'chat'
              ? 'bg-white/10 border-white/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          )}
        >
          {interfaceStyle === 'chat' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          )}

          {/* Preview */}
          <div className="mb-4 p-4 bg-black/50 rounded-xl border border-white/10">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-3/4 bg-white/20 rounded" />
                  <div className="h-2 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
              <div className="flex items-start gap-2 justify-end">
                <div className="space-y-1 text-right">
                  <div className="h-2 w-20 bg-indigo-500/40 rounded ml-auto" />
                  <div className="h-2 w-16 bg-indigo-500/20 rounded ml-auto" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
                <div className="h-3 flex-1 bg-white/10 rounded" />
                <div className="w-6 h-6 bg-white/20 rounded" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Chat Style</h3>
          </div>
          <p className="text-sm text-gray-400">
            Conversational interface with AI assistance. Great for quick ideation and writing.
          </p>
        </button>

        {/* Canvas Style Option */}
        <button
          type="button"
          onClick={() => onInterfaceChange('canvas')}
          className={cn(
            'relative p-6 rounded-2xl border transition-all text-left group',
            interfaceStyle === 'canvas'
              ? 'bg-white/10 border-white/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          )}
        >
          {interfaceStyle === 'canvas' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          )}

          {/* Preview */}
          <div className="mb-4 p-4 bg-black/50 rounded-xl border border-white/10 overflow-hidden">
            {/* Dot grid */}
            <div
              className="relative h-24"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            >
              {/* Node cards */}
              <div className="absolute top-2 left-2 w-16 h-10 bg-white/10 rounded border border-white/20 p-1">
                <div className="h-1.5 w-8 bg-white/30 rounded mb-1" />
                <div className="h-1 w-10 bg-white/10 rounded" />
              </div>
              <div className="absolute top-8 right-4 w-16 h-10 bg-white/10 rounded border border-white/20 p-1">
                <div className="h-1.5 w-6 bg-white/30 rounded mb-1" />
                <div className="h-1 w-8 bg-white/10 rounded" />
              </div>
              {/* Connection line */}
              <svg className="absolute inset-0 w-full h-full">
                <line
                  x1="72"
                  y1="24"
                  x2="100"
                  y2="52"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Layout className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Canvas Style</h3>
          </div>
          <p className="text-sm text-gray-400">
            Visual workspace with connected notes. Perfect for organizing ideas and planning.
          </p>
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
