'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { OnboardingFlow } from '@/components/onboarding';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Redirect if onboarding already completed
      if (userProfile?.onboardingCompleted) {
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  // Show loading while checking auth state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // If onboarding is already completed, don't render the flow
  if (userProfile.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return <OnboardingFlow />;
}
