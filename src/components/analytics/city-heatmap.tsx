'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface CityDataPoint {
  city: string;
  state: string;
  transactions: number;
  gmv: number;
}

interface CityHeatmapProps {
  data: CityDataPoint[];
  loading?: boolean;
  title?: string;
}

// ============================================================================
// Gradient Colors
// ============================================================================

const BAR_GRADIENTS = [
  'from-[#2563EB] to-[#60A5FA]',
  'from-[#2563EB]/90 to-[#60A5FA]/90',
  'from-[#2563EB]/80 to-[#60A5FA]/80',
  'from-[#2563EB]/70 to-[#60A5FA]/70',
  'from-[#2563EB]/60 to-[#60A5FA]/60',
  'from-[#2563EB]/50 to-[#60A5FA]/50',
  'from-[#2563EB]/40 to-[#60A5FA]/40',
  'from-[#2563EB]/35 to-[#60A5FA]/35',
  'from-[#2563EB]/30 to-[#60A5FA]/30',
  'from-[#2563EB]/25 to-[#60A5FA]/25',
];

// ============================================================================
// Main Component
// ============================================================================

export function CityHeatmap({
  data,
  loading = false,
  title = 'Top Cidades',
}: CityHeatmapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
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
            <MapPin className="h-5 w-5 text-rose-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MapPin className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum dado geografico disponivel ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxTransactions = Math.max(...data.map((d) => d.transactions), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-rose-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          Top {data.length} cidades com mais transacoes
        </p>
        <div className="space-y-4">
          {data.map((city, index) => {
            const barWidth = (city.transactions / maxTransactions) * 100;
            return (
              <div key={`${city.city}-${city.state}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {city.city}
                      </span>
                      {city.state && (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1">
                          ({city.state})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right flex-shrink-0">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {city.transactions} {city.transactions === 1 ? 'transacao' : 'transacoes'}
                    </span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 min-w-[80px] text-right">
                      {formatCurrency(city.gmv)}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${BAR_GRADIENTS[index] || BAR_GRADIENTS[BAR_GRADIENTS.length - 1]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.1 + index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
