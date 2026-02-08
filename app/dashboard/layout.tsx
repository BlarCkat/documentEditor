'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/dashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Redirect to onboarding if not completed
      if (userProfile && !userProfile.onboardingCompleted) {
        router.push('/onboarding');
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

  // Wait for user profile to load
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
