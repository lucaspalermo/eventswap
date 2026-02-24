'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  CheckCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerChild } from '@/design-system/animations';
import { useAuth } from '@/hooks/use-auth';
import { chatService } from '@/services/chat.service';
import { isDemoMode } from '@/lib/demo-auth';
import type { Conversation } from '@/types/database.types';

interface ConversationPreview {
  id: number;
  participantName: string;
  participantInitials: string;
  participantAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  listingTitle: string;
}


function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('pt-BR');
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchConversations = async () => {
      try {
        if (isDemoMode()) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const data = await chatService.getConversations(user.id);

        if (data && data.length > 0) {
          const mapped: ConversationPreview[] = data.map((conv: Conversation & { participant_1_profile?: { name?: string; avatar_url?: string | null }; participant_2_profile?: { name?: string; avatar_url?: string | null } }) => {
            const isP1 = conv.participant_1 === user.id;
            const otherProfile = isP1
              ? conv.participant_2_profile
              : conv.participant_1_profile;
            const unreadCount = isP1
              ? (conv.unread_count_1 || 0)
              : (conv.unread_count_2 || 0);

            const otherName = otherProfile?.name || 'Usuario';

            return {
              id: conv.id,
              participantName: otherName,
              participantInitials: getInitials(otherName),
              participantAvatar: otherProfile?.avatar_url || null,
              lastMessage: conv.last_message_text || 'Conversa iniciada',
              lastMessageTime: formatRelativeTime(conv.last_message_at),
              unreadCount,
              isOnline: false,
              listingTitle: '',
            };
          });

          setConversations(mapped);
        } else {
          setConversations([]);
        }
      } catch {
        setError('Erro ao carregar conversas. Verifique sua conexao e tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, authLoading]);

  const displayConversations = conversations ?? [];

  const filtered = displayConversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      c.listingTitle.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = displayConversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Mensagens
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Carregando...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Mensagens
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {!error && totalUnread > 0
              ? `${totalUnread} mensagen${totalUnread > 1 ? 's' : ''} nao lida${totalUnread > 1 ? 's' : ''}`
              : !error
              ? 'Todas as mensagens lidas'
              : ''}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Erro ao carregar conversas
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!error && (
        <>
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Buscar conversas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconLeft={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Conversations List */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhuma conversa encontrada"
              description={
                search
                  ? 'Tente buscar por outro nome ou anuncio.'
                  : 'Suas conversas aparecerao aqui quando voce interagir com outros usuarios.'
              }
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="divide-y divide-neutral-100 dark:divide-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              {filtered.map((conversation) => (
                <motion.div key={conversation.id} variants={staggerChild}>
                  <Link
                    href={`/chat/${conversation.id}`}
                    className={cn(
                      'flex items-start gap-4 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                      selectedId === conversation.id && 'bg-violet-50/50 dark:bg-violet-900/10',
                      conversation.unreadCount > 0 && 'bg-violet-50/30 dark:bg-violet-950/20'
                    )}
                    onClick={() => setSelectedId(conversation.id)}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.participantAvatar || ''} />
                        <AvatarFallback className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 text-sm font-medium">
                          {conversation.participantInitials}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900 bg-emerald-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={cn(
                            'text-sm truncate',
                            conversation.unreadCount > 0
                              ? 'font-semibold text-neutral-950 dark:text-white'
                              : 'font-medium text-neutral-700 dark:text-neutral-300'
                          )}
                        >
                          {conversation.participantName}
                        </h3>
                        <span className="text-xs text-neutral-400 shrink-0">
                          {conversation.lastMessageTime}
                        </span>
                      </div>

                      {conversation.listingTitle && (
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">
                          {conversation.listingTitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={cn(
                            'text-sm truncate',
                            conversation.unreadCount > 0
                              ? 'text-neutral-700 dark:text-neutral-300'
                              : 'text-neutral-500'
                          )}
                        >
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {conversation.unreadCount === 0 && (
                            <CheckCheck className="h-4 w-4 text-[#2563EB]" />
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold bg-[#2563EB] text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
