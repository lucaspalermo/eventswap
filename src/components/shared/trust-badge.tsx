'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Zap,
  Award,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Badge variant definitions
// ---------------------------------------------------------------------------

export type TrustBadgeVariant =
  | 'verified-seller'
  | 'verified-buyer'
  | 'protected-transaction'
  | 'escrow-active'
  | 'fast-response'
  | 'top-seller'
  | 'new-user';

export type TrustBadgeSize = 'sm' | 'md' | 'lg';

interface BadgeConfig {
  label: string;
  tooltip: string;
  Icon: React.ElementType;
  containerClass: string;
  iconClass: string;
  textClass: string;
}

const BADGE_CONFIGS: Record<TrustBadgeVariant, BadgeConfig> = {
  'verified-seller': {
    label: 'Vendedor Verificado',
    tooltip:
      'Este vendedor passou pela verificacao de identidade e documentacao da EventSwap.',
    Icon: CheckCircle2,
    containerClass:
      'bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  'verified-buyer': {
    label: 'Comprador Verificado',
    tooltip:
      'Este comprador passou pela verificacao de identidade da EventSwap.',
    Icon: CheckCircle2,
    containerClass:
      'bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  'protected-transaction': {
    label: 'Transacao Protegida',
    tooltip:
      'Pagamento protegido por escrow. Seu dinheiro fica retido ate a transferencia ser concluida.',
    Icon: ShieldCheck,
    containerClass:
      'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  'escrow-active': {
    label: 'Escrow Ativo',
    tooltip:
      'O sistema de garantia esta ativo. O valor so sera liberado ao vendedor apos voce confirmar a transferencia.',
    Icon: Lock,
    containerClass:
      'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  'fast-response': {
    label: 'Resposta Rapida',
    tooltip:
      'Este vendedor costuma responder em menos de 1 hora. Mensagens respondidas com agilidade.',
    Icon: Zap,
    containerClass:
      'bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  'top-seller': {
    label: 'Top Vendedor',
    tooltip:
      'Vendedor com avaliacao acima de 4.5 e mais de 5 transacoes concluidas com sucesso.',
    Icon: Award,
    containerClass:
      'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 dark:from-purple-950/50 dark:to-violet-950/50 dark:border-purple-800',
    iconClass: 'text-purple-600 dark:text-purple-400',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
  'new-user': {
    label: 'Novo na Plataforma',
    tooltip:
      'Membro recente da EventSwap. Confira as avaliacoes e converse antes de fechar negocio.',
    Icon: Sparkles,
    containerClass:
      'bg-zinc-50 border border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700',
    iconClass: 'text-zinc-500 dark:text-zinc-400',
    textClass: 'text-zinc-600 dark:text-zinc-400',
  },
};

// ---------------------------------------------------------------------------
// Size configurations
// ---------------------------------------------------------------------------

const SIZE_CONFIGS: Record<
  TrustBadgeSize,
  { container: string; icon: string; text: string; gap: string }
> = {
  sm: {
    container: 'px-1.5 py-0.5 rounded-md',
    icon: 'h-3 w-3',
    text: 'text-[10px] font-medium leading-none',
    gap: 'gap-1',
  },
  md: {
    container: 'px-2.5 py-1 rounded-lg',
    icon: 'h-3.5 w-3.5',
    text: 'text-xs font-medium',
    gap: 'gap-1.5',
  },
  lg: {
    container: 'px-3 py-1.5 rounded-xl',
    icon: 'h-4 w-4',
    text: 'text-sm font-semibold',
    gap: 'gap-2',
  },
};

// ---------------------------------------------------------------------------
// Badge entrance animation
// ---------------------------------------------------------------------------

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// ---------------------------------------------------------------------------
// Tooltip component (internal)
// ---------------------------------------------------------------------------

function BadgeTooltip({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.15 }}
      className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
        'w-max max-w-[200px] px-3 py-2 rounded-lg',
        'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900',
        'text-[11px] font-normal leading-snug text-center shadow-lg',
        'pointer-events-none'
      )}
    >
      {text}
      {/* Arrow */}
      <span
        className="absolute left-1/2 -translate-x-1/2 top-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid',
          borderTopColor: 'inherit',
        }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// TrustBadge component
// ---------------------------------------------------------------------------

export interface TrustBadgeProps {
  variant: TrustBadgeVariant;
  size?: TrustBadgeSize;
  showLabel?: boolean;
  className?: string;
}

export function TrustBadge({
  variant,
  size = 'md',
  showLabel = true,
  className,
}: TrustBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = BADGE_CONFIGS[variant];
  const sizeConfig = SIZE_CONFIGS[size];
  const { Icon } = config;

  return (
    <motion.div
      variants={badgeVariants}
      initial="hidden"
      animate="visible"
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <span
        className={cn(
          'inline-flex items-center select-none cursor-default',
          sizeConfig.container,
          sizeConfig.gap,
          config.containerClass,
          className
        )}
      >
        <Icon className={cn(sizeConfig.icon, config.iconClass, 'flex-shrink-0')} />
        {showLabel && (
          <span className={cn(sizeConfig.text, config.textClass, 'whitespace-nowrap')}>
            {config.label}
          </span>
        )}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && <BadgeTooltip text={config.tooltip} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Convenience: icon-only badge (for tight spaces like card overlays)
// ---------------------------------------------------------------------------

export function TrustBadgeIcon({
  variant,
  size = 'sm',
  className,
}: Omit<TrustBadgeProps, 'showLabel'>) {
  return (
    <TrustBadge
      variant={variant}
      size={size}
      showLabel={false}
      className={className}
    />
  );
}
