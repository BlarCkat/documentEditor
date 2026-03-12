'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FileText, BookOpen } from 'lucide-react';
import { FaXTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import type { PostType } from '@/types';

export interface MentionItem {
  id: string;
  label: string;
  type: PostType;
}

const TYPE_ICONS: Record<PostType, React.ComponentType<{ className?: string }>> = {
  note:      ({ className }) => <FileText  className={className} />,
  document:  ({ className }) => <BookOpen  className={className} />,
  twitter:   ({ className }) => <FaXTwitter  className={className} />,
  instagram: ({ className }) => <FaInstagram className={className} />,
  linkedin:  ({ className }) => <FaLinkedin  className={className} />,
};

const TYPE_COLORS: Record<PostType, string> = {
  note:      'text-[#888888]',
  document:  'text-blue-400',
  twitter:   'text-sky-400',
  instagram: 'text-pink-400',
  linkedin:  'text-blue-400',
};

interface Props {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

const MentionList = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  Props
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        if (items[selectedIndex]) command(items[selectedIndex]);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return (
      <div className="px-3 py-2">
        <p className="text-xs text-[#555]">No results</p>
      </div>
    );
  }

  return (
    <div>
      <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-[#555] uppercase tracking-wider">
        Mention
      </p>
      {items.map((item, index) => {
        const Icon = TYPE_ICONS[item.type];
        return (
          <button
            key={item.id}
            onClick={() => command(item)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
              index === selectedIndex ? 'bg-[#2a2a2a]' : 'hover:bg-[#222222]'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', TYPE_COLORS[item.type])} />
            <span className="text-xs text-[#f0f0f0] truncate flex-1">{item.label}</span>
            <span className="text-[10px] text-[#555] capitalize flex-shrink-0">{item.type}</span>
          </button>
        );
      })}
    </div>
  );
});

MentionList.displayName = 'MentionList';
export default MentionList;
