'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricsGrid, buildUserMetrics } from '@/components/analytics/metrics-grid';
import { RevenueChart, type RevenueDataPoint } from '@/components/analytics/revenue-chart';
import { CategoryChart, type CategoryDataPoint } from '@/components/analytics/category-chart';
import { FunnelChart, type FunnelStep } from '@/components/analytics/funnel-chart';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ============================================================================
// Types
// ============================================================================

interface UserAnalyticsData {
  type: 'user';
  listings: {
    total: number;
    active: number;
    sold: number;
    expired: number;
  };
  transactions: {
    asBuyer: number;
    asSeller: number;
    completedSales: number;
    completedPurchases: number;
  };
  financial: {
    totalRevenue: number;
    totalSpent: number;
  };
  monthlyVolume: Array<{
    month: string;
    label: string;
    revenue: number;
    spent: number;
    sales: number;
    purchases: number;
  }>;
  topCategories: CategoryDataPoint[];
  conversionRate: number;
  avgResponseTimeHours: number;
  funnel: FunnelStep[];
  trends: {
    revenue: number;
    sales: number;
  };
}

// ============================================================================
// Performance Comparison Card
// ============================================================================

function PerformanceCard({ data }: { data: UserAnalyticsData }) {
  const monthly = data.monthlyVolume;
  if (monthly.length < 2) return null;

  const currentMonth = monthly[monthly.length - 1];
  const prevMonth = monthly[monthly.length - 2];

  const comparisons = [
    {
      label: 'Receita',
      current: currentMonth.revenue,
      previous: prevMonth.revenue,
      isCurrency: true,
    },
    {
      label: 'Vendas',
      current: currentMonth.sales,
      previous: prevMonth.sales,
      isCurrency: false,
    },
    {
      label: 'Compras',
      current: currentMonth.purchases,
      previous: prevMonth.purchases,
      isCurrency: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-[#2563EB]" />
          Comparativo com Mes Anterior
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparisons.map((item) => {
            const diff = item.current - item.previous;
            const isUp = diff > 0;
            const isDown = diff < 0;
            const pctChange = item.previous > 0
              ? Math.round(((item.current - item.previous) / item.previous) * 100)
              : item.current > 0 ? 100 : 0;

            return (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {item.label}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {item.isCurrency
                      ? `${formatCurrency(item.previous)} → ${formatCurrency(item.current)}`
                      : `${item.previous} → ${item.current}`
                    }
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-emerald-600' : isDown ? 'text-red-600' : 'text-zinc-500'}`}>
                  {isUp && <ArrowUpRight className="h-4 w-4" />}
                  {isDown && <ArrowDownRight className="h-4 w-4" />}
                  <span>{isUp ? '+' : ''}{pctChange}%</span>
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
// Response Time Card
// ============================================================================

function ResponseTimeCard({ hours }: { hours: number }) {
  const quality = hours <= 2 ? 'Excelente' : hours <= 6 ? 'Bom' : hours <= 24 ? 'Regular' : 'Lento';
  const qualityColor = hours <= 2
    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400'
    : hours <= 6
      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400'
      : hours <= 24
        ? 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400'
        : 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-blue-500" />
          Tempo Medio de Resposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {hours > 0 ? `${hours}h` : '--'}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            tempo medio para responder ofertas
          </p>
          {hours > 0 && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-3 ${qualityColor}`}>
              {quality}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Listings Breakdown Card
// ============================================================================

function ListingsBreakdownCard({ data }: { data: UserAnalyticsData['listings'] }) {
  const items = [
    { label: 'Total', value: data.total, color: 'bg-zinc-200 dark:bg-zinc-700' },
    { label: 'Ativos', value: data.active, color: 'bg-emerald-500' },
    { label: 'Vendidos', value: data.sold, color: 'bg-[#2563EB]' },
    { label: 'Expirados', value: data.expired, color: 'bg-zinc-400' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resumo de Anuncios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`mx-auto h-2 w-12 rounded-full ${item.color} mb-2`} />
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {item.value}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function UserAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) {
          setError('Erro ao carregar dados de analytics.');
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        } else {
          setError('Nenhum dado disponivel.');
        }
      } catch {
        setError('Erro ao conectar com o servidor.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  // Build derived data
  const metrics = data ? buildUserMetrics(data) : [];
  const revenueData: RevenueDataPoint[] = data
    ? data.monthlyVolume.map((m) => ({
        label: m.label,
        gmv: m.revenue + m.spent,
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Analytics
        </h1>
        <p className="mt-1 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
          Acompanhe o desempenho dos seus anuncios e transacoes.
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
          {/* Metrics Grid */}
          <motion.div variants={itemVariants}>
            <MetricsGrid metrics={metrics} loading={loading} columns={4} />
          </motion.div>

          {/* Revenue Chart - Full width */}
          <motion.div variants={itemVariants}>
            <RevenueChart
              data={revenueData}
              loading={loading}
              title="Receita ao Longo do Tempo"
              showGmv={false}
            />
          </motion.div>

          {/* Category + Funnel Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <CategoryChart
                data={data?.topCategories || []}
                loading={loading}
                title="Categorias (Vendas e Compras)"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FunnelChart
                data={data?.funnel || []}
                loading={loading}
              />
            </motion.div>
          </div>

          {/* Bottom row: Listings breakdown + Response time + Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <motion.div variants={itemVariants}>
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ) : data ? (
                <ListingsBreakdownCard data={data.listings} />
              ) : null}
            </motion.div>
            <motion.div variants={itemVariants}>
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <ResponseTimeCard hours={data?.avgResponseTimeHours || 0} />
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ) : data ? (
                <PerformanceCard data={data} />
              ) : null}
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
