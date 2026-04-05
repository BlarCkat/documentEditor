import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * Extracts and validates the Supabase session from an incoming API request.
 * Reads the Bearer token from the Authorization header.
 * Returns the authenticated User or null.
 */
export async function getAuthUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}
