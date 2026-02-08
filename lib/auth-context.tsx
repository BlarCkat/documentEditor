'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, Subscription, OnboardingData } from '@/types';

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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.display_name,
          photoURL: data.photo_url,
          createdAt: new Date(data.created_at),
          subscription: {
            tier: data.subscription_tier || 'free',
            status: data.subscription_status || 'active',
            startDate: data.subscription_start_date ? new Date(data.subscription_start_date) : new Date(),
            endDate: data.subscription_end_date ? new Date(data.subscription_end_date) : undefined,
            paystackSubscriptionCode: data.paystack_subscription_code,
            paystackCustomerCode: data.paystack_customer_code,
          },
          usage: {
            pagesCreated: data.pages_created || 0,
            lastResetDate: data.last_reset_date ? new Date(data.last_reset_date) : new Date(),
          },
          // Onboarding and preferences
          onboardingCompleted: data.onboarding_completed || false,
          userRole: data.user_role,
          userPurpose: data.user_purpose,
          interfaceStyle: data.interface_style || 'chat',
          themePreference: data.theme_preference || 'dark',
          sidebarCollapsed: data.sidebar_collapsed || false,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createUserProfile = async (user: User, displayName?: string): Promise<void> => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('uid')
        .eq('uid', user.id)
        .single();

      if (!existingProfile) {
        const defaultSubscription: Subscription = {
          tier: 'free',
          status: 'active',
          startDate: new Date(),
        };

        const { error } = await supabase.from('users').insert({
          uid: user.id,
          email: user.email || '',
          display_name: displayName || user.user_metadata?.full_name || '',
          photo_url: user.user_metadata?.avatar_url || '',
          created_at: new Date().toISOString(),
          subscription_tier: defaultSubscription.tier,
          subscription_status: defaultSubscription.status,
          subscription_start_date: defaultSubscription.startDate.toISOString(),
          pages_created: 0,
          last_reset_date: new Date().toISOString(),
          // Default onboarding values
          onboarding_completed: false,
          interface_style: 'chat',
          theme_preference: 'dark',
          sidebar_collapsed: false,
        });

        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    // Map TypeScript fields to database columns
    const dbUpdates: Record<string, unknown> = {};

    if (preferences.displayName !== undefined) dbUpdates.display_name = preferences.displayName;
    if (preferences.photoURL !== undefined) dbUpdates.photo_url = preferences.photoURL;
    if (preferences.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = preferences.onboardingCompleted;
    if (preferences.userRole !== undefined) dbUpdates.user_role = preferences.userRole;
    if (preferences.userPurpose !== undefined) dbUpdates.user_purpose = preferences.userPurpose;
    if (preferences.interfaceStyle !== undefined) dbUpdates.interface_style = preferences.interfaceStyle;
    if (preferences.themePreference !== undefined) dbUpdates.theme_preference = preferences.themePreference;
    if (preferences.sidebarCollapsed !== undefined) dbUpdates.sidebar_collapsed = preferences.sidebarCollapsed;

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('uid', user.id);

    if (error) throw error;

    // Refresh the profile after update
    await refreshUserProfile();
  };

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('users')
      .update({
        display_name: data.displayName,
        user_role: data.role,
        user_purpose: data.purpose,
        interface_style: data.interfaceStyle,
        theme_preference: data.themePreference,
        onboarding_completed: true,
      })
      .eq('uid', user.id);

    if (error) throw error;

    // Refresh the profile after onboarding
    await refreshUserProfile();
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(setUserProfile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Create profile on sign up
          if (event === 'SIGNED_IN') {
            await createUserProfile(session.user);
          }
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await createUserProfile(data.user, displayName);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
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
