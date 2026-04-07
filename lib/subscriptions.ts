import { SubscriptionTier } from '@/types';

// -1 means unlimited
export const PLAN_LIMITS: Record<string, { notesPerMonth: number; documentsPerMonth: number; aiUsesPerMonth: number }> = {
  free:       { notesPerMonth: 15, documentsPerMonth: 1,  aiUsesPerMonth: 3  },
  basic:      { notesPerMonth: -1, documentsPerMonth: -1, aiUsesPerMonth: -1 },
  pro:        { notesPerMonth: -1, documentsPerMonth: -1, aiUsesPerMonth: -1 },
  enterprise: { notesPerMonth: -1, documentsPerMonth: -1, aiUsesPerMonth: -1 },
};

export function getPlanLimits(tier: string) {
  return PLAN_LIMITS[tier] ?? PLAN_LIMITS.free;
}

export function canCreateNote(notesThisMonth: number, tier: SubscriptionTier): boolean {
  const { notesPerMonth } = getPlanLimits(tier);
  return notesPerMonth === -1 || notesThisMonth < notesPerMonth;
}

export function canCreateDocument(docsThisMonth: number, tier: SubscriptionTier): boolean {
  const { documentsPerMonth } = getPlanLimits(tier);
  return documentsPerMonth === -1 || docsThisMonth < documentsPerMonth;
}

export function canUseAI(aiUsesThisMonth: number, tier: SubscriptionTier): boolean {
  const { aiUsesPerMonth } = getPlanLimits(tier);
  return aiUsesPerMonth === -1 || aiUsesThisMonth < aiUsesPerMonth;
}

/** Returns true if the calendar month of lastResetDate differs from today's. */
export function shouldResetMonthlyUsage(lastResetDate: Date): boolean {
  const now = new Date();
  return (
    lastResetDate.getFullYear() !== now.getFullYear() ||
    lastResetDate.getMonth() !== now.getMonth()
  );
}
