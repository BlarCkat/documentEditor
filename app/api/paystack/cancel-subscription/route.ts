import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subscriptionCode } = await request.json();
    if (!subscriptionCode) {
      return NextResponse.json({ error: 'Subscription code is required' }, { status: 400 });
    }

    const response = await fetch(`https://api.paystack.co/subscription/disable`, {
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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}