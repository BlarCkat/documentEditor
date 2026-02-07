import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = await response.json();
    if (data.status && data.data.status === 'success') {
      return NextResponse.json({ status: 'success', data: data.data });
    }

    return NextResponse.json(
      { status: 'failed', message: 'Payment verification failed' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}