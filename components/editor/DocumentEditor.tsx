'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import { EditorToolbar } from './EditorToolbar';
import { AIMenu, type AIAction } from './AIMenu';
import { BubbleToolbar } from './BubbleToolbar';
import MentionList, { type MentionItem } from './MentionList';
import { useAuth } from '@/lib/auth-context';

interface DocumentEditorProps {
  content: string;
  onChange: (html: string) => void;
  mentionItems: MentionItem[];
  placeholder?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
}

export function DocumentEditor({
  content,
  onChange,
  mentionItems,
  placeholder = 'Start writing… Type @ to reference notes or documents.',
  autoFocus = true,
  showToolbar = true,
}: DocumentEditorProps) {
  const { session } = useAuth();
  const mentionItemsRef = useRef(mentionItems);
  useEffect(() => { mentionItemsRef.current = mentionItems; }, [mentionItems]);

  // ── AI menu state ────────────────────────────────────────────────────────
  const [aiOpen,     setAiOpen]     = useState(false);
  const [aiPos,      setAiPos]      = useState({ x: 0, y: 0 });
  const [aiLoading,  setAiLoading]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: true }),
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: {
          items: ({ query }) =>
            mentionItemsRef.current
              .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 10),

          render: () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let component: ReactRenderer<any>;
            let popup: HTMLDivElement | null = null;

            const removePopup = () => { popup?.remove(); popup = null; component?.destroy(); };

            const positionPopup = (clientRect: (() => DOMRect | null) | null | undefined) => {
              const rect = clientRect?.();
              if (rect && popup) {
                const dropdownH = 280;
                const top = rect.bottom + dropdownH > window.innerHeight
                  ? rect.top - dropdownH - 4
                  : rect.bottom + 4;
                popup.style.left = `${Math.max(8, rect.left)}px`;
                popup.style.top  = `${top}px`;
              }
            };

            return {
              onStart(props) {
                component = new ReactRenderer(MentionList, { props, editor: props.editor });
                popup = document.createElement('div');
                popup.style.cssText = `
                  position:fixed;z-index:9998;min-width:220px;max-height:280px;
                  overflow-y:auto;background:#161616;
                  border:1px solid rgba(255,255,255,0.08);border-radius:10px;
                  box-shadow:0 20px 50px rgba(0,0,0,0.7);padding:4px 0;
                `;
                document.body.appendChild(popup);
                popup.appendChild(component.element);
                positionPopup(props.clientRect);
              },
              onUpdate(props) {
                component?.updateProps(props);
                positionPopup(props.clientRect);
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') { removePopup(); return true; }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (component?.ref as any)?.onKeyDown(props) ?? false;
              },
              onExit: removePopup,
            };
          },
        },
      }),
    ],
    content,
    autofocus: autoFocus ? 'end' : false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { spellcheck: 'true' } },
  });

  // Sync content when a different item is opened
  const prevContent = useRef(content);
  useEffect(() => {
    if (editor && content !== prevContent.current) {
      prevContent.current = content;
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // ── AI menu helpers ──────────────────────────────────────────────────────
  const openAIAt = useCallback((x: number, y: number) => {
    setAiPos({ x, y });
    setAiOpen(true);
  }, []);

  /** Right-click → suppress native context menu, show AI menu */
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    openAIAt(e.clientX, e.clientY);
  }, [openAIAt]);

  /** Ctrl+Space → show AI menu at cursor */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        if (!editor) return;
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        openAIAt(coords.left, coords.bottom + 6);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor, openAIAt]);

  /** Call the AI API and insert the result */
  const handleAIAction = useCallback(async (action: AIAction, customPrompt?: string) => {
    if (!editor) return;
    setAiLoading(true);

    const { from, to, empty } = editor.state.selection;
    const selection = empty ? '' : editor.state.doc.textBetween(from, to, ' ');
    const fullContent = editor.getText();

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ action, content: fullContent, selection, customPrompt }),
      });
      const data = await res.json() as { text?: string; error?: string };

      if (data.error) { alert(`Enfin AI: ${data.error}`); return; }
      if (!data.text) return;

      // Insert at cursor (or replace selection)
      if (empty) {
        // Insert after current position with a line break
        editor.chain().focus()
          .insertContentAt(to, `\n${data.text}`)
          .run();
      } else {
        editor.chain().focus()
          .deleteSelection()
          .insertContentAt(from, data.text)
          .run();
      }
    } catch {
      alert('Enfin AI is unavailable. Check your API key configuration.');
    } finally {
      setAiLoading(false);
      setAiOpen(false);
    }
  }, [editor]);

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {showToolbar && <EditorToolbar editor={editor} />}

      <div
        className="doc-editor flex-1 overflow-y-auto px-1"
        onContextMenu={handleContextMenu}
      >
        <EditorContent editor={editor} />
        {editor && (
          <BubbleToolbar
            editor={editor}
            onAIAction={handleAIAction}
            aiLoading={aiLoading}
          />
        )}
      </div>

      <AIMenu
        open={aiOpen}
        position={aiPos}
        loading={aiLoading}
        onAction={handleAIAction}
        onClose={() => setAiOpen(false)}
      />
    </div>
  );
}
