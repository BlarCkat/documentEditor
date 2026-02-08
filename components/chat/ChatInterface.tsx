'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatMessage } from '@/types';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: 'default',
      content,
      role: 'user',
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response (UI only for now)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: 'default',
        content: getPlaceholderResponse(content),
        role: 'assistant',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="text-center max-w-lg">
              <h1 className="text-3xl font-semibold text-white mb-4">
                What would you like to create?
              </h1>
              <p className="text-gray-400 mb-8">
                Start a conversation to brainstorm ideas, draft content, or get help with your creative projects.
              </p>
              <ChatSuggestions onSelect={handleSuggestionClick} />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4">
            <ChatMessages messages={messages} isTyping={isTyping} />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}

// Placeholder responses for UI demo
function getPlaceholderResponse(input: string): string {
  const responses = [
    "That's an interesting idea! Let me help you develop it further. What specific aspect would you like to focus on?",
    "Great question! Here are some thoughts that might help guide your creative process...",
    "I can definitely help with that. To give you the best suggestions, could you tell me a bit more about your target audience?",
    "Love the direction you're going! Here are a few variations you could consider for your content...",
    "That's a solid starting point. Let me suggest some ways to make it even more engaging...",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
