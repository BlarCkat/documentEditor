import { SubscriptionPlan } from '@/types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '3 pages per month',
      'Basic AI assistance',
      'Single platform posting',
      'Email support',
    ],
    limits: {
      pagesPerMonth: 3,
      aiTokensPerMonth: 10000,
      teamMembers: 1,
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 5,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited pages',
      'AI writing assistant',
      'Multi-platform posting',
      'Analytics dashboard',
      'Email support',
    ],
    limits: {
      pagesPerMonth: -1,
      aiTokensPerMonth: 100000,
      teamMembers: 1,
    },
    paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_BASIC_PLAN_CODE,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 144,
    currency: 'USD',
    interval: 'yearly',
    features: [
      'Everything in Basic',
      'Priority AI (500K tokens/mo)',
      'Advanced analytics',
      'Custom templates',
      'Priority support',
    ],
    limits: {
      pagesPerMonth: -1,
      aiTokensPerMonth: 500000,
      teamMembers: 1,
    },
    paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE,
  },
];

export const getSubscriptionPlan = (tier: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === tier);
};

export const canCreatePage = (
  currentUsage: number,
  subscriptionTier: string
): boolean => {
  const plan = getSubscriptionPlan(subscriptionTier);
  if (!plan) return false;
  if (plan.limits.pagesPerMonth === -1) return true;
  return currentUsage < plan.limits.pagesPerMonth;
};
