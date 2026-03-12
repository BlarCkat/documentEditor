'use client';

import React, { useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  RotateCcw, RotateCw, ImagePlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function Btn({
  onClick, active, disabled, icon: Icon, title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors text-xs',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />;
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-border bg-card sticky top-0 z-10">
      {/* Undo / Redo */}
      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={RotateCcw} title="Undo (⌘Z)" />
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={RotateCw}  title="Redo (⌘⇧Z)" />

      <Divider />

      {/* Headings */}
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" />

      <Divider />

      {/* Inline formatting */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()}          active={editor.isActive('bold')}          icon={Bold}          title="Bold (⌘B)"      />
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()}        active={editor.isActive('italic')}        icon={Italic}        title="Italic (⌘I)"    />
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()}        active={editor.isActive('strike')}        icon={Strikethrough} title="Strikethrough"  />
      <Btn onClick={() => editor.chain().focus().toggleCode().run()}          active={editor.isActive('code')}          icon={Code}          title="Inline code"    />

      <Divider />

      {/* Block types */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}    active={editor.isActive('bulletList')}   icon={List}          title="Bullet list"    />
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}   active={editor.isActive('orderedList')}  icon={ListOrdered}   title="Ordered list"   />
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}    active={editor.isActive('blockquote')}   icon={Quote}         title="Blockquote"     />
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()}   icon={Minus}         title="Horizontal rule" />

      <Divider />

      {/* Image upload */}
      <button
        onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
        title="Insert image"
        className="p-1.5 rounded-md transition-colors text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <ImagePlus className="w-3.5 h-3.5" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
