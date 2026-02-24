'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare } from 'lucide-react';
import { cn, truncateText, getInitials } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface ConversationPreview {
  id: number;
  participantName: string;
  participantAvatar?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface ConversationListProps {
  conversations: ConversationPreview[];
  activeId?: number;
  onSelect: (id: number) => void;
}

function formatConversationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (diffDays === 1) {
    return 'Ontem';
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  }
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Mensagens
        </h2>

        {/* Search / Filter */}
        <Input
          placeholder="Buscar conversa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconLeft={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeId;
              const hasUnread = conv.unreadCount > 0;

              return (
                <motion.button
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150',
                    'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                    isActive &&
                      'bg-[#2563EB]/5 border-l-2 border-l-[#2563EB] hover:bg-[#2563EB]/10 dark:bg-[#2563EB]/10 dark:hover:bg-[#2563EB]/15'
                  )}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      {conv.participantAvatar && (
                        <AvatarImage
                          src={conv.participantAvatar}
                          alt={conv.participantName}
                        />
                      )}
                      <AvatarFallback>
                        {getInitials(conv.participantName)}
                      </AvatarFallback>
                    </Avatar>

                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'truncate text-sm',
                          hasUnread
                            ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                            : 'font-medium text-zinc-700 dark:text-zinc-300'
                        )}
                      >
                        {conv.participantName}
                      </span>
                      <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
                        {formatConversationTime(conv.lastMessageTime)}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'truncate text-xs',
                          hasUnread
                            ? 'font-medium text-zinc-600 dark:text-zinc-400'
                            : 'text-zinc-400 dark:text-zinc-500'
                        )}
                      >
                        {truncateText(conv.lastMessage, 50)}
                      </p>

                      {hasUnread && (
                        <Badge className="h-5 min-w-[20px] shrink-0 justify-center rounded-full px-1.5 text-[10px] font-bold">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <MessageSquare className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? 'Nenhuma conversa encontrada'
                  : 'Sem conversas ainda'}
              </p>
              <p className="mt-1 px-4 text-xs text-zinc-400 dark:text-zinc-500">
                {searchQuery
                  ? `Nenhum resultado para "${searchQuery}".`
                  : 'Suas conversas aparecerão aqui.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
