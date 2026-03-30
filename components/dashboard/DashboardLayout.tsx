'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { loadCanvasState, saveCanvasState } from '@/lib/canvas-store';
import type { NoteNodeType } from '@/components/canvas/CanvasNode';
import type { PostType } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userProfile, updateUserPreferences } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync with user preference
  useEffect(() => {
    if (userProfile) {
      setSidebarCollapsed(userProfile.sidebarCollapsed);
    }
  }, [userProfile]);

  const handleToggleSidebar = async () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);

    // Save preference to database
    try {
      await updateUserPreferences({ sidebarCollapsed: newState });
    } catch (error) {
      console.error('Failed to save sidebar preference:', error);
    }
  };

  const handleNewNote = () => {
    if (!user) return;
    const id = `note-${Date.now()}`;
    const newNode: NoteNodeType = {
      id,
      type: 'note',
      position: { x: 120, y: 120 },
      data: {
        title: '',
        content: '',
        postType: 'note' as PostType,
        createdAt: new Date().toISOString(),
      },
    };
    const { nodes, edges } = loadCanvasState(user.id);
    saveCanvasState(user.id, [...nodes, newNode], edges);
    router.push(`/dashboard/notes/${id}`);
  };

  return (
    <>
      {/* Desktop: sidebar + content */}
      <div className="hidden md:flex h-screen bg-background">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile: full-height content + bottom bar */}
      <div className="flex md:hidden flex-col h-screen bg-background">
        <main className="flex-1 overflow-hidden pb-16">
          {children}
        </main>
        <BottomBar onNewClick={handleNewNote} />
      </div>
    </>
  );
}
