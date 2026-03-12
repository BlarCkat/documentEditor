'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from '@/components/theme';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Home,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, userProfile, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const navItems = [
    { href: '/dashboard',            icon: Home,     label: 'Home'      },
    { href: '/dashboard/analytics',  icon: BarChart2, label: 'Analytics' },
    { href: '/dashboard/notes',      icon: FileText,  label: 'Notes'     },
    { href: '/dashboard/settings',   icon: Settings,  label: 'Settings'  },
  ];

  return (
    <aside
      className={cn(
        'h-screen flex flex-col border-r transition-all duration-300',
        'bg-card border-border',
        isCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-foreground text-sm font-semibold truncate">Enfinotes</span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            'p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground flex-shrink-0',
            isCollapsed && 'absolute left-3 top-2.5'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* User section */}
      <div className={cn(
        'px-3 py-2 border-b border-border',
        isCollapsed && 'flex justify-center'
      )}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <span className="text-xs font-medium text-indigo-400">
                {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {userProfile?.subscription.tier === 'free' ? 'Free plan' : 'Pro plan'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New button */}
      <div className="px-2 py-2">
        <button
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent hover:bg-accent/70 transition-colors text-foreground text-xs',
            isCollapsed && 'justify-center'
          )}
        >
          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          {!isCollapsed && <span>New</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors text-xs',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-border space-y-0.5">
        <div className={cn(
          'flex items-center px-2 py-1',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <span className="text-[11px] text-muted-foreground">Theme</span>
          )}
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
