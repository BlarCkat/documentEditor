import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/** Escape characters that are special in HTML to prevent injection in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Admin client — never expose the service role key to the browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function confirmationEmailHtml(rawDisplayName: string, confirmationUrl: string): string {
  const displayName = escapeHtml(rawDisplayName);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Confirm your Enfinotes account</title>
</head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#000;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#0c0c0c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">

          <!-- Logo bar -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:rgba(255,255,255,0.07);border-radius:8px;padding:7px 12px;">
                    <span style="color:#fff;font-size:14px;font-weight:600;letter-spacing:-0.3px;">Enfinotes</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 36px;">
              <h1 style="color:#fff;font-size:22px;font-weight:600;margin:0 0 10px;letter-spacing:-0.4px;">Confirm your email address</h1>
              <p style="color:#8a8f98;font-size:15px;line-height:1.65;margin:0 0 28px;">
                Hi ${displayName || 'there'}, thanks for signing up for Enfinotes! Please confirm your email address to activate your account and start creating.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:10px;background:#fff;">
                    <a href="${confirmationUrl}"
                       style="display:inline-block;padding:14px 28px;color:#000;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-0.2px;border-radius:10px;">
                      Confirm email address →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#555;font-size:13px;line-height:1.6;margin:24px 0 0;">
                This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 24px;">
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="color:#555;font-size:12px;margin:0;line-height:1.7;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color:#6366f1;word-break:break-all;font-size:11px;">${confirmationUrl}</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <p style="color:#333;font-size:12px;margin:20px 0 0;text-align:center;">
          © ${new Date().getFullYear()} Enfinotes. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Create the user via the admin API so Supabase does NOT auto-send its
    // default confirmation email — we send our own custom one below.
    const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: displayName || '' },
      email_confirm: false,
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Generate a confirmation link without sending Supabase's default email
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('generateLink error:', linkError);
      // User is created — don't fail the whole request, just skip the email
      return NextResponse.json({ success: true, emailSent: false });
    }

    const confirmationUrl = linkData.properties.action_link;

    // Send our custom branded email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Enfinotes <noreply@enfinotes.com>',
        to: email,
        subject: 'Confirm your Enfinotes account',
        html: confirmationEmailHtml(displayName || '', confirmationUrl),
      }),
    });

    if (!emailRes.ok) {
      console.error('Resend error:', await emailRes.text());
    }

    return NextResponse.json({ success: true, emailSent: emailRes.ok });
  } catch (error) {
    console.error('Signup route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
