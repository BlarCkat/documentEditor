'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTheme, ThemeToggle } from '@/components/theme';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Home,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layout,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, userProfile, signOut } = useAuth();
  const { theme } = useTheme();

  // Keyboard shortcut to toggle sidebar
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
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/documents', icon: FileText, label: 'Documents' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      className={cn(
        'h-screen flex flex-col border-r transition-all duration-300',
        'bg-[#0a0a0a] border-white/10',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-white font-medium">Enfinotes</span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400',
            isCollapsed && 'absolute left-4 top-4'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* User section */}
      <div className={cn(
        'p-4 border-b border-white/10',
        isCollapsed && 'flex justify-center'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-indigo-400">
                {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile?.subscription.tier === 'free' ? 'Free plan' : 'Pro plan'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New button */}
      <div className="p-3">
        <button
          className={cn(
            'w-full flex items-center gap-2 p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-white',
            isCollapsed && 'justify-center'
          )}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm">New</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}

        {/* Chats section */}
        {!isCollapsed && (
          <div className="pt-4">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <MessageSquare className="w-3 h-3" />
              Chats
            </div>
            <div className="space-y-1 mt-1">
              <div className="px-3 py-2 text-sm text-gray-500">
                No chats yet
              </div>
            </div>
          </div>
        )}

        {/* Notes section */}
        {!isCollapsed && (
          <div className="pt-4">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Layout className="w-3 h-3" />
              Notes
            </div>
            <div className="space-y-1 mt-1">
              <div className="px-3 py-2 text-sm text-gray-500">
                No notes yet
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <div className={cn(
          'flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between px-3'
        )}>
          {!isCollapsed && (
            <span className="text-xs text-gray-500">Theme</span>
          )}
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
