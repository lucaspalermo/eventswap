'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// Types
// ============================================================================

export interface CategoryDataPoint {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryDataPoint[];
  loading?: boolean;
  title?: string;
}

// ============================================================================
// Fallback Colors
// ============================================================================

const FALLBACK_COLORS = [
  '#6C3CE1', '#EC4899', '#0EA5E9', '#F97316', '#10B981',
  '#EF4444', '#8B5CF6', '#14B8A6',
];

// ============================================================================
// Custom Label (inside slices)
// ============================================================================

function renderCustomLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const innerRadius = Number(props.innerRadius ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const percent = Number(props.percent ?? 0);

  if (percent < 0.08) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ============================================================================
// Custom Tooltip
// ============================================================================

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; count: number; percentage: number };
  }>;
}) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0].payload;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        {entry.name}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {entry.count} {entry.count === 1 ? 'item' : 'itens'}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          ({entry.percentage}%)
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CategoryChart({
  data,
  loading = false,
  title = 'Distribuicao por Categoria',
}: CategoryChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <Skeleton className="h-[260px] w-full max-w-[300px] rounded-full" />
            <div className="space-y-3 w-full max-w-[180px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
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
            <PieChartIcon className="h-5 w-5 text-[#6C3CE1]" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <PieChartIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum dado de categoria disponivel ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use percentage as the pie chart value
  const pieData = data.map((d) => ({
    ...d,
    value: d.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-[#6C3CE1]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={105}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={renderCustomLabel}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2.5 lg:flex-col lg:gap-y-3 min-w-[160px]">
            {data.map((category, index) => (
              <div key={category.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      category.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                  }}
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                  {category.name}
                </span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
