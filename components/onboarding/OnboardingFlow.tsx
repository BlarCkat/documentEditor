'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/components/theme';
import { OnboardingData, UserRole, InterfaceStyle, ThemePreference } from '@/types';
import { OnboardingProgress } from './OnboardingProgress';
import { StepName } from './StepName';
import { StepPurpose } from './StepPurpose';
import { StepInterface } from './StepInterface';
import { StepTheme } from './StepTheme';
import { BookOpen } from 'lucide-react';

const TOTAL_STEPS = 4;

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { completeOnboarding, userProfile } = useAuth();
  const { setTheme } = useTheme();

  // Form state
  const [formData, setFormData] = useState<OnboardingData>({
    displayName: userProfile?.displayName || '',
    role: 'creator',
    purpose: '',
    interfaceStyle: 'chat',
    themePreference: 'dark',
  });

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Apply theme preference immediately
      setTheme(formData.themePreference);

      // Save to database
      await completeOnboarding(formData);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences. Please try again.');
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepName
            displayName={formData.displayName}
            role={formData.role}
            onDisplayNameChange={(name) => updateFormData({ displayName: name })}
            onRoleChange={(role) => updateFormData({ role })}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <StepPurpose
            purpose={formData.purpose}
            onPurposeChange={(purpose) => updateFormData({ purpose })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepInterface
            interfaceStyle={formData.interfaceStyle}
            onInterfaceChange={(style) => updateFormData({ interfaceStyle: style })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <StepTheme
            themePreference={formData.themePreference}
            onThemeChange={(theme) => updateFormData({ themePreference: theme })}
            onComplete={handleComplete}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-medium">Enfinotes</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-lg">
          {/* Progress indicator */}
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step content with animation */}
          <AnimatePresence mode="wait" custom={currentStep}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
