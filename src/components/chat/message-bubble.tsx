'use client';

import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MessageType = 'text' | 'system';

export interface Message {
  id: number;
  content: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
  type: MessageType;
}

export interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isOwn = message.senderId === currentUserId;
  const isSystem = message.type === 'system';

  // System message: centered neutral badge
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center px-4 py-1"
      >
        <div className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex px-4 py-0.5',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'group relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
          isOwn
            ? 'rounded-br-md bg-[#6C3CE1] text-white'
            : 'rounded-bl-md bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        )}
      >
        {/* Message Text */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>

        {/* Timestamp & Read Status */}
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1',
            isOwn ? 'text-white/60' : 'text-zinc-400 dark:text-zinc-500'
          )}
        >
          <span className="text-[10px]">
            {formatMessageTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className="flex items-center">
              {message.isRead ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
