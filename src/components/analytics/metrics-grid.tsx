'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Tag,
  ShoppingBag,
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { cn, formatCurrencyCompact } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// Types
// ============================================================================

export interface MetricItem {
  id: string;
  label: string;
  value: number;
  formattedValue?: string;
  prefix?: string;
  suffix?: string;
  trend?: number; // percentage change vs previous period
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  isCurrency?: boolean;
}

interface MetricsGridProps {
  metrics: MetricItem[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

// ============================================================================
// Animated Counter Hook
// ============================================================================

function useAnimatedCounter(target: number, duration: number = 1200, enabled: boolean = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    setCount(0);
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, enabled]);

  return count;
}

// ============================================================================
// Single Metric Card
// ============================================================================

function MetricCard({ metric, index }: { metric: MetricItem; index: number }) {
  const animatedValue = useAnimatedCounter(metric.value, 1200 + index * 100);

  const Icon = metric.icon || Activity;
  const iconBg = metric.iconBg || 'bg-gradient-to-br from-[#2563EB] to-[#8B5CF6]';
  const iconColor = metric.iconColor || 'text-white';

  const trend = metric.trend || 0;
  const trendIsPositive = trend > 0;
  const trendIsNegative = trend < 0;
  const trendIsNeutral = trend === 0;

  // Format the displayed value
  const displayValue = metric.formattedValue
    ? metric.formattedValue
    : metric.isCurrency
      ? formatCurrencyCompact(animatedValue)
      : `${metric.prefix || ''}${animatedValue.toLocaleString('pt-BR')}${metric.suffix || ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm transition-shadow duration-200',
        'hover:shadow-lg',
        'dark:border-zinc-800 dark:bg-zinc-900'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg shadow-sm',
            iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>

        {/* Trend badge */}
        {metric.trend !== undefined && (
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trendIsPositive && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
              trendIsNegative && 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
              trendIsNeutral && 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            {trendIsPositive && <TrendingUp className="h-3 w-3" />}
            {trendIsNegative && <TrendingDown className="h-3 w-3" />}
            {trendIsNeutral && <Minus className="h-3 w-3" />}
            <span>{trendIsPositive ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {displayValue}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {metric.label}
        </p>
      </div>

      {/* Decorative hover circle */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-[#2563EB]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function MetricsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MetricsGrid({ metrics, loading = false, columns = 4 }: MetricsGridProps) {
  if (loading) {
    return <MetricsGridSkeleton count={metrics.length || columns} />;
  }

  if (metrics.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div>
          <BarChart3 className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma metrica disponivel no momento.
          </p>
        </div>
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {metrics.map((metric, index) => (
        <MetricCard key={metric.id} metric={metric} index={index} />
      ))}
    </div>
  );
}

// ============================================================================
// Preset Metric Builders
// ============================================================================

export function buildUserMetrics(data: {
  listings: { active: number; total: number; sold: number };
  transactions: { asBuyer: number; asSeller: number; completedSales: number };
  financial: { totalRevenue: number; totalSpent: number };
  conversionRate: number;
  trends: { revenue: number; sales: number };
}): MetricItem[] {
  return [
    {
      id: 'active-listings',
      label: 'Anuncios Ativos',
      value: data.listings.active,
      trend: 0,
      icon: Tag,
      iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#8B5CF6]',
      iconColor: 'text-white',
    },
    {
      id: 'revenue',
      label: 'Receita Total',
      value: data.financial.totalRevenue,
      isCurrency: true,
      trend: data.trends.revenue,
      icon: TrendingUp,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-white',
    },
    {
      id: 'purchases',
      label: 'Compras Realizadas',
      value: data.transactions.asBuyer,
      trend: 0,
      icon: ShoppingBag,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-white',
    },
    {
      id: 'conversion',
      label: 'Taxa de Conversao',
      value: data.conversionRate,
      suffix: '%',
      trend: 0,
      icon: Activity,
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-500',
      iconColor: 'text-white',
    },
  ];
}

export function buildAdminMetrics(data: {
  gmv: { total: number };
  revenue: { total: number };
  users: { total: number };
  transactions: { total: number; completed: number };
  disputes: { rate: number; open: number };
  activeListings: number;
  avgTransactionValue: number;
  trends: { gmv: number; revenue: number; transactions: number; users: number };
}): MetricItem[] {
  return [
    {
      id: 'gmv',
      label: 'GMV (Volume Bruto)',
      value: data.gmv.total,
      isCurrency: true,
      trend: data.trends.gmv,
      icon: DollarSign,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-white',
    },
    {
      id: 'revenue',
      label: 'Receita da Plataforma',
      value: data.revenue.total,
      isCurrency: true,
      trend: data.trends.revenue,
      icon: TrendingUp,
      iconBg: 'bg-[#2563EB]/10',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: 'users',
      label: 'Usuarios Totais',
      value: data.users.total,
      trend: data.trends.users,
      icon: Users,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-white',
    },
    {
      id: 'transactions',
      label: 'Transacoes',
      value: data.transactions.total,
      trend: data.trends.transactions,
      icon: BarChart3,
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-500',
      iconColor: 'text-white',
    },
    {
      id: 'active-listings',
      label: 'Anuncios Ativos',
      value: data.activeListings,
      icon: Tag,
      iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#8B5CF6]',
      iconColor: 'text-white',
    },
    {
      id: 'avg-value',
      label: 'Ticket Medio',
      value: data.avgTransactionValue,
      isCurrency: true,
      icon: DollarSign,
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
      iconColor: 'text-white',
    },
    {
      id: 'disputes',
      label: 'Disputas Abertas',
      value: data.disputes.open,
      icon: Shield,
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      iconColor: 'text-white',
    },
    {
      id: 'dispute-rate',
      label: 'Taxa de Disputas',
      value: data.disputes.rate,
      suffix: '%',
      icon: Shield,
      iconBg: 'bg-gradient-to-br from-orange-400 to-orange-500',
      iconColor: 'text-white',
    },
  ];
}
