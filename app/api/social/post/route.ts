import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { postToMultiplePlatforms, type PostContent } from '@/lib/social-providers';

interface PostRequest {
  noteId: string;
  platforms: Array<'twitter' | 'instagram' | 'linkedin'>;
  immediate?: boolean;
  scheduledFor?: string; // ISO timestamp
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostRequest;
    const { noteId, platforms, immediate = true, scheduledFor } = body;

    if (!noteId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'noteId and platforms are required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Fetch note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', session.user.id)
      .single();

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Fetch user with social accounts
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('social_accounts')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const socialAccounts = user.social_accounts || {};

    // Check all requested platforms are connected
    const disconnected = platforms.filter((p) => !socialAccounts[p]);
    if (disconnected.length > 0) {
      return NextResponse.json(
        { error: `Not connected to: ${disconnected.join(', ')}` },
        { status: 400 }
      );
    }

    // If scheduled, just store the note and return
    if (!immediate && scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate < new Date()) {
        return NextResponse.json(
          { error: 'Scheduled date must be in the future' },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('notes')
        .update({
          status: 'scheduled',
          scheduled_for: scheduledDate.toISOString(),
        })
        .eq('id', noteId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to schedule post' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Post scheduled for ${scheduledDate.toISOString()}`,
      });
    }

    // Post immediately
    const postContent: PostContent = {
      title: note.title || 'Untitled',
      content: note.content || '',
      imageUrl: note.image_url || undefined,
      platform: platforms[0], // Will be overridden in postToMultiplePlatforms
    };

    // Post to all selected platforms
    const results = await postToMultiplePlatforms(postContent, socialAccounts, platforms);

    const allSucceeded = Object.values(results).every((r) => r.success);

    if (allSucceeded) {
      // Store published post records
      for (const platform of platforms) {
        if (results[platform].success && results[platform].platformPostId) {
          const { error: publishError } = await supabase
            .from('published_posts')
            .insert({
              id: `${noteId}-${platform}-${Date.now()}`,
              note_id: noteId,
              user_id: session.user.id,
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

      // Update note status
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (updateError) {
        console.error('Failed to update note status:', updateError);
      }

      return NextResponse.json({
        success: true,
        results,
        message: 'Posted to all platforms',
      });
    } else {
      // Some platforms failed
      return NextResponse.json(
        {
          success: false,
          results,
          message: 'Some platforms failed',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Social posting error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process posting request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
