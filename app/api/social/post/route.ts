import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { postToMultiplePlatforms, type PostContent } from '@/lib/social-providers';
import { getAuthUser, unauthorizedResponse } from '@/lib/server-auth';

const VALID_PLATFORMS = new Set(['twitter', 'instagram', 'linkedin']);

type Platform = 'twitter' | 'instagram' | 'linkedin';

interface PostRequest {
  noteId: string;
  platforms: Platform[];
  immediate?: boolean;
  scheduledFor?: string;
}

export async function POST(request: NextRequest) {
  // Require authenticated user via Authorization header
  const authUser = await getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  // Use service role client for server-side DB operations
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    const body = (await request.json()) as PostRequest;
    const { noteId, platforms, immediate = true, scheduledFor } = body;

    if (!noteId || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'noteId and platforms are required' }, { status: 400 });
    }

    // Validate platform values against whitelist
    const invalidPlatforms = platforms.filter((p) => !VALID_PLATFORMS.has(p));
    if (invalidPlatforms.length > 0) {
      return NextResponse.json({ error: `Invalid platforms: ${invalidPlatforms.join(', ')}` }, { status: 400 });
    }

    // Fetch note — scoped to this user
    const { data: note, error: noteError } = await db
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', authUser.id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Fetch user with social accounts
    const { data: userProfile, error: userError } = await db
      .from('users')
      .select('social_accounts')
      .eq('id', authUser.id)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const socialAccounts = userProfile.social_accounts || {};

    // Check all requested platforms are connected
    const disconnected = platforms.filter((p) => !socialAccounts[p]);
    if (disconnected.length > 0) {
      return NextResponse.json({ error: `Not connected to: ${disconnected.join(', ')}` }, { status: 400 });
    }

    // If scheduled, just store the note and return
    if (!immediate && scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
        return NextResponse.json({ error: 'Scheduled date must be a valid date in the future' }, { status: 400 });
      }

      const { error: updateError } = await db
        .from('notes')
        .update({ status: 'scheduled', scheduled_for: scheduledDate.toISOString() })
        .eq('id', noteId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Post scheduled for ${scheduledDate.toISOString()}` });
    }

    // Post immediately
    const postContent: PostContent = {
      title: note.title || 'Untitled',
      content: note.content || '',
      imageUrl: note.image_url || undefined,
      platform: platforms[0],
    };

    const results = await postToMultiplePlatforms(postContent, socialAccounts, platforms);
    const allSucceeded = Object.values(results).every((r) => r.success);

    if (allSucceeded) {
      for (const platform of platforms) {
        if (results[platform].success && results[platform].platformPostId) {
          const { error: publishError } = await db
            .from('published_posts')
            .insert({
              id: `${noteId}-${platform}-${Date.now()}`,
              note_id: noteId,
              user_id: authUser.id,
              platform,
              platform_post_id: results[platform].platformPostId!,
              platform_url: results[platform].platformUrl!,
              posted_at: new Date().toISOString(),
            });

          if (publishError) {
            console.error(`Failed to record published_post for ${platform}:`, publishError);
          }
        }
      }

      const { error: updateError } = await db
        .from('notes')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (updateError) {
        console.error('Failed to update note status:', updateError);
      }

      return NextResponse.json({ success: true, results, message: 'Posted to all platforms' });
    }

    return NextResponse.json({ success: false, results, message: 'Some platforms failed' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process posting request' }, { status: 500 });
  }
}
