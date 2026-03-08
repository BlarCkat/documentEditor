'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChatInterface } from '@/components/chat';
import { CanvasInterface } from '@/components/canvas';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Render interface based on user preference
  if (userProfile.interfaceStyle === 'canvas') {
    return <CanvasInterface />;
  }

  return <ChatInterface />;
}
