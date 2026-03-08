'use client';

import React from 'react';
import { ChatMessage } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Bot, Loader2 } from 'lucide-react';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex gap-4',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
          )}

          <div
            className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3',
              message.role === 'user'
                ? 'bg-indigo-500/20 text-white'
                : 'bg-white/5 text-gray-200'
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {formatTime(message.createdAt)}
            </p>
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-xs font-medium text-white">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-4 justify-start">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="bg-white/5 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}
