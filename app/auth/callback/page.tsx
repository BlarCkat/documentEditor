'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const hasExchanged = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode double-invoke: refs persist through
    // the mount→unmount→remount cycle, so this runs exactly once.
    if (hasExchanged.current) return;
    hasExchanged.current = true;

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            console.error('OAuth callback error:', error.message);
            router.replace('/auth/signin?error=oauth_failed');
          } else if (data.session) {
            router.replace('/dashboard');
          } else {
            router.replace('/auth/signin');
          }
        })
        .catch((error) => {
          if (error?.name !== 'AbortError') {
            console.error('OAuth callback error:', error);
          }
          router.replace('/auth/signin');
        });
      return;
    }

    // No code in URL — check if Supabase already established a session
    // (handles implicit flow where tokens arrive in the URL hash)
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        router.replace(session ? '/dashboard' : '/auth/signin');
      })
      .catch(() => {
        router.replace('/auth/signin');
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
    </div>
  );
}
