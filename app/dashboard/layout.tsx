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
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      if (userProfile && !userProfile.onboardingCompleted) {
        router.push('/onboarding');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Account exists in auth but has no profile row (created before the fix)
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-400 text-xl">!</span>
          </div>
          <h2 className="text-white text-lg font-medium mb-2">Complete your profile</h2>
          <p className="text-[#8a8f98] text-sm mb-6">
            Your account details are incomplete. Set up your profile to continue.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full h-11 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            Set up profile
          </button>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
