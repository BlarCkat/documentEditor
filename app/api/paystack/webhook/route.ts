import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'subscription.create':
      case 'subscription.enable':
        // Handle subscription activation
        if (event.data.customer?.metadata?.userId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_tier: 'pro',
            })
            .eq('id',event.data.customer.metadata.userId);
        }
        break;
      case 'subscription.disable':
        // Handle subscription cancellation
        if (event.data.customer?.metadata?.userId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'cancelled',
              subscription_tier: 'free',
            })
            .eq('id',event.data.customer.metadata.userId);
        }
        break;
      case 'charge.success':
        if (event.data.metadata?.userId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              last_payment_date: new Date().toISOString(),
            })
            .eq('id',event.data.metadata.userId);
        }
        break;
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
