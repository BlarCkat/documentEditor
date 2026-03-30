export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface Subscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired' | 'trialing';
  startDate: Date;
  endDate?: Date;
  paystackSubscriptionCode?: string;
  paystackCustomerCode?: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    pagesPerMonth: number;
    aiTokensPerMonth?: number;
    teamMembers?: number;
  };
  paystackPlanCode?: string;
}

// Onboarding types
export type UserRole = 'creator' | 'writer' | 'marketer' | 'developer' | 'student' | 'other';
export type InterfaceStyle = 'chat' | 'canvas';
export type ThemePreference = 'dark' | 'light';

export interface OnboardingData {
  displayName: string;
  role: UserRole;
  purpose: string;
  interfaceStyle: InterfaceStyle;
  themePreference: ThemePreference;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  subscription: Subscription;
  usage: {
    pagesCreated: number;
    lastResetDate: Date;
  };
  // Onboarding and preferences
  onboardingCompleted: boolean;
  userRole?: UserRole;
  userPurpose?: string;
  interfaceStyle: InterfaceStyle;
  themePreference: ThemePreference;
  sidebarCollapsed: boolean;
}

// Canvas / post types
export type PostType = 'note' | 'document' | 'twitter' | 'instagram' | 'linkedin';

// Canvas types
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteConnection {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  createdAt: Date;
}

// Chat types
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// Canvas viewport
export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}