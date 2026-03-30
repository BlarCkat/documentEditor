import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const storedState = request.cookies.get('linkedin_state')?.value;
    if (!state || state !== storedState) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;

    if (!clientId || !clientSecret || !code) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      return NextResponse.json({ error: 'Token exchange failed', details: error }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

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

    // Update user with LinkedIn token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        social_accounts: {
          ...socialAccounts,
          linkedin: {
            accessToken: tokenData.access_token,
            refreshToken: null,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            userId: userData.id,
            username: userData.localizedFirstName || 'LinkedIn User',
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
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?tab=integrations&status=linkedin_connected`
    );
    response.cookies.delete('linkedin_state');

    return response;
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}
