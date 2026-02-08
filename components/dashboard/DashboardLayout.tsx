'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { userProfile, updateUserPreferences } = useAuth();
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

  return (
    <div className="flex h-screen bg-black">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
