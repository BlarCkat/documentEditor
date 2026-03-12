'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/components/theme';
import { cn } from '@/lib/utils';
import {
  User, Palette, CreditCard, Bell, Shield,
  Check, Loader2, Sun, Moon, MessageSquare, Grid3x3,
  ChevronRight,
} from 'lucide-react';
import type { InterfaceStyle, UserRole } from '@/types';

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
        'relative w-9 h-5 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-foreground' : 'bg-accent border border-border'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform shadow-sm',
        checked ? 'translate-x-4' : 'translate-x-0.5'
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, userProfile, updateUserPreferences } = useAuth();
  const { theme, setTheme } = useTheme();

  const [displayName,     setDisplayName]     = useState('');
  const [role,            setRole]            = useState<UserRole>('creator');
  const [interfaceStyle,  setInterfaceStyle]  = useState<InterfaceStyle>('canvas');
  const [notifyWeekly,    setNotifyWeekly]    = useState(true);
  const [notifyTips,      setNotifyTips]      = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);

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

  const tierBadge = userProfile?.subscription.tier === 'pro' ? 'Pro' : 'Free';

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
              tierBadge === 'Pro'
                ? 'bg-foreground text-background'
                : 'bg-accent text-muted-foreground border border-border'
            )}>
              {tierBadge}
            </span>
          </Row>
          <Row label="Items created" description="Resets monthly">
            <span className="text-xs text-muted-foreground tabular-nums">
              {userProfile?.usage.pagesCreated ?? 0}
            </span>
          </Row>
          {tierBadge === 'Free' && (
            <div className="px-5 py-3 bg-accent/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Upgrade to Pro</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Unlimited content, AI generation, and more.</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:opacity-90 transition-all">
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

        {/* footer spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}
