'use client';

import React from 'react';
import { CanvasInterface } from '@/components/canvas';
import dynamic from 'next/dynamic';

// Dynamic import of notes page to avoid hydration issues
const NotesPageContent = dynamic(() => import('./notes/page'), { ssr: false });

export default function DashboardPage() {
  return (
    <>
      {/* Desktop: canvas view */}
      <div className="hidden md:block h-full w-full">
        <CanvasInterface />
      </div>

      {/* Mobile: notes view */}
      <div className="md:hidden h-full w-full">
        <NotesPageContent />
      </div>
    </>
  );
}
