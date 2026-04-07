import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import type { AIAction } from '@/components/editor/AIMenu';
import { getAuthUser, unauthorizedResponse } from '@/lib/server-auth';
import { canUseAI, shouldResetMonthlyUsage } from '@/lib/subscriptions';
import type { SubscriptionTier } from '@/types';

const SYSTEM_PROMPT = `You are Enfin AI, a world-class writing assistant integrated into Enfinotes — a content creation workspace. Your job is to help writers create better notes, documents, and social media posts.

Rules:
- Return ONLY the requested text. No explanations, no preamble, no "Here is…"
- Preserve the writer's voice when improving or continuing
- For social posts (Twitter, LinkedIn, Instagram), respect platform conventions
- Be concise and high-quality
- Use Markdown formatting where appropriate`;

function buildPrompt(action: AIAction, content: string, selection: string, customPrompt?: string): string {
  const context = selection.trim() || content.trim();

  switch (action) {
    case 'continue':
      return `Continue writing the following text naturally. Write 2–4 sentences that flow directly from it:\n\n${content}`;
    case 'improve':
      return `Rewrite the following text to improve clarity, flow, and impact. Keep the same meaning and approximate length:\n\n${context}`;
    case 'shorten':
      return `Make the following text shorter and more concise while preserving the key meaning:\n\n${context}`;
    case 'lengthen':
      return `Expand the following text with more detail, examples, or context:\n\n${context}`;
    case 'summarize':
      return `Write a brief 2–3 sentence summary of the following:\n\n${context}`;
    case 'tone_professional':
      return `Rewrite the following in a professional, authoritative tone:\n\n${context}`;
    case 'tone_casual':
      return `Rewrite the following in a relaxed, conversational tone:\n\n${context}`;
    case 'tone_creative':
      return `Rewrite the following in a vivid, creative, engaging tone:\n\n${context}`;
    case 'custom':
      return `${customPrompt}\n\nContent:\n${context}`;
    default:
      return `Improve the following text:\n\n${context}`;
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorizedResponse();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to your .env.local file.' },
      { status: 503 }
    );
  }

  // Admin client for reading and writing usage to the DB
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch user's current plan + usage
  const { data: profile } = await db
    .from('users')
    .select('subscription_tier, ai_uses, last_reset_date')
    .eq('id', user.id)
    .single();

  const tier: SubscriptionTier = (profile?.subscription_tier as SubscriptionTier) || 'free';
  let aiUses: number = profile?.ai_uses || 0;
  const lastResetDate = profile?.last_reset_date ? new Date(profile.last_reset_date) : new Date();

  // Monthly reset — if we're in a new calendar month, zero out the counter
  if (shouldResetMonthlyUsage(lastResetDate)) {
    aiUses = 0;
    await db
      .from('users')
      .update({ ai_uses: 0, last_reset_date: new Date().toISOString() })
      .eq('id', user.id);
  }

  // Enforce free-tier limit
  if (!canUseAI(aiUses, tier)) {
    return Response.json(
      { error: 'AI_LIMIT_REACHED', message: 'You have used all 3 AI assists this month. Upgrade to Pro for unlimited access.' },
      { status: 403 }
    );
  }

  let body: { action: AIAction; content: string; selection: string; customPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { action, content = '', selection = '', customPrompt } = body;

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildPrompt(action, content, selection, customPrompt) },
      ],
    });

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // Increment usage counter after a successful call
    await db
      .from('users')
      .update({ ai_uses: aiUses + 1 })
      .eq('id', user.id);

    return Response.json({ text });
  } catch (err) {
    console.error('Enfin AI error:', err);
    return Response.json({ error: 'AI request failed. Please try again.' }, { status: 500 });
  }
}
