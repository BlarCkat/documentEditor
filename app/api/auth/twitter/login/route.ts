import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Twitter OAuth login initiation
 * Generates OAuth URL and state, stores state in session/cookie
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/twitter/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Twitter client ID not configured' },
        { status: 500 }
      );
    }

    // Generate PKCE code challenge
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Build authorization URL
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'tweet.write tweet.read users.read');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    // Store state and code_verifier in response headers (using cookie)
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('twitter_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });
    response.cookies.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Twitter OAuth login error:', error);
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    );
  }
}
