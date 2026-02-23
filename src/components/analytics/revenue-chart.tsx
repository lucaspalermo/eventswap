'use client';

import { useState } from 'react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface RevenueDataPoint {
  label: string;
  gmv: number;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
  title?: string;
  showGmv?: boolean;
}

type TimeRange = '6m' | '12m' | 'all';

// ============================================================================
// Custom Tooltip
// ============================================================================

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {entry.dataKey === 'gmv' ? 'GMV' : 'Receita'}:
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RevenueChart({
  data,
  loading = false,
  title = 'Receita Mensal',
  showGmv = true,
}: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('12m');

  // Filter data based on time range
  const filteredData = (() => {
    switch (timeRange) {
      case '6m':
        return data.slice(-6);
      case '12m':
        return data.slice(-12);
      case 'all':
      default:
        return data;
    }
  })();

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '6m', label: '6 meses' },
    { value: '12m', label: '12 meses' },
    { value: 'all', label: 'Todos' },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#6C3CE1]" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-72 text-center">
            <BarChart3 className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum dado de receita disponivel ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#6C3CE1]" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                timeRange === opt.value
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={filteredData}>
            <defs>
              <linearGradient id="revGmvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C3CE1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="revRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#a1a1aa"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#a1a1aa"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
              }
            />
            {showGmv && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                }
              />
            )}
            <RechartsTooltip content={<ChartTooltip />} />
            {showGmv && (
              <Bar
                yAxisId="left"
                dataKey="gmv"
                fill="url(#revGmvGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                name="GMV"
              />
            )}
            <Line
              yAxisId={showGmv ? 'right' : 'left'}
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
              name="Receita"
            />
          </ComposedChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {showGmv && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#6C3CE1]" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">GMV (Volume Bruto)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-emerald-500 rounded" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Receita</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
