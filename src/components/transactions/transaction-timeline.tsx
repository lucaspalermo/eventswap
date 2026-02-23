'use client';

import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';
import {
  Clock,
  CreditCard,
  Shield,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimelineEvent {
  status: string;
  label: string;
  description: string;
  date?: string;
}

interface TransactionTimelineProps {
  currentStatus: string;
  events: TimelineEvent[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Default timeline steps (used when events are not provided)
// ---------------------------------------------------------------------------

const DEFAULT_STEPS: TimelineEvent[] = [
  {
    status: 'INITIATED',
    label: 'Iniciada',
    description: 'Transacao criada pelo comprador',
  },
  {
    status: 'AWAITING_PAYMENT',
    label: 'Pagamento',
    description: 'Aguardando confirmacao do pagamento',
  },
  {
    status: 'ESCROW_HELD',
    label: 'Em Garantia',
    description: 'Valor retido em garantia na plataforma',
  },
  {
    status: 'TRANSFER_PENDING',
    label: 'Transferencia',
    description: 'Reserva sendo transferida ao comprador',
  },
  {
    status: 'COMPLETED',
    label: 'Concluida',
    description: 'Transacao finalizada com sucesso',
  },
];

// ---------------------------------------------------------------------------
// Status ordering for progress calculation
// ---------------------------------------------------------------------------

const STATUS_ORDER: Record<string, number> = {
  INITIATED: 0,
  AWAITING_PAYMENT: 1,
  PAYMENT_CONFIRMED: 2,
  ESCROW_HELD: 2,
  TRANSFER_PENDING: 3,
  COMPLETED: 4,
  DISPUTE_OPENED: -1,
  DISPUTE_RESOLVED: -1,
  CANCELLED: -1,
  REFUNDED: -1,
};

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const STEP_ICONS: Record<string, React.ElementType> = {
  INITIATED: Clock,
  AWAITING_PAYMENT: CreditCard,
  ESCROW_HELD: Shield,
  TRANSFER_PENDING: ArrowLeftRight,
  COMPLETED: CheckCircle2,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransactionTimeline({
  currentStatus,
  events,
  className,
}: TransactionTimelineProps) {
  const steps = events.length > 0 ? events : DEFAULT_STEPS;
  const currentStepIndex = STATUS_ORDER[currentStatus] ?? -1;
  const isCancelledOrDispute = currentStepIndex === -1;

  return (
    <div className={cn('relative', className)}>
      <div className="space-y-0">
        {steps.map((step, index) => {
          const stepIndex = STATUS_ORDER[step.status] ?? index;
          const isCompleted = !isCancelledOrDispute && currentStepIndex > stepIndex;
          const isActive = !isCancelledOrDispute && currentStepIndex === stepIndex;
          const isLast = index === steps.length - 1;

          const IconComponent = STEP_ICONS[step.status] || Clock;

          return (
            <div key={step.status} className="relative flex gap-4">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[19px] top-[40px] w-0.5 h-[calc(100%-24px)]',
                    isCompleted
                      ? 'bg-emerald-400 dark:bg-emerald-500'
                      : isActive
                        ? 'bg-gradient-to-b from-[#6C3CE1] to-zinc-200 dark:from-[#6C3CE1] dark:to-zinc-700'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                />
              )}

              {/* Icon circle */}
              <div className="relative z-10 shrink-0">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-400'
                      : isActive
                        ? 'border-[#6C3CE1] bg-[#6C3CE1]/10 text-[#6C3CE1] ring-4 ring-[#6C3CE1]/10 dark:ring-[#6C3CE1]/20'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : isActive
                          ? 'text-[#6C3CE1] dark:text-[#9B6DFF]'
                          : 'text-zinc-400 dark:text-zinc-500'
                    )}
                  >
                    {step.label}
                  </h4>

                  {step.date && (isCompleted || isActive) && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatDateTime(step.date)}
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    'mt-0.5 text-xs leading-relaxed',
                    isCompleted || isActive
                      ? 'text-zinc-600 dark:text-zinc-400'
                      : 'text-zinc-400 dark:text-zinc-600'
                  )}
                >
                  {step.description}
                </p>

                {/* Active step pulse indicator */}
                {isActive && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6C3CE1] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6C3CE1]" />
                    </span>
                    <span className="text-xs font-medium text-[#6C3CE1] dark:text-[#9B6DFF]">
                      Etapa atual
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancelled / Dispute overlay message */}
      {isCancelledOrDispute && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {currentStatus === 'CANCELLED' && 'Esta transacao foi cancelada.'}
            {currentStatus === 'REFUNDED' && 'Esta transacao foi reembolsada.'}
            {currentStatus === 'DISPUTE_OPENED' && 'Esta transacao esta em disputa.'}
            {currentStatus === 'DISPUTE_RESOLVED' && 'A disputa desta transacao foi resolvida.'}
          </p>
        </div>
      )}
    </div>
  );
}
