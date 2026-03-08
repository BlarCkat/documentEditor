'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, OnboardingData } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows — expected for new users, not a real error
    if (error.code !== 'PGRST116') {
      console.error('fetchUserProfile error:', error.message, '| code:', error.code, '| hint:', error.hint);
    }
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    photoURL: data.photo_url,
    createdAt: new Date(data.created_at),
    subscription: {
      tier: data.subscription_tier || 'free',
      status: data.subscription_status || 'active',
      startDate: data.subscription_start_date
        ? new Date(data.subscription_start_date)
        : new Date(),
      endDate: data.subscription_end_date
        ? new Date(data.subscription_end_date)
        : undefined,
      paystackSubscriptionCode: data.paystack_subscription_code,
      paystackCustomerCode: data.paystack_customer_code,
    },
    usage: {
      pagesCreated: data.pages_created || 0,
      lastResetDate: data.last_reset_date
        ? new Date(data.last_reset_date)
        : new Date(),
    },
    onboardingCompleted: data.onboarding_completed || false,
    userRole: data.user_role,
    userPurpose: data.user_purpose,
    interfaceStyle: data.interface_style || 'chat',
    themePreference: data.theme_preference || 'dark',
    sidebarCollapsed: data.sidebar_collapsed || false,
  };
}

async function createUserProfile(user: User, displayName?: string): Promise<void> {
  // Check if profile already exists before inserting
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) return;

  const { error } = await supabase.from('users').insert({
    id: user.id,
    email: user.email || '',
    display_name: displayName || user.user_metadata?.full_name || '',
    subscription_tier: 'free',
    subscription_status: 'active',
    subscription_start_date: new Date().toISOString(),
    pages_created: 0,
    last_reset_date: new Date().toISOString(),
    onboarding_completed: false,
    interface_style: 'chat',
    theme_preference: 'dark',
    sidebar_collapsed: false,
  });

  if (error) {
    console.error('createUserProfile error:', error.message, '| code:', error.code);
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // loading = true until the INITIAL_SESSION event resolves (with or without a user)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately on subscribe,
    // giving us the current session without needing a separate getSession() call.
    // This avoids the navigator.locks AbortError caused by double-invocation
    // in React Strict Mode.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (event === 'SIGNED_IN') {
            // Create a profile row for new users (no-op if already exists)
            await createUserProfile(session.user);
          }

          // Fetch the profile on any event that establishes or updates identity
          if (
            event === 'INITIAL_SESSION' ||
            event === 'SIGNED_IN' ||
            event === 'USER_UPDATED'
          ) {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        } else {
          // Signed out — clear profile
          setUserProfile(null);
        }

        // Mark auth as initialized after the first event
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  const refreshUserProfile = async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.id);
    setUserProfile(profile);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    if (error) throw error;
    // Profile creation is handled by onAuthStateChange SIGNED_IN
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const updateUserPreferences = async (preferences: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const dbUpdates: Record<string, unknown> = {};
    if (preferences.displayName !== undefined) dbUpdates.display_name = preferences.displayName;
    if (preferences.photoURL !== undefined) dbUpdates.photo_url = preferences.photoURL;
    if (preferences.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = preferences.onboardingCompleted;
    if (preferences.userRole !== undefined) dbUpdates.user_role = preferences.userRole;
    if (preferences.userPurpose !== undefined) dbUpdates.user_purpose = preferences.userPurpose;
    if (preferences.interfaceStyle !== undefined) dbUpdates.interface_style = preferences.interfaceStyle;
    if (preferences.themePreference !== undefined) dbUpdates.theme_preference = preferences.themePreference;
    if (preferences.sidebarCollapsed !== undefined) dbUpdates.sidebar_collapsed = preferences.sidebarCollapsed;

    const { error } = await supabase.from('users').update(dbUpdates).eq('id', user.id);
    if (error) throw error;

    await refreshUserProfile();
  };

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) throw new Error('No user logged in');

    // upsert handles both new accounts (no row yet) and existing accounts
    const { error } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: user.email || '',
        display_name: data.displayName,
        user_role: data.role,
        user_purpose: data.purpose,
        interface_style: data.interfaceStyle,
        theme_preference: data.themePreference,
        onboarding_completed: true,
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        pages_created: 0,
        last_reset_date: new Date().toISOString(),
        sidebar_collapsed: false,
      },
      { onConflict: 'id' }
    );
    if (error) throw error;

    await refreshUserProfile();
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshUserProfile,
    updateUserPreferences,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
