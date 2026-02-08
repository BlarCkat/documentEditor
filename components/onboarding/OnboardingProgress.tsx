'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-300',
            step === currentStep
              ? 'w-8 bg-white'
              : step < currentStep
              ? 'bg-white/60'
              : 'bg-white/20'
          )}
          aria-current={step === currentStep ? 'step' : undefined}
          aria-label={`Step ${step} of ${totalSteps}`}
        />
      ))}
    </div>
  );
}
