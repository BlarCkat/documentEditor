'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { loadCanvasState } from '@/lib/canvas-store';
import { FileText, BookOpen, TrendingUp, AlignLeft } from 'lucide-react';
import { FaXTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import type { NoteNodeData } from '@/components/canvas/CanvasNode';
import type { PostType } from '@/types';
import { formatDistanceToNow, format, subDays, isSameDay } from 'date-fns';
import type { Node } from '@xyflow/react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  total: number;
  byType: Record<PostType, number>;
  totalWords: number;
  recentItems: Node[];
  activityDays: Date[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

const TYPE_CONFIG: Record<PostType, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  note:      { label: 'Notes',     color: 'text-foreground',  bg: 'bg-foreground',  icon: FileText   },
  document:  { label: 'Documents', color: 'text-blue-400',    bg: 'bg-blue-400',    icon: BookOpen   },
  twitter:   { label: 'Twitter',   color: 'text-sky-400',     bg: 'bg-sky-400',     icon: ({ className }) => <FaXTwitter  className={className} /> },
  instagram: { label: 'Instagram', color: 'text-pink-400',    bg: 'bg-pink-400',    icon: ({ className }) => <FaInstagram className={className} /> },
  linkedin:  { label: 'LinkedIn',  color: 'text-blue-500',    bg: 'bg-blue-500',    icon: ({ className }) => <FaLinkedin  className={className} /> },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className={cn('mt-0.5 p-2 rounded-lg bg-accent flex-shrink-0', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    const { nodes } = loadCanvasState(user.id);
    const contentNodes = nodes.filter((n) => n.type === 'note');

    const byType: Record<PostType, number> = {
      note: 0, document: 0, twitter: 0, instagram: 0, linkedin: 0,
    };
    let totalWords = 0;
    const activityDays: Date[] = [];

    for (const node of contentNodes) {
      const d = node.data as NoteNodeData;
      const t: PostType = d.postType ?? 'note';
      byType[t] = (byType[t] ?? 0) + 1;
      totalWords += wordCount(stripHtml(d.content || ''));
      if (d.createdAt) {
        const day = new Date(d.createdAt);
        if (!activityDays.some((x) => isSameDay(x, day))) activityDays.push(day);
      }
    }

    const recentItems = [...contentNodes]
      .sort((a, b) =>
        new Date((b.data as NoteNodeData).createdAt ?? 0).getTime() -
        new Date((a.data as NoteNodeData).createdAt ?? 0).getTime()
      )
      .slice(0, 6);

    setStats({ total: contentNodes.length, byType, totalWords, recentItems, activityDays });
  }, [user]);

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const maxByType = Math.max(...Object.values(stats.byType), 1);

  // Last 30 days grid
  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i));

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">An overview of your content creation.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total items"   value={stats.total}       icon={FileText}    color="text-foreground"  />
          <StatCard label="Words written" value={stats.totalWords.toLocaleString()} icon={AlignLeft}   color="text-purple-400" sub="across all content" />
          <StatCard label="Documents"     value={stats.byType.document} icon={BookOpen} color="text-blue-400" />
          <StatCard label="Social posts"  value={stats.byType.twitter + stats.byType.instagram + stats.byType.linkedin} icon={TrendingUp} color="text-sky-400" />
        </div>

        {/* Content breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Content breakdown</h2>
          <div className="space-y-3">
            {(Object.entries(stats.byType) as [PostType, number][]).map(([type, count]) => {
              const cfg = TYPE_CONFIG[type];
              const pct = Math.round((count / maxByType) * 100);
              const Icon = cfg.icon;
              return (
                <div key={type} className="flex items-center gap-3">
                  <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', cfg.color)} />
                  <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{cfg.label}</span>
                  <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', cfg.bg)}
                      style={{ width: `${pct}%`, opacity: count === 0 ? 0.2 : 1 }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity heatmap (last 30 days) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Activity — last 30 days</h2>
          <div className="flex flex-wrap gap-1.5">
            {last30.map((day) => {
              const hasActivity = stats.activityDays.some((d) => isSameDay(d, day));
              return (
                <div
                  key={day.toISOString()}
                  title={format(day, 'MMM d, yyyy')}
                  className={cn(
                    'w-6 h-6 rounded-sm transition-colors',
                    hasActivity ? 'bg-foreground/80' : 'bg-accent'
                  )}
                />
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Active on {stats.activityDays.length} of the last 30 days
          </p>
        </div>

        {/* Recent items */}
        {stats.recentItems.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Recent items</h2>
            <div className="space-y-1">
              {stats.recentItems.map((node) => {
                const d = node.data as NoteNodeData;
                const t: PostType = d.postType ?? 'note';
                const cfg = TYPE_CONFIG[t];
                const Icon = cfg.icon;
                const preview = stripHtml(d.content || '');
                return (
                  <div key={node.id} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                    <Icon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', cfg.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{d.title || 'Untitled'}</p>
                      {preview && (
                        <p className="text-[11px] text-muted-foreground truncate">{preview}</p>
                      )}
                    </div>
                    {d.createdAt && (
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
