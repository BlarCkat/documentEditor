import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser, unauthorizedResponse } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  // Require authenticated user
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const { subscriptionCode } = await request.json();
    if (!subscriptionCode || typeof subscriptionCode !== 'string') {
      return NextResponse.json({ error: 'Subscription code is required' }, { status: 400 });
    }

    // Verify this subscription code belongs to the calling user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('paystack_subscription_code')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (profile.paystack_subscription_code !== subscriptionCode) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 403 });
    }

    const response = await fetch('https://api.paystack.co/subscription/disable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: subscriptionCode, token: subscriptionCode }),
    });

    const data = await response.json();
    if (data.status) {
      return NextResponse.json({ status: 'success', message: 'Subscription canceled successfully' });
    }

    return NextResponse.json({ status: 'failed', message: data.message || 'Cancellation failed' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
