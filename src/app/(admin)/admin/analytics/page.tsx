'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MetricsGrid, buildAdminMetrics } from '@/components/analytics/metrics-grid';
import { RevenueChart, type RevenueDataPoint } from '@/components/analytics/revenue-chart';
import { CategoryChart, type CategoryDataPoint } from '@/components/analytics/category-chart';
import { CityHeatmap, type CityDataPoint } from '@/components/analytics/city-heatmap';
import { FunnelChart, type FunnelStep } from '@/components/analytics/funnel-chart';
import { isDemoMode } from '@/lib/demo-auth';

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ============================================================================
// Types
// ============================================================================

interface AdminAnalyticsData {
  type: 'admin';
  gmv: {
    total: number;
    monthly: Array<{ month: string; label: string; gmv: number; revenue: number; transactions: number }>;
  };
  revenue: {
    total: number;
    monthly: Array<{ month: string; label: string; gmv: number; revenue: number; transactions: number }>;
  };
  users: {
    total: number;
    growth: Array<{ month: string; label: string; newUsers: number }>;
  };
  transactions: {
    total: number;
    completed: number;
    byStatus: Record<string, number>;
  };
  topCities: CityDataPoint[];
  categoryDistribution: CategoryDataPoint[];
  avgTransactionValue: number;
  activeListings: number;
  disputes: {
    total: number;
    open: number;
    rate: number;
  };
  funnel: FunnelStep[];
  trends: {
    gmv: number;
    revenue: number;
    transactions: number;
    users: number;
  };
}

// ============================================================================
// Demo / Mock Data
// ============================================================================

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function generateDemoData(): AdminAnalyticsData {
  const monthly = MONTH_NAMES.map((label, i) => ({
    month: `2025-${String(i + 1).padStart(2, '0')}`,
    label,
    gmv: 15000 + Math.round(Math.random() * 50000),
    revenue: 2000 + Math.round(Math.random() * 8000),
    transactions: 10 + Math.round(Math.random() * 40),
  }));

  return {
    type: 'admin',
    gmv: {
      total: monthly.reduce((s, m) => s + m.gmv, 0),
      monthly,
    },
    revenue: {
      total: monthly.reduce((s, m) => s + m.revenue, 0),
      monthly,
    },
    users: {
      total: 1247,
      growth: MONTH_NAMES.map((label, i) => ({
        month: `2025-${String(i + 1).padStart(2, '0')}`,
        label,
        newUsers: 50 + Math.round(Math.random() * 120),
      })),
    },
    transactions: {
      total: monthly.reduce((s, m) => s + m.transactions, 0),
      completed: Math.round(monthly.reduce((s, m) => s + m.transactions, 0) * 0.72),
      byStatus: {
        COMPLETED: 320,
        ESCROW_HELD: 45,
        AWAITING_PAYMENT: 28,
        CANCELLED: 42,
        REFUNDED: 15,
        DISPUTE_OPENED: 8,
      },
    },
    topCities: [
      { city: 'Sao Paulo', state: 'SP', transactions: 145, gmv: 580000 },
      { city: 'Rio de Janeiro', state: 'RJ', transactions: 98, gmv: 392000 },
      { city: 'Belo Horizonte', state: 'MG', transactions: 62, gmv: 248000 },
      { city: 'Curitiba', state: 'PR', transactions: 45, gmv: 180000 },
      { city: 'Porto Alegre', state: 'RS', transactions: 38, gmv: 152000 },
      { city: 'Salvador', state: 'BA', transactions: 32, gmv: 128000 },
      { city: 'Brasilia', state: 'DF', transactions: 28, gmv: 112000 },
      { city: 'Recife', state: 'PE', transactions: 22, gmv: 88000 },
      { city: 'Florianopolis', state: 'SC', transactions: 18, gmv: 72000 },
      { city: 'Goiania', state: 'GO', transactions: 15, gmv: 60000 },
    ],
    categoryDistribution: [
      { name: 'Casamento', count: 145, percentage: 32, color: '#EC4899' },
      { name: 'Buffet', count: 98, percentage: 22, color: '#F97316' },
      { name: 'Espaco para Eventos', count: 78, percentage: 18, color: '#2563EB' },
      { name: 'Fotografia', count: 52, percentage: 12, color: '#0EA5E9' },
      { name: 'Musica e DJ', count: 35, percentage: 8, color: '#10B981' },
      { name: 'Outros', count: 35, percentage: 8, color: '#737373' },
    ],
    avgTransactionValue: 4200,
    activeListings: 234,
    disputes: {
      total: 23,
      open: 8,
      rate: 1.8,
    },
    funnel: [
      { step: 'Visualizacoes', count: 45200 },
      { step: 'Favoritos', count: 8340 },
      { step: 'Transacoes Iniciadas', count: 1580 },
      { step: 'Pagamentos Confirmados', count: 890 },
      { step: 'Concluidas', count: 720 },
    ],
    trends: {
      gmv: 18,
      revenue: 22,
      transactions: 15,
      users: 12,
    },
  };
}

// ============================================================================
// User Growth Chart Component
// ============================================================================

function UserGrowthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-bold text-blue-500">
        {payload[0].value.toLocaleString('pt-BR')} novos usuarios
      </p>
    </div>
  );
}

function UserGrowthChart({
  data,
  loading,
}: {
  data: Array<{ label: string; newUsers: number }>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Crescimento de Usuarios
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center">
            <Users className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum dado de crescimento disponivel.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="adminUserGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip content={<UserGrowthTooltip />} />
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#adminUserGrowthGrad)"
                dot={{ r: 3, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Transaction Status Breakdown
// ============================================================================

const STATUS_LABELS: Record<string, string> = {
  INITIATED: 'Iniciada',
  AWAITING_PAYMENT: 'Aguardando Pagamento',
  PAYMENT_CONFIRMED: 'Pagamento Confirmado',
  ESCROW_HELD: 'Em Garantia',
  TRANSFER_PENDING: 'Transferencia Pendente',
  COMPLETED: 'Concluida',
  DISPUTE_OPENED: 'Disputa Aberta',
  DISPUTE_RESOLVED: 'Disputa Resolvida',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-emerald-500',
  ESCROW_HELD: 'bg-blue-500',
  AWAITING_PAYMENT: 'bg-amber-500',
  PAYMENT_CONFIRMED: 'bg-teal-500',
  TRANSFER_PENDING: 'bg-indigo-500',
  CANCELLED: 'bg-red-500',
  REFUNDED: 'bg-zinc-400',
  DISPUTE_OPENED: 'bg-red-600',
  DISPUTE_RESOLVED: 'bg-orange-500',
  INITIATED: 'bg-zinc-300',
};

function TransactionStatusCard({
  byStatus,
  total,
  loading,
}: {
  byStatus: Record<string, number>;
  total: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sorted = Object.entries(byStatus).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transacoes por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map(([status, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {STATUS_LABELS[status] || status}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {count} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={cn('h-full rounded-full transition-all', STATUS_COLORS[status] || 'bg-zinc-400')}
                    style={{ width: `${pct}%` }}
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

// ============================================================================
// Main Page Component
// ============================================================================

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        if (isDemoMode()) {
          // Use demo data for demo mode
          setData(generateDemoData());
          setLoading(false);
          return;
        }

        const res = await fetch('/api/analytics?role=admin');
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'Erro ao carregar analytics.');
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (json.data) {
          setData(json.data);
        } else {
          // Fallback to demo data if no data returned
          setData(generateDemoData());
        }
      } catch {
        setError('Erro ao carregar analytics. Verifique sua conexao e tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  // Build derived data
  const metrics = data ? buildAdminMetrics(data) : [];
  const revenueData: RevenueDataPoint[] = data
    ? data.gmv.monthly.map((m) => ({
        label: m.label,
        gmv: m.gmv,
        revenue: m.revenue,
      }))
    : [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Analytics da Plataforma
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Metricas detalhadas sobre o desempenho da plataforma EventSwap.
        </p>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-sm text-zinc-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </motion.div>
      )}

      {!error && (
        <>
          {/* KPI Metrics Grid */}
          <motion.div variants={itemVariants}>
            <MetricsGrid metrics={metrics} loading={loading} columns={4} />
          </motion.div>

          {/* Revenue Chart (Platform GMV + Fees) */}
          <motion.div variants={itemVariants}>
            <RevenueChart
              data={revenueData}
              loading={loading}
              title="GMV e Receita Mensal"
              showGmv={true}
            />
          </motion.div>

          {/* Row 2: Category Distribution + User Growth */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <CategoryChart
                data={data?.categoryDistribution || []}
                loading={loading}
                title="Categorias Mais Populares"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <UserGrowthChart
                data={data?.users.growth || []}
                loading={loading}
              />
            </motion.div>
          </div>

          {/* Row 3: City Heatmap + Transaction Status */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <CityHeatmap
                data={data?.topCities || []}
                loading={loading}
                title="Top Cidades por Transacoes"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <TransactionStatusCard
                byStatus={data?.transactions.byStatus || {}}
                total={data?.transactions.total || 0}
                loading={loading}
              />
            </motion.div>
          </div>

          {/* Row 4: Funnel Chart */}
          <motion.div variants={itemVariants}>
            <FunnelChart
              data={data?.funnel || []}
              loading={loading}
              title="Funil de Conversao da Plataforma"
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
