'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { analyzeMessage, getViolationDescription, type FilterMode } from '@/lib/message-filter';
import {
  recordViolation,
  getUserPenaltyLevel,
  getPenaltyMessage,
  type PenaltyLevel,
} from '@/lib/chat-violations';
import { adminService } from '@/services/admin.service';

export interface ChatInputProps {
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
  /** ID do usuário atual (necessário para rastrear violações) */
  currentUserId?: string;
  /** ID da conversa atual (necessário para rastrear violações) */
  conversationId?: number;
  /**
   * Modo de filtragem:
   *   PRE_ESCROW  – bloqueio estrito (padrão)
   *   POST_ESCROW – contatos liberados após pagamento confirmado
   */
  filterMode?: FilterMode;
}

export function ChatInput({
  onSend,
  onAttach,
  disabled = false,
  currentUserId,
  conversationId,
  filterMode = 'PRE_ESCROW',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Nível de penalidade calculado ao montar e atualizado após cada violação
  const [penaltyLevel, setPenaltyLevel] = useState<PenaltyLevel>('none');

  // Carrega o nível de penalidade atual do usuário ao montar o componente
  useEffect(() => {
    if (currentUserId) {
      setPenaltyLevel(getUserPenaltyLevel(currentUserId));
    }
  }, [currentUserId]);

  const isSuspended = penaltyLevel === 'suspended';
  const isEmpty = message.trim().length === 0;

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';

    const lineHeight = 24;
    const minHeight = lineHeight;
    const maxHeight = lineHeight * 4;
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [message, adjustHeight]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (trimmed.length === 0 || disabled) return;

    // Bloquear envio se usuário está suspenso
    if (isSuspended) {
      toast.error('Chat suspenso', {
        description: getPenaltyMessage('suspended'),
        duration: 6000,
      });
      return;
    }

    // Analisar a mensagem com o filtro
    const analysis = analyzeMessage(trimmed, filterMode);

    if (analysis.isBlocked) {
      const description = getViolationDescription(analysis.violations);

      // Registrar violação e obter novo nível de penalidade
      let newPenalty: PenaltyLevel = penaltyLevel;

      if (currentUserId && conversationId !== undefined) {
        const updated = recordViolation(currentUserId, {
          conversationId,
          violationType: analysis.violations.join(', '),
          messageSnippet: trimmed,
        });
        newPenalty = updated.penaltyLevel;
        setPenaltyLevel(newPenalty);

        // Reportar ao painel admin
        await adminService.reportChatViolation(
          currentUserId,
          conversationId,
          trimmed,
          analysis.violations.join(', ')
        );
      }

      // Exibir toast de acordo com o novo nível de penalidade
      if (newPenalty === 'suspended') {
        toast.error('Chat suspenso', {
          description: getPenaltyMessage('suspended'),
          duration: 8000,
        });
      } else if (newPenalty === 'restricted') {
        toast.warning('Mensagem bloqueada – Chat restrito', {
          description: `${description} ${getPenaltyMessage('restricted')}`,
          duration: 7000,
        });
      } else {
        toast.warning('Mensagem bloqueada', {
          description,
          duration: 5000,
        });
      }

      return; // Não envia a mensagem
    }

    // Mensagem aprovada – enviar normalmente
    onSend(trimmed);
    setMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, disabled, isSuspended, filterMode, penaltyLevel, currentUserId, conversationId, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Rótulo de estado do filtro exibido abaixo da área de texto
  const filterLabel =
    filterMode === 'POST_ESCROW'
      ? 'Contatos liberados após confirmação do pagamento'
      : 'Chat protegido';

  const filterLabelColor =
    filterMode === 'POST_ESCROW'
      ? 'text-emerald-500 dark:text-emerald-400'
      : 'text-[#6C3CE1] dark:text-purple-400';

  return (
    <div className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Mensagem de suspensão */}
      {isSuspended && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {getPenaltyMessage('suspended')}
        </div>
      )}

      {/* Mensagem de restrição */}
      {penaltyLevel === 'restricted' && !isSuspended && (
        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          {getPenaltyMessage('restricted')}
        </div>
      )}

      {/* Hint text */}
      <p className="mb-2 text-[10px] text-zinc-400 dark:text-zinc-500">
        Enter para enviar, Shift+Enter para nova linha
      </p>

      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        {onAttach && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAttach}
            disabled={disabled || isSuspended}
            className="mb-0.5 h-9 w-9 shrink-0 rounded-full p-0 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            aria-label="Anexar arquivo"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        )}

        {/* Auto-expanding Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isSuspended
                ? 'Seu chat foi suspenso temporariamente'
                : 'Digite uma mensagem...'
            }
            disabled={disabled || isSuspended}
            rows={1}
            className={cn(
              'w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-all duration-200',
              'placeholder:text-zinc-400',
              'focus:border-[#6C3CE1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900',
              isSuspended && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
            )}
            style={{
              minHeight: '24px',
              maxHeight: '96px',
              overflow: 'auto',
            }}
          />

          {/* Shield indicator (bottom-right of textarea) */}
          {!isSuspended && (
            <div className={cn('absolute bottom-2 right-3 flex items-center gap-1', filterLabelColor)}>
              <ShieldCheck className="h-3 w-3" />
              <span className="text-[9px] font-medium leading-none">{filterLabel}</span>
            </div>
          )}
        </div>

        {/* Send Button */}
        <motion.div
          animate={{
            scale: isEmpty ? 0.9 : 1,
            opacity: isEmpty ? 0.5 : 1,
          }}
          transition={{ duration: 0.15 }}
          className="mb-0.5"
        >
          <Button
            type="button"
            onClick={handleSend}
            disabled={isEmpty || disabled || isSuspended}
            className="h-9 w-9 shrink-0 rounded-full p-0"
            aria-label="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
