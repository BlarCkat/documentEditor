import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'LinkedIn client ID not configured' },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(32).toString('hex');

    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'w_member_social');

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('linkedin_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('LinkedIn OAuth login error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}
