'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Phone, Video, ShieldCheck, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { MessageBubble, type Message } from '@/components/chat/message-bubble';
import { ChatInput } from '@/components/chat/chat-input';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { TrustBadge } from '@/components/shared/trust-badge';
import type { FilterMode } from '@/lib/message-filter';

/**
 * Status da transação que ativa o modo pós-escrow.
 * A liberação ocorre quando a transação atingir ESCROW_HELD ou além.
 */
const ESCROW_UNLOCKED_STATUSES = new Set([
  'ESCROW_HELD',
  'TRANSFER_PENDING',
  'COMPLETED',
  'DISPUTE_OPENED',
  'DISPUTE_RESOLVED',
]);

export interface ChatWindowProps {
  conversationId: number;
  participantName: string;
  participantAvatar?: string | null;
  isOnline?: boolean;
  listingContext?: string;
  messages: Message[];
  currentUserId: string;
  typingUser?: string | null;
  onSendMessage?: (message: string) => void;
  onAttach?: () => void;
  /**
   * Status atual da transação vinculada a esta conversa.
   * Quando for ESCROW_HELD ou posterior, o filtro de contatos é desativado.
   */
  transactionStatus?: string | null;
  /** Se o outro participante é um usuário verificado. */
  participantVerified?: boolean;
}

export function ChatWindow({
  conversationId,
  participantName,
  participantAvatar,
  isOnline = false,
  listingContext,
  messages,
  currentUserId,
  typingUser,
  onSendMessage,
  onAttach,
  transactionStatus,
  participantVerified = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Determina o modo do filtro com base no status da transação
  const isEscrowUnlocked =
    transactionStatus != null && ESCROW_UNLOCKED_STATUSES.has(transactionStatus);
  const filterMode: FilterMode = isEscrowUnlocked ? 'POST_ESCROW' : 'PRE_ESCROW';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUser]);

  const handleSend = (content: string) => {
    onSendMessage?.(content);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* ===================== HEADER ===================== */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {/* Participant Avatar */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              {participantAvatar && (
                <AvatarImage src={participantAvatar} alt={participantName} />
              )}
              <AvatarFallback>{getInitials(participantName)}</AvatarFallback>
            </Avatar>

            {/* Online Indicator */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
            )}
          </div>

          {/* Name & Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {participantName}
              </h3>
              {participantVerified && (
                <TrustBadge variant="verified-seller" size="sm" showLabel={false} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs',
                  isOnline
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {listingContext && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600">|</span>
                  <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {listingContext}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            aria-label="Chamada de voz"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            aria-label="Chamada de vídeo"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            aria-label="Mais opções"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ===================== LISTING CONTEXT BANNER ===================== */}
      {listingContext && (
        <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              Anúncio
            </Badge>
            <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">
              {listingContext}
            </span>
          </div>
        </div>
      )}

      {/* ===================== PROTECTION BANNER ===================== */}
      {isEscrowUnlocked ? (
        /* Pagamento confirmado – contatos liberados */
        <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-2 dark:border-emerald-900 dark:bg-emerald-950/40">
          <Unlock className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            Pagamento confirmado! Vocês podem trocar informações de contato.
          </p>
        </div>
      ) : (
        /* Antes do escrow – proteção ativa */
        <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2 dark:border-blue-900 dark:bg-blue-950/40">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
            Chat protegido pela EventSwap. Informações de contato são liberadas após a confirmação do pagamento.
          </p>
        </div>
      )}

      {/* ===================== MESSAGES AREA ===================== */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="py-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#6C3CE1]/10">
                <svg
                  className="h-7 w-7 text-[#6C3CE1]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Nenhuma mensagem ainda
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Envie uma mensagem para iniciar a conversa com{' '}
                <span className="font-medium">{participantName}</span>.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-0.5">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}

          {/* Typing Indicator */}
          {typingUser && (
            <TypingIndicator name={typingUser} visible={true} />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ===================== INPUT AREA ===================== */}
      <ChatInput
        onSend={handleSend}
        onAttach={onAttach}
        disabled={false}
        currentUserId={currentUserId}
        conversationId={conversationId}
        filterMode={filterMode}
      />
    </div>
  );
}
