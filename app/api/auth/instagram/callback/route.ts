import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const storedState = request.cookies.get('instagram_state')?.value;
    if (!state || state !== storedState) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/instagram/callback`;

    if (!appId || !appSecret || !code) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.instagram.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      return NextResponse.json({ error: 'Token exchange failed', details: error }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();

    // Get user info — token sent in Authorization header, not URL, to avoid logging exposure
    const userInfoResponse = await fetch(
      'https://graph.instagram.com/v18.0/me?fields=id,username',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    if (!userInfoResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 400 });
    }

    const userData = await userInfoResponse.json();

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User session not found' }, { status: 401 });
    }

    // Fetch current social accounts
    const { data: currentUser } = await supabase
      .from('users')
      .select('social_accounts')
      .eq('id', session.user.id)
      .single();

    const socialAccounts = currentUser?.social_accounts || {};

    // Update user with Instagram token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        social_accounts: {
          ...socialAccounts,
          instagram: {
            accessToken: tokenData.access_token,
            refreshToken: null,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            userId: userData.id,
            username: userData.username,
            connectedAt: new Date().toISOString(),
          },
        },
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 });
    }

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?tab=integrations&status=instagram_connected`
    );
    response.cookies.delete('instagram_state');

    return response;
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}
