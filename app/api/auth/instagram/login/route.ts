import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Instagram OAuth login initiation (via Facebook)
 * Instagram uses Facebook OAuth, so we redirect to Facebook
 */
export async function GET(request: NextRequest) {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/instagram/callback`;

    if (!appId) {
      return NextResponse.json(
        { error: 'Facebook app ID not configured' },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(32).toString('hex');

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'instagram_basic,instagram_graph_user_media');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('instagram_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Instagram OAuth login error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}
