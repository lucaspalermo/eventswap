'use client';

import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface FunnelStep {
  step: string;
  count: number;
}

interface FunnelChartProps {
  data: FunnelStep[];
  loading?: boolean;
  title?: string;
}

// ============================================================================
// Gradient Colors for Funnel Stages
// ============================================================================

const FUNNEL_COLORS = [
  { bg: 'bg-[#6C3CE1]', text: 'text-white', border: 'border-[#6C3CE1]' },
  { bg: 'bg-[#8B5CF6]', text: 'text-white', border: 'border-[#8B5CF6]' },
  { bg: 'bg-[#A78BFA]', text: 'text-white', border: 'border-[#A78BFA]' },
  { bg: 'bg-[#C4B5FD]', text: 'text-zinc-800', border: 'border-[#C4B5FD]' },
  { bg: 'bg-[#DDD6FE]', text: 'text-zinc-800', border: 'border-[#DDD6FE]' },
];

// ============================================================================
// Main Component
// ============================================================================

export function FunnelChart({
  data,
  loading = false,
  title = 'Funil de Conversao',
}: FunnelChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-14 rounded-lg"
                style={{ width: `${100 - i * 15}%`, margin: '0 auto' }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#6C3CE1]" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Filter className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum dado de funil disponivel ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = data[0]?.count || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-[#6C3CE1]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => {
            // Calculate width as percentage of max (first step)
            const widthPercent = maxCount > 0 ? Math.max((item.count / maxCount) * 100, 20) : 20;
            const colors = FUNNEL_COLORS[index] || FUNNEL_COLORS[FUNNEL_COLORS.length - 1];

            // Conversion rate from previous step
            const prevCount = index > 0 ? data[index - 1].count : null;
            const conversionRate = prevCount && prevCount > 0
              ? ((item.count / prevCount) * 100).toFixed(1)
              : null;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center"
                style={{ originX: 0.5 }}
              >
                <div
                  className={cn(
                    'relative rounded-lg px-4 py-3 flex items-center justify-between transition-all',
                    colors.bg,
                    colors.text
                  )}
                  style={{ width: `${widthPercent}%`, minWidth: '200px' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.step}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      {item.count.toLocaleString('pt-BR')}
                    </span>
                    {conversionRate && (
                      <span className={cn(
                        'text-[11px] font-medium px-1.5 py-0.5 rounded',
                        index < 3 ? 'bg-white/20' : 'bg-zinc-900/10'
                      )}>
                        {conversionRate}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector arrow between steps */}
                {index < data.length - 1 && (
                  <div className="h-2 w-px bg-zinc-200 dark:bg-zinc-700" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        {data.length >= 2 && (
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">
                Conversao total ({data[0].step} → {data[data.length - 1].step})
              </span>
              <span className="font-bold text-[#6C3CE1]">
                {data[0].count > 0
                  ? ((data[data.length - 1].count / data[0].count) * 100).toFixed(2)
                  : '0'}
                %
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
