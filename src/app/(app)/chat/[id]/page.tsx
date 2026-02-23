'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Shield,
  Check,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { chatService } from '@/services/chat.service';
import type { Conversation, Message } from '@/types/database.types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatDetailPage() {
  const params = useParams();
  const conversationId = Number(params.id);
  const { user, profile, loading: authLoading } = useAuth();

  const [otherUser, setOtherUser] = useState({
    name: '',
    initials: '',
    avatarUrl: null as string | null,
    isOnline: false,
  });
  const [conversationLoading, setConversationLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time chat hook
  const {
    messages,
    loading: messagesLoading,
    sending,
    typingUsers,
    sendMessage,
    setTyping,
  } = useChat({
    conversationId,
    userId: user?.id || '',
    enabled: !!user && !!conversationId,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch conversation details (other user info)
  useEffect(() => {
    if (authLoading || !user || !conversationId) return;

    const fetchConversation = async () => {
      try {
        const conversations = await chatService.getConversations(user.id);
        const conv = conversations?.find((c: Conversation) => c.id === conversationId);

        if (conv) {
          const isP1 = conv.participant_1 === user.id;
          const otherProfile = isP1
            ? conv.participant_2_profile
            : conv.participant_1_profile;

          if (otherProfile) {
            setOtherUser({
              name: otherProfile.name || 'Usuario',
              initials: getInitials(otherProfile.name || 'U'),
              avatarUrl: otherProfile.avatar_url || null,
              isOnline: false,
            });
          }
        }
      } catch {
        // silently fail
      } finally {
        setConversationLoading(false);
      }
    };

    fetchConversation();
  }, [user, authLoading, conversationId]);

  // Handle typing indicator
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewMessage(e.target.value);

      // Send typing indicator
      if (profile?.name) {
        setTyping(true, profile.name);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false, profile.name);
        }, 2000);
      }
    },
    [profile, setTyping]
  );

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    if (profile?.name) {
      setTyping(false, profile.name);
    }

    try {
      await sendMessage(messageContent);
    } catch {
      // Error handled inside useChat (optimistic update rolled back)
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loading = authLoading || conversationLoading || messagesLoading;

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#6C3CE1]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link
          href="/chat"
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        </Link>

        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatarUrl || ''} />
            <AvatarFallback className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 text-sm font-medium">
              {otherUser.initials}
            </AvatarFallback>
          </Avatar>
          {otherUser.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-900 bg-emerald-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white truncate">
            {otherUser.name}
          </h2>
          <p className="text-xs text-neutral-400">
            {typingUsers.length > 0
              ? `${typingUsers.join(', ')} digitando...`
              : otherUser.isOnline
                ? 'Online'
                : 'Offline'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="h-3 w-3 text-[#6C3CE1]" />
            Protegido
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 -mx-1 px-1">
        {messages.length === 0 && (
          <div className="flex justify-center py-8">
            <span className="text-sm text-neutral-400">
              Nenhuma mensagem ainda. Inicie a conversa!
            </span>
          </div>
        )}

        {messages.map((message: Message) => {
          if (message.type === 'SYSTEM') {
            return (
              <div
                key={message.id}
                className="flex justify-center py-2"
              >
                <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                  {message.content}
                </span>
              </div>
            );
          }

          const isMe = message.sender_id === user?.id;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5',
                  isMe
                    ? 'bg-[#6C3CE1] text-white rounded-br-md'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-md'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div
                  className={cn(
                    'flex items-center justify-end gap-1 mt-1',
                    isMe ? 'text-white/60' : 'text-neutral-400'
                  )}
                >
                  <span className="text-[10px]">
                    {formatTime(message.created_at)}
                  </span>
                  {isMe && (
                    message.is_read ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator bubble */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-2.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="flex items-center justify-center h-10 w-10 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100',
                'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
                'max-h-32 transition-all'
              )}
              style={{ minHeight: '40px' }}
            />
          </div>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-10 w-10 rounded-xl shrink-0 p-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-neutral-400 mt-2 text-center">
          Todas as mensagens sao monitoradas para sua seguranca
        </p>
      </div>
    </div>
  );
}
