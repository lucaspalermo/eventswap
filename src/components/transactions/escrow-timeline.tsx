'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDateTime } from '@/lib/utils';
import {
  CreditCard,
  Shield,
  ArrowLeftRight,
  UserCheck,
  Banknote,
  CheckCircle2,
  Clock,
  Timer,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EscrowStep {
  id: string;
  label: string;
  description: string;
  date?: string | null;
  icon: React.ElementType;
}

interface EscrowTimelineProps {
  currentStatus: string;
  paymentConfirmedAt?: string | null;
  escrowHeldAt?: string | null;
  sellerTransferredAt?: string | null;
  buyerConfirmedAt?: string | null;
  escrowReleaseDate?: string | null;
  autoRelease?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Countdown hook
// ---------------------------------------------------------------------------

function useCountdown(targetDate: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

// ---------------------------------------------------------------------------
// Step index mapping
// ---------------------------------------------------------------------------

const STEP_STATUS_MAP: Record<string, number> = {
  INITIATED: -1,
  AWAITING_PAYMENT: 0,
  PAYMENT_CONFIRMED: 0,
  ESCROW_HELD: 1,
  TRANSFER_PENDING: 2,
  COMPLETED: 4,
  DISPUTE_OPENED: -2,
  DISPUTE_RESOLVED: -2,
  CANCELLED: -2,
  REFUNDED: -2,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EscrowTimeline({
  currentStatus,
  paymentConfirmedAt,
  escrowHeldAt,
  sellerTransferredAt,
  buyerConfirmedAt,
  escrowReleaseDate,
  autoRelease = false,
  className,
}: EscrowTimelineProps) {
  const countdown = useCountdown(
    currentStatus === 'TRANSFER_PENDING' ? escrowReleaseDate : null
  );

  const currentStepIndex = STEP_STATUS_MAP[currentStatus] ?? -1;
  const isCancelledOrDispute = currentStepIndex === -2;

  const steps: EscrowStep[] = useMemo(
    () => [
      {
        id: 'payment',
        label: 'Pagamento confirmado',
        description: 'Pagamento do comprador foi confirmado',
        date: paymentConfirmedAt,
        icon: CreditCard,
      },
      {
        id: 'escrow',
        label: 'Valor em custodia',
        description: 'Valor retido com seguranca na plataforma',
        date: escrowHeldAt || paymentConfirmedAt,
        icon: Shield,
      },
      {
        id: 'transferred',
        label: 'Vendedor transferiu reserva',
        description: sellerTransferredAt
          ? 'Vendedor informou a transferencia da reserva'
          : 'Aguardando vendedor transferir a reserva',
        date: sellerTransferredAt,
        icon: ArrowLeftRight,
      },
      {
        id: 'confirmed',
        label: 'Comprador confirmou recebimento',
        description: buyerConfirmedAt
          ? autoRelease
            ? 'Confirmado automaticamente apos prazo expirar'
            : 'Comprador confirmou o recebimento da reserva'
          : 'Aguardando confirmacao do comprador',
        date: buyerConfirmedAt,
        icon: UserCheck,
      },
      {
        id: 'released',
        label: 'Valor liberado ao vendedor',
        description: currentStatus === 'COMPLETED'
          ? 'Valor creditado na carteira do vendedor'
          : 'Valor sera liberado apos confirmacao',
        date: currentStatus === 'COMPLETED' ? buyerConfirmedAt : null,
        icon: Banknote,
      },
    ],
    [
      paymentConfirmedAt,
      escrowHeldAt,
      sellerTransferredAt,
      buyerConfirmedAt,
      autoRelease,
      currentStatus,
    ]
  );

  return (
    <div className={cn('relative', className)}>
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-[#2563EB]" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Escrow de Seguranca
        </h3>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = !isCancelledOrDispute && currentStepIndex > index;
          const isActive = !isCancelledOrDispute && currentStepIndex === index;
          const isFuture = !isCancelledOrDispute && currentStepIndex < index;
          const isLast = index === steps.length - 1;
          const IconComponent = step.icon;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[19px] top-[40px] w-0.5 h-[calc(100%-16px)]',
                    'transition-colors duration-500',
                    isCompleted
                      ? 'bg-emerald-400 dark:bg-emerald-500'
                      : isActive
                        ? 'bg-gradient-to-b from-[#2563EB] to-zinc-200 dark:from-[#2563EB] dark:to-zinc-700'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                />
              )}

              {/* Icon circle */}
              <div className="relative z-10 shrink-0">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    borderColor: isCompleted
                      ? '#34d399'
                      : isActive
                        ? '#2563EB'
                        : '#e4e4e7',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-400'
                      : isActive
                        ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] ring-4 ring-[#2563EB]/10 dark:ring-[#2563EB]/20'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500'
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </motion.div>
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4
                    className={cn(
                      'text-sm font-semibold transition-colors duration-300',
                      isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : isActive
                          ? 'text-[#2563EB] dark:text-[#3B82F6]'
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
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563EB] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563EB]" />
                    </span>
                    <span className="text-xs font-medium text-[#2563EB] dark:text-[#3B82F6]">
                      Etapa atual
                    </span>
                  </motion.div>
                )}

                {/* Countdown timer for TRANSFER_PENDING at the "confirmed" step */}
                {step.id === 'confirmed' && currentStatus === 'TRANSFER_PENDING' && escrowReleaseDate && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
                        <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Liberacao automatica em:
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {countdown.total > 0 ? (
                              <>
                                <CountdownUnit value={countdown.days} label="dias" />
                                <span className="text-amber-500 text-xs font-bold">:</span>
                                <CountdownUnit value={countdown.hours} label="h" />
                                <span className="text-amber-500 text-xs font-bold">:</span>
                                <CountdownUnit value={countdown.minutes} label="min" />
                                <span className="text-amber-500 text-xs font-bold">:</span>
                                <CountdownUnit value={countdown.seconds} label="s" />
                              </>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                Prazo expirado - liberacao pendente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Future step hint */}
                {isFuture && step.id === 'released' && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Aguardando etapas anteriores
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {currentStatus === 'CANCELLED' && 'Esta transacao foi cancelada. O valor sera reembolsado.'}
            {currentStatus === 'REFUNDED' && 'Esta transacao foi reembolsada com sucesso.'}
            {currentStatus === 'DISPUTE_OPENED' && 'Esta transacao esta em disputa. Nosso time esta analisando.'}
            {currentStatus === 'DISPUTE_RESOLVED' && 'A disputa desta transacao foi resolvida.'}
          </p>
        </motion.div>
      )}

      {/* Completed success message */}
      {currentStatus === 'COMPLETED' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/50"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {autoRelease
                ? 'Transacao concluida por liberacao automatica do escrow.'
                : 'Transacao concluida com sucesso! Valor liberado ao vendedor.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Countdown Unit Component
// ---------------------------------------------------------------------------

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-300"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-[9px] text-amber-500 dark:text-amber-500">
        {label}
      </span>
    </div>
  );
}
