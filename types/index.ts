export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

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

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  subscription: Subscription;
  usage: {
    pagesCreated: number;
    lastResetDate: Date;
  };
}