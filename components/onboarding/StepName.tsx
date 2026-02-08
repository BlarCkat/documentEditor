'use client';

import React from 'react';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import {
  Palette,
  PenTool,
  Megaphone,
  Code,
  GraduationCap,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';

interface StepNameProps {
  displayName: string;
  role: UserRole;
  onDisplayNameChange: (name: string) => void;
  onRoleChange: (role: UserRole) => void;
  onNext: () => void;
}

const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'creator', label: 'Creator', icon: <Palette className="w-5 h-5" /> },
  { value: 'writer', label: 'Writer', icon: <PenTool className="w-5 h-5" /> },
  { value: 'marketer', label: 'Marketer', icon: <Megaphone className="w-5 h-5" /> },
  { value: 'developer', label: 'Developer', icon: <Code className="w-5 h-5" /> },
  { value: 'student', label: 'Student', icon: <GraduationCap className="w-5 h-5" /> },
  { value: 'other', label: 'Other', icon: <MoreHorizontal className="w-5 h-5" /> },
];

export function StepName({
  displayName,
  role,
  onDisplayNameChange,
  onRoleChange,
  onNext,
}: StepNameProps) {
  const canContinue = displayName.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canContinue) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-3">Welcome to Enfinotes</h1>
        <p className="text-gray-400">Let's personalize your experience</p>
      </div>

      <div className="space-y-6">
        {/* Name input */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-2">
            What should we call you?
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            autoFocus
          />
        </div>

        {/* Role selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            What best describes you?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => onRoleChange(r.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                  role === r.value
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                )}
              >
                {r.icon}
                <span className="text-sm">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        type="submit"
        disabled={!canContinue}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
          canContinue
            ? 'bg-white text-black hover:bg-gray-200'
            : 'bg-white/10 text-gray-500 cursor-not-allowed'
        )}
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
