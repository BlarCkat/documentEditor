'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/components/theme';
import { cn } from '@/lib/utils';
import { usePaystackPayment } from 'react-paystack';
import {
  User, Shield,
  Check, Loader2, Sun, Moon, MessageSquare, Grid3x3,
  ChevronRight, X, Zap, Star, LogOut,
} from 'lucide-react';
import type { InterfaceStyle, UserRole, SubscriptionTier } from '@/types';
import { supabase } from '@/lib/supabase';

// ── Small helpers ─────────────────────────────────────────────────────────────
function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-foreground' : 'bg-accent border border-border'
      )}
    >
      <span className={cn(
        'absolute top-1 w-4 h-4 rounded-full bg-background transition-transform shadow-sm',
        checked ? 'translate-x-5' : 'translate-x-1'
      )} />
    </button>
  );
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'creator',   label: 'Creator'   },
  { value: 'writer',    label: 'Writer'    },
  { value: 'marketer',  label: 'Marketer'  },
  { value: 'developer', label: 'Developer' },
  { value: 'student',   label: 'Student'   },
  { value: 'other',     label: 'Other'     },
];

// ── Upgrade modal ─────────────────────────────────────────────────────────────
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  onUpgradeSuccess: (tier: SubscriptionTier) => void;
}

const PLANS = [
  {
    id: 'basic' as SubscriptionTier,
    name: 'Basic',
    price: '$5',
    period: '/month',
    amountCents: 500,
    planCode: process.env.NEXT_PUBLIC_PAYSTACK_BASIC_PLAN_CODE || '',
    icon: Zap,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    features: ['Unlimited pages', 'AI writing assistant', 'Analytics dashboard', 'Email support'],
  },
  {
    id: 'pro' as SubscriptionTier,
    name: 'Pro',
    price: '$144',
    period: '/year',
    amountCents: 14400,
    planCode: process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE || '',
    icon: Star,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    badge: 'Best value',
    features: ['Everything in Basic', 'Priority AI (500K tokens)', 'Advanced analytics', 'Custom templates', 'Priority support'],
  },
];

// Inner component that calls Paystack hooks (must be at component level)
function UpgradeModalInner({ isOpen, onClose, userEmail, userId, onUpgradeSuccess }: UpgradeModalProps) {
  const [selected, setSelected] = useState<SubscriptionTier>('basic');
  const [paying, setPaying] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  // Use state (not ref) so updating the reference triggers a re-render and
  // the Paystack hooks pick up the new value before initializePayment is called.
  const [reference, setReference] = useState(() => `enf_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (isOpen) {
      setReference(`enf_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      setUpgradeError('');
      setPaying(false);
    }
  }, [isOpen]);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

  const basicConfig = {
    reference,
    email: userEmail,
    amount: 500,           // in smallest currency unit (cents for USD / kobo for NGN)
    plan: process.env.NEXT_PUBLIC_PAYSTACK_BASIC_PLAN_CODE || '',
    publicKey,
    metadata: {
      userId,
      subscriptionTier: 'basic',
      custom_fields: [] as { display_name: string; variable_name: string; value: string }[],
    },
  };

  const proConfig = {
    ...basicConfig,
    amount: 14400,
    plan: process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE || '',
    metadata: {
      userId,
      subscriptionTier: 'pro',
      custom_fields: [] as { display_name: string; variable_name: string; value: string }[],
    },
  };

  const initializeBasic = usePaystackPayment(basicConfig);
  const initializePro   = usePaystackPayment(proConfig);

  const handlePay = () => {
    if (!publicKey) {
      setUpgradeError('Payment is not configured. Please contact support.');
      return;
    }
    setPaying(true);
    setUpgradeError('');

    const onSuccess = async () => {
      // Optimistically update the user's tier in Supabase.
      // The Paystack webhook will also do this, but this gives instant UI feedback.
      await supabase
        .from('users')
        .update({ subscription_tier: selected, subscription_status: 'active' })
        .eq('id', userId);
      onUpgradeSuccess(selected);
      onClose();
      setPaying(false);
    };

    const onPayClose = () => setPaying(false);

    if (selected === 'basic') {
      initializeBasic({ onSuccess, onClose: onPayClose });
    } else {
      initializePro({ onSuccess, onClose: onPayClose });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Upgrade your plan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Choose a plan to unlock more features</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6 space-y-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={cn(
                  'w-full text-left rounded-xl border p-4 transition-all',
                  isSelected
                    ? 'border-foreground bg-accent/40'
                    : 'border-border bg-background hover:border-border/80 hover:bg-accent/20'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', plan.bg, plan.border, 'border')}>
                      <Icon className={cn('w-4.5 h-4.5', plan.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                        {plan.badge && (
                          <span className="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 text-[10px] font-semibold rounded-full">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <ul className="mt-1.5 space-y-0.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-bold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                    <div className={cn(
                      'mt-1.5 w-4 h-4 rounded-full border-2 ml-auto transition-colors',
                      isSelected ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-background m-auto mt-0.5" />}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {upgradeError && (
          <p className="px-6 pb-2 text-xs text-red-400">{upgradeError}</p>
        )}

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {paying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <>Continue to payment <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Secured by Paystack · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, userProfile, updateUserPreferences, refreshUserProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const [displayName,     setDisplayName]     = useState('');
  const [role,            setRole]            = useState<UserRole>('creator');
  const [interfaceStyle,  setInterfaceStyle]  = useState<InterfaceStyle>('canvas');
  const [notifyWeekly,    setNotifyWeekly]    = useState(true);
  const [notifyTips,      setNotifyTips]      = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);
  const [upgradeOpen,     setUpgradeOpen]     = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setRole(userProfile.userRole || 'creator');
      setInterfaceStyle(userProfile.interfaceStyle || 'canvas');
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserPreferences({ displayName, userRole: role, interfaceStyle });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    try { await updateUserPreferences({ themePreference: newTheme }); } catch {}
  };

  const handleInterfaceChange = async (style: InterfaceStyle) => {
    setInterfaceStyle(style);
    try { await updateUserPreferences({ interfaceStyle: style }); } catch {}
  };

  const handleUpgradeSuccess = async (_tier: SubscriptionTier) => {
    await refreshUserProfile();
  };


  const tier = userProfile?.subscription.tier ?? 'free';
  const tierLabel = tier === 'pro' ? 'Pro' : tier === 'basic' ? 'Basic' : 'Free';
  const isPaid = tier === 'basic' || tier === 'pro';

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences.</p>
        </div>

        {/* ── Profile ── */}
        <Section title="Profile" description="How you appear across Enfinotes">
          <Row label="Display name" description="Your public name in the app">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
              className="w-44 bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Enter your name"
            />
          </Row>
          <Row label="Email" description="Your sign-in email address">
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </Row>
          <Row label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-background border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Row>
          <div className="px-5 py-3 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              {saved ? 'Saved' : 'Save profile'}
            </button>
          </div>
        </Section>

        {/* ── Appearance ── */}
        <Section title="Appearance" description="Control how Enfinotes looks">
          <Row label="Theme" description="Choose your preferred color scheme">
            <div className="flex items-center gap-1.5 p-1 bg-accent rounded-lg">
              <button
                onClick={() => handleThemeChange('light')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sun className="w-3.5 h-3.5" />Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  theme === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Moon className="w-3.5 h-3.5" />Dark
              </button>
            </div>
          </Row>
          <Row label="Default interface" description="Choose your workspace layout">
            <div className="flex items-center gap-1.5 p-1 bg-accent rounded-lg">
              <button
                onClick={() => handleInterfaceChange('chat')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  interfaceStyle === 'chat' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />Chat
              </button>
              <button
                onClick={() => handleInterfaceChange('canvas')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  interfaceStyle === 'canvas' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Grid3x3 className="w-3.5 h-3.5" />Canvas
              </button>
            </div>
          </Row>
        </Section>

        {/* ── Subscription ── */}
        <Section title="Subscription" description="Your current plan and usage">
          <Row label="Current plan">
            <span className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-semibold',
              tier === 'pro'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                : tier === 'basic'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                : 'bg-accent text-muted-foreground border border-border'
            )}>
              {tierLabel}
            </span>
          </Row>
          <Row label="Items created" description="Resets monthly">
            <span className="text-xs text-muted-foreground tabular-nums">
              {userProfile?.usage.pagesCreated ?? 0}
            </span>
          </Row>
          {!isPaid && (
            <div className="px-5 py-4 bg-accent/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-foreground">Upgrade your plan</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Basic from $5/mo · Pro at $144/yr
                  </p>
                </div>
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg hover:opacity-90 transition-all flex-shrink-0"
                >
                  Upgrade <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications" description="Choose what you hear about">
          <Row label="Weekly digest" description="Summary of your content creation activity">
            <Toggle checked={notifyWeekly} onChange={setNotifyWeekly} />
          </Row>
          <Row label="Tips &amp; updates" description="Product news and writing tips">
            <Toggle checked={notifyTips} onChange={setNotifyTips} />
          </Row>
        </Section>

        {/* ── Security ── */}
        <Section title="Security">
          <Row label="Password" description="Change your sign-in password">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Change <ChevronRight className="w-3 h-3" />
            </button>
          </Row>
          <Row label="Two-factor authentication" description="Extra layer of security for your account">
            <span className="text-xs text-muted-foreground">Not enabled</span>
          </Row>
          <div className="px-5 py-3 flex justify-end border-t border-border">
            <button
              onClick={async () => {
                try {
                  await signOut();
                } catch (error) {
                  console.error('Failed to sign out:', error);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 text-xs font-medium hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Danger zone">
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground mb-3">
              Deleting your account is permanent and cannot be undone. All your data will be lost.
            </p>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/10 transition-colors"
              onClick={() => alert('Contact support to delete your account.')}
            >
              <Shield className="w-3.5 h-3.5" />
              Delete account
            </button>
          </div>
        </Section>

        <div className="h-4" />
      </div>

      {/* Upgrade modal */}
      {user && (
        <UpgradeModalInner
          isOpen={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          userEmail={user.email || ''}
          userId={user.id}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
}
