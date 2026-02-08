'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft, FileText, Video, Share2, Calendar, Sparkles } from 'lucide-react';

interface StepPurposeProps {
  purpose: string;
  onPurposeChange: (purpose: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const purposeOptions = [
  { value: 'social-content', label: 'Social media content', icon: <Share2 className="w-5 h-5" /> },
  { value: 'blog-articles', label: 'Blog posts & articles', icon: <FileText className="w-5 h-5" /> },
  { value: 'video-scripts', label: 'Video scripts', icon: <Video className="w-5 h-5" /> },
  { value: 'content-calendar', label: 'Content planning', icon: <Calendar className="w-5 h-5" /> },
  { value: 'brainstorming', label: 'Brainstorming ideas', icon: <Sparkles className="w-5 h-5" /> },
];

export function StepPurpose({ purpose, onPurposeChange, onNext, onBack }: StepPurposeProps) {
  const canContinue = purpose.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canContinue) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-3">What brings you here?</h1>
        <p className="text-gray-400">This helps us tailor your experience</p>
      </div>

      <div className="space-y-4">
        {/* Quick select options */}
        <div className="grid grid-cols-1 gap-3">
          {purposeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPurposeChange(option.value)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                purpose === option.value
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg',
                purpose === option.value ? 'bg-white/20' : 'bg-white/5'
              )}>
                {option.icon}
              </div>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 flex items-center justify-center">
            <span className="px-2 bg-black text-xs text-gray-500">or tell us more</span>
          </div>
          <div className="border-t border-white/10 pt-6 mt-4">
            <textarea
              value={purposeOptions.some((o) => o.value === purpose) ? '' : purpose}
              onChange={(e) => onPurposeChange(e.target.value)}
              placeholder="I want to use Enfinotes for..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors resize-none"
            />
          </div>
        </div>
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
          type="submit"
          disabled={!canContinue}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
            canContinue
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
          )}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
