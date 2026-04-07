import { NextRequest, NextResponse } from 'next/server';

export function proxy(_request: NextRequest) {
  const response = NextResponse.next();

  // Prevent browsers from sniffing the MIME type
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Block page from being framed (clickjacking)
  response.headers.set('X-Frame-Options', 'DENY');
  // Stop legacy XSS auditor from breaking pages; CSP handles this now
  response.headers.set('X-XSS-Protection', '0');
  // Don't send Referer header to external sites
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict powerful features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // unsafe-inline needed for Next.js inline scripts + theme script
      // js.paystack.co needed for Paystack inline checkout popup
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Paystack checkout runs in an iframe at checkout.paystack.com
      "frame-src https://checkout.paystack.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.paystack.co https://api.resend.com https://*.paystack.co",
      "frame-ancestors 'none'",
    ].join('; '),
  );

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
