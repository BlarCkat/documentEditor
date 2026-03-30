'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart2,
  FileText,
  Settings,
  Plus,
} from 'lucide-react';

interface BottomBarProps {
  onNewClick: () => void;
}

export function BottomBar({ onNewClick }: BottomBarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard',            icon: Home,     label: 'Home'      },
    { href: '/dashboard/analytics',  icon: BarChart2, label: 'Analytics' },
    { href: '/dashboard/notes',      icon: FileText,  label: 'Notes'     },
    { href: '/dashboard/settings',   icon: Settings,  label: 'Settings'  },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card flex items-center px-2">
      {/* First two nav items: Home, Analytics */}
      {navItems.slice(0, 2).map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 px-3 rounded-md transition-colors text-xs flex-1',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={item.label}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}

      {/* New button in middle */}
      <button
        onClick={onNewClick}
        className="flex flex-col items-center gap-1 py-2.5 px-3 rounded-md bg-foreground text-background hover:opacity-90 transition-all text-xs flex-1"
        title="New note"
      >
        <Plus className="w-4 h-4" />
        <span className="text-[10px]">New</span>
      </button>

      {/* Last two nav items: Notes, Settings */}
      {navItems.slice(2, 4).map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 px-3 rounded-md transition-colors text-xs flex-1',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={item.label}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
