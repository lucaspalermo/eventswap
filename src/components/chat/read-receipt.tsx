'use client';

import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReadReceiptStatus = 'sent' | 'delivered' | 'read';

export interface ReadReceiptProps {
  /** Current delivery status of the message */
  status: ReadReceiptStatus;
  /** ISO timestamp of the message */
  timestamp: string;
  /** Additional CSS classes */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats an ISO timestamp string to "HH:mm" in pt-BR locale.
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReadReceipt({ status, timestamp, className }: ReadReceiptProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
    >
      {/* Time */}
      <span className="text-[10px] leading-none text-zinc-400 dark:text-zinc-500">
        {formatTime(timestamp)}
      </span>

      {/* Check Icon */}
      {status === 'sent' && (
        <Check className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
      )}

      {status === 'delivered' && (
        <CheckCheck className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
      )}

      {status === 'read' && (
        <CheckCheck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
      )}
    </span>
  );
}
