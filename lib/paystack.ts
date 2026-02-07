import { SubscriptionTier } from '@/types';

export interface PaystackConfig {
  email: string;
  amount: number;
  planCode: string;
  metadata?: {
    userId: string;
    subscriptionTier: SubscriptionTier;
  };
}

export const initializePaystackPayment = (config: PaystackConfig) => {
  return {
    email: config.email,
    amount: config.amount * 100,
    plan: config.planCode,
    metadata: config.metadata,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };
};

export const verifyPaystackPayment = async (reference: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/paystack/verify?reference=${reference}`);
    if (!response.ok) throw new Error('Payment verification failed');
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

export const cancelPaystackSubscription = async (
  subscriptionCode: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/paystack/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionCode }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
};