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
    id: 'pro',
    name: 'Pro',
    price: 20,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited pages',
      'Advanced AI assistance',
      'Multi-platform scheduling',
      'Analytics dashboard',
      'Priority support',
      'Custom templates',
    ],
    limits: {
      pagesPerMonth: -1,
      aiTokensPerMonth: 500000,
      teamMembers: 1,
    },
    paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Collaborative workspace',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated account manager',
      'SSO authentication',
      'API access',
    ],
    limits: {
      pagesPerMonth: -1,
      aiTokensPerMonth: 2000000,
      teamMembers: 10,
    },
    paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_ENTERPRISE_PLAN_CODE,
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