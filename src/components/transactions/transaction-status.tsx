'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  CreditCard,
  CheckCircle,
  Shield,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatusDisplayConfig {
  icon: React.ElementType;
  label: string;
  description: string;
  nextAction: string;
  colorClass: string;
  bgClass: string;
  iconBgClass: string;
  progress: number;
}

interface TransactionStatusProps {
  status: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Status configuration map
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, StatusDisplayConfig> = {
  INITIATED: {
    icon: Clock,
    label: 'Iniciada',
    description: 'A transacao foi criada e aguarda o proximo passo.',
    nextAction: 'Aguardando pagamento do comprador',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900',
    progress: 10,
  },
  AWAITING_PAYMENT: {
    icon: CreditCard,
    label: 'Aguardando Pagamento',
    description: 'O pagamento esta sendo processado pelo gateway.',
    nextAction: 'Aguardando confirmacao do pagamento',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900',
    progress: 25,
  },
  PAYMENT_CONFIRMED: {
    icon: CheckCircle,
    label: 'Pagamento Confirmado',
    description: 'O pagamento foi confirmado com sucesso.',
    nextAction: 'Valor sendo retido em garantia',
    colorClass: 'text-[#6C3CE1] dark:text-[#9B6DFF]',
    bgClass: 'bg-violet-50 border-violet-200 dark:bg-violet-950/50 dark:border-violet-800',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900',
    progress: 40,
  },
  ESCROW_HELD: {
    icon: Shield,
    label: 'Em Garantia',
    description: 'O valor esta retido em garantia na plataforma, protegendo ambas as partes.',
    nextAction: 'Aguardando confirmacao da transferencia da reserva',
    colorClass: 'text-[#6C3CE1] dark:text-[#9B6DFF]',
    bgClass: 'bg-violet-50 border-violet-200 dark:bg-violet-950/50 dark:border-violet-800',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900',
    progress: 60,
  },
  TRANSFER_PENDING: {
    icon: ArrowLeftRight,
    label: 'Transferencia Pendente',
    description: 'A reserva esta sendo transferida do vendedor para o comprador.',
    nextAction: 'Aguardando confirmacao de recebimento pelo comprador',
    colorClass: 'text-[#6C3CE1] dark:text-[#9B6DFF]',
    bgClass: 'bg-violet-50 border-violet-200 dark:bg-violet-950/50 dark:border-violet-800',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900',
    progress: 80,
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: 'Concluida',
    description: 'A transacao foi concluida com sucesso! O valor foi liberado para o vendedor.',
    nextAction: 'Transacao finalizada',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900',
    progress: 100,
  },
  DISPUTE_OPENED: {
    icon: AlertTriangle,
    label: 'Em Disputa',
    description: 'Uma disputa foi aberta nesta transacao. Nossa equipe esta analisando o caso.',
    nextAction: 'Aguardando resolucao pela equipe de suporte',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800',
    iconBgClass: 'bg-red-100 dark:bg-red-900',
    progress: 50,
  },
  CANCELLED: {
    icon: XCircle,
    label: 'Cancelada',
    description: 'Esta transacao foi cancelada.',
    nextAction: 'Nenhuma acao necessaria',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800',
    iconBgClass: 'bg-red-100 dark:bg-red-900',
    progress: 0,
  },
};

// Fallback config for unknown statuses
const FALLBACK_CONFIG: StatusDisplayConfig = {
  icon: Clock,
  label: 'Desconhecido',
  description: 'Status nao identificado.',
  nextAction: 'Entre em contato com o suporte',
  colorClass: 'text-zinc-500 dark:text-zinc-400',
  bgClass: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700',
  iconBgClass: 'bg-zinc-100 dark:bg-zinc-800',
  progress: 0,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransactionStatus({ status, className }: TransactionStatusProps) {
  const config = STATUS_CONFIG[status] || FALLBACK_CONFIG;
  const IconComponent = config.icon;

  return (
    <div className={cn('rounded-xl border p-6', config.bgClass, className)}>
      {/* Icon + Label */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-full',
            config.iconBgClass
          )}
        >
          <IconComponent className={cn('h-7 w-7', config.colorClass)} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn('text-lg font-bold', config.colorClass)}>
            {config.label}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {config.description}
          </p>
        </div>
      </div>

      {/* Next action prompt */}
      <div className="mt-4 rounded-lg bg-white/60 dark:bg-zinc-900/60 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Proxima etapa
        </p>
        <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {config.nextAction}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Progresso
          </span>
          <span className={cn('text-xs font-bold', config.colorClass)}>
            {config.progress}%
          </span>
        </div>
        <Progress value={config.progress} className="h-2.5" />
      </div>
    </div>
  );
}
