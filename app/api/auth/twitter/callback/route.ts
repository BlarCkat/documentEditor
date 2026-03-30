import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Twitter OAuth callback
 * Exchanges authorization code for access token, stores in user profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Verify state for CSRF protection
    const storedState = request.cookies.get('twitter_state')?.value;
    if (!state || state !== storedState) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code received' },
        { status: 400 }
      );
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const codeVerifier = request.cookies.get('twitter_code_verifier')?.value;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/twitter/callback`;

    if (!clientId || !clientSecret || !codeVerifier) {
      return NextResponse.json(
        { error: 'Twitter credentials not configured' },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Twitter token exchange error:', error);
      return NextResponse.json(
        { error: 'Token exchange failed' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: 400 }
      );
    }

    const userData = await userInfoResponse.json();

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'User session not found' },
        { status: 401 }
      );
    }

    // Store tokens in user's social_accounts
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('social_accounts')
      .eq('id', session.user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
    }

    const socialAccounts = currentUser?.social_accounts || {};

    const { error: updateError } = await supabase
      .from('users')
      .update({
        social_accounts: {
          ...socialAccounts,
          twitter: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || null,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            userId: userData.data.id,
            username: userData.data.username,
            connectedAt: new Date().toISOString(),
          },
        },
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to save credentials' },
        { status: 500 }
      );
    }

    // Clear cookies and redirect to settings
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?tab=integrations&status=twitter_connected`
    );
    response.cookies.delete('twitter_state');
    response.cookies.delete('twitter_code_verifier');

    return response;
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    return NextResponse.json(
      { error: 'OAuth callback failed' },
      { status: 500 }
    );
  }
}
