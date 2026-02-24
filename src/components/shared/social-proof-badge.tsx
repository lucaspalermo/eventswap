'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Zap,
  TrendingDown,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SocialProofVariant =
  | 'viewers'
  | 'recent_sale'
  | 'discount'
  | 'urgency'
  | 'verified'
  | 'top_seller';

export interface SocialProofBadgeProps {
  variant: SocialProofVariant;
  /** Numeric or string value used to interpolate into the label (e.g. viewer count, discount %, days until event) */
  value?: number | string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Variant configuration
// ---------------------------------------------------------------------------

interface VariantConfig {
  Icon: React.ElementType;
  getLabel: (value?: number | string) => string;
  containerClass: string;
  iconClass: string;
  textClass: string;
}

const VARIANT_CONFIGS: Record<SocialProofVariant, VariantConfig> = {
  viewers: {
    Icon: Eye,
    getLabel: (v) => `${v ?? 0} pessoas viram isso hoje`,
    containerClass:
      'bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  recent_sale: {
    Icon: Zap,
    getLabel: () => 'Vendido recentemente na sua regiao',
    containerClass:
      'bg-violet-50 border border-violet-200 dark:bg-violet-950/50 dark:border-violet-800',
    iconClass: 'text-violet-600 dark:text-violet-400',
    textClass: 'text-violet-700 dark:text-violet-300',
  },
  discount: {
    Icon: TrendingDown,
    getLabel: (v) => `${v ?? 0}% OFF do valor original`,
    containerClass:
      'bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    textClass: 'text-red-700 dark:text-red-300',
  },
  urgency: {
    Icon: Clock,
    getLabel: (v) => {
      const days = typeof v === 'number' ? v : parseInt(String(v ?? '0'), 10);
      if (days === 0) return 'Evento hoje!';
      if (days === 1) return 'Evento amanha!';
      return `Evento em ${days} dias`;
    },
    containerClass:
      'bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  verified: {
    Icon: ShieldCheck,
    getLabel: () => 'Vendedor verificado',
    containerClass:
      'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  top_seller: {
    Icon: Award,
    getLabel: () => 'Top Vendedor',
    containerClass:
      'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 dark:from-purple-950/50 dark:to-violet-950/50 dark:border-purple-800',
    iconClass: 'text-purple-600 dark:text-purple-400',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const badgeMotion = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 420,
      damping: 26,
    },
  },
};

// ---------------------------------------------------------------------------
// SocialProofBadge component
// ---------------------------------------------------------------------------

export function SocialProofBadge({
  variant,
  value,
  className,
}: SocialProofBadgeProps) {
  const config = VARIANT_CONFIGS[variant];
  const label = useMemo(() => config.getLabel(value), [config, value]);
  const { Icon } = config;

  return (
    <motion.div
      variants={badgeMotion}
      initial="hidden"
      animate="visible"
      className={cn('inline-flex', className)}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full',
          'select-none cursor-default',
          config.containerClass
        )}
      >
        <Icon
          className={cn('h-3 w-3 flex-shrink-0', config.iconClass)}
          aria-hidden="true"
        />
        <span
          className={cn(
            'text-[11px] font-medium leading-none whitespace-nowrap',
            config.textClass
          )}
        >
          {label}
        </span>
      </span>
    </motion.div>
  );
}
