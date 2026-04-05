import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import type { SubscriptionTier } from '@/types';

function getTierFromPlanCode(planCode: string): SubscriptionTier {
  if (planCode === process.env.NEXT_PUBLIC_PAYSTACK_BASIC_PLAN_CODE) return 'basic';
  if (planCode === process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE) return 'pro';
  // Fallback: treat unknown paid plan as basic
  return 'basic';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'subscription.create':
      case 'subscription.enable': {
        const userId = event.data.customer?.metadata?.userId;
        const planCode = event.data.plan?.plan_code;
        const subscriptionCode = event.data.subscription_code;
        const customerCode = event.data.customer?.customer_code;

        if (isValidUUID(userId)) {
          const tier = planCode ? getTierFromPlanCode(planCode) : 'basic';
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_tier: tier,
              subscription_start_date: new Date().toISOString(),
              ...(subscriptionCode && { paystack_subscription_code: subscriptionCode }),
              ...(customerCode && { paystack_customer_code: customerCode }),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'subscription.disable': {
        const userId = event.data.customer?.metadata?.userId;
        if (isValidUUID(userId)) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'cancelled',
              subscription_tier: 'free',
            })
            .eq('id', userId);
        }
        break;
      }

      case 'charge.success': {
        const userId = event.data.metadata?.userId;
        const tier = (event.data.metadata?.subscriptionTier as SubscriptionTier) || 'basic';
        if (isValidUUID(userId)) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_tier: tier,
              last_payment_date: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    // Don't expose internal error details to the caller
    console.error('Webhook processing error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/** Basic UUID v4 check — rejects arbitrary strings as userId */
function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
