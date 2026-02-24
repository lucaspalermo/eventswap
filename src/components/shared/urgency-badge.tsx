'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UrgencyBadgeProps {
  eventDate: string;
  viewCount?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Urgency level definitions
// ---------------------------------------------------------------------------

type UrgencyLevel = 'critical' | 'high' | 'medium' | 'views' | 'low-stock' | null;

interface UrgencyConfig {
  label: string;
  Icon: React.ElementType;
  containerClass: string;
  iconClass: string;
  textClass: string;
  pulse: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const eventDate = new Date(dateStr);
  const diffMs = eventDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getWeeksUntil(days: number): number {
  return Math.ceil(days / 7);
}

function resolveUrgency(
  eventDate: string,
  viewCount?: number
): { level: UrgencyLevel; config: UrgencyConfig } | null {
  const days = getDaysUntil(eventDate);

  // Critical: event in less than 7 days
  if (days < 7 && days >= 0) {
    return {
      level: 'critical',
      config: {
        label: days === 0 ? 'Evento hoje!' : days === 1 ? 'Evento amanha!' : `Evento em ${days} dias!`,
        Icon: Flame,
        containerClass:
          'bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800',
        iconClass: 'text-red-600 dark:text-red-400',
        textClass: 'text-red-700 dark:text-red-300',
        pulse: true,
      },
    };
  }

  // High: event in less than 30 days
  if (days < 30) {
    return {
      level: 'high',
      config: {
        label: `Evento em ${days} dias`,
        Icon: AlertTriangle,
        containerClass:
          'bg-orange-50 border border-orange-200 dark:bg-orange-950/50 dark:border-orange-800',
        iconClass: 'text-orange-600 dark:text-orange-400',
        textClass: 'text-orange-700 dark:text-orange-300',
        pulse: false,
      },
    };
  }

  // Medium: event in less than 90 days
  if (days < 90) {
    const weeks = getWeeksUntil(days);
    return {
      level: 'medium',
      config: {
        label: weeks === 1 ? 'Evento em 1 semana' : `Evento em ${weeks} semanas`,
        Icon: Clock,
        containerClass:
          'bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800',
        iconClass: 'text-yellow-600 dark:text-yellow-400',
        textClass: 'text-yellow-700 dark:text-yellow-300',
        pulse: false,
      },
    };
  }

  // High views
  if (viewCount != null && viewCount > 10) {
    return {
      level: 'views',
      config: {
        label: `${viewCount} pessoas viram isso hoje`,
        Icon: Eye,
        containerClass:
          'bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
        iconClass: 'text-blue-600 dark:text-blue-400',
        textClass: 'text-blue-700 dark:text-blue-300',
        pulse: false,
      },
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// ---------------------------------------------------------------------------
// UrgencyBadge component
// ---------------------------------------------------------------------------

export function UrgencyBadge({
  eventDate,
  viewCount,
  className,
}: UrgencyBadgeProps) {
  const urgency = useMemo(
    () => resolveUrgency(eventDate, viewCount),
    [eventDate, viewCount]
  );

  if (!urgency) return null;

  const { config } = urgency;
  const { Icon } = config;

  return (
    <motion.div
      variants={badgeVariants}
      initial="hidden"
      animate="visible"
      className={cn('inline-flex', className)}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
          'select-none cursor-default',
          config.containerClass
        )}
      >
        {/* Icon with optional pulse ring */}
        <span className="relative flex-shrink-0">
          <Icon className={cn('h-3.5 w-3.5', config.iconClass)} />
          {config.pulse && (
            <span
              className={cn(
                'absolute -inset-1 rounded-full',
                'animate-ping opacity-30',
                'bg-red-500 dark:bg-red-400'
              )}
            />
          )}
        </span>

        {/* Label */}
        <span
          className={cn(
            'text-xs font-medium whitespace-nowrap',
            config.textClass
          )}
        >
          {config.label}
        </span>
      </span>
    </motion.div>
  );
}
