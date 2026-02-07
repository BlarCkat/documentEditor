import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
        break;
      case 'subscription.disable':
        // Handle subscription cancellation
        break;
      case 'charge.success':
        if (event.data.metadata?.userId) {
          const userRef = doc(db, 'users', event.data.metadata.userId);
          await updateDoc(userRef, {
            'subscription.status': 'active',
            'subscription.lastPaymentDate': new Date(),
          });
        }
        break;
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}