'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  BarChart3,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
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
// Color Palette
// ============================================================================

const PIE_COLORS = ['#6C3CE1', '#0EA5E9', '#10B981', '#F97316', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

// ============================================================================
// Mock Data
// ============================================================================

const mockKpiCards = [
  {
    key: 'gmv',
    label: 'GMV (Volume Bruto)',
    value: formatCurrencyCompact(2450000),
    change: '+18% vs mes anterior',
    icon: DollarSign,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'revenue',
    label: 'Receita',
    value: formatCurrencyCompact(367500),
    change: '+22% vs mes anterior',
    icon: TrendingUp,
    iconBg: 'bg-[#6C3CE1]/10',
    iconColor: 'text-[#6C3CE1]',
  },
  {
    key: 'activeUsers',
    label: 'Usuarios Ativos',
    value: '1.247',
    change: '+8% vs mes anterior',
    icon: Users,
    iconBg: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'conversion',
    label: 'Taxa de Conversao',
    value: '12,4%',
    change: '+1,2% vs mes anterior',
    icon: ArrowUpRight,
    iconBg: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
];

const mockMonthlyRevenue = [
  { month: 'Mar', value: 18500 },
  { month: 'Abr', value: 22000 },
  { month: 'Mai', value: 28000 },
  { month: 'Jun', value: 35000 },
  { month: 'Jul', value: 31000 },
  { month: 'Ago', value: 42000 },
  { month: 'Set', value: 38000 },
  { month: 'Out', value: 48000 },
  { month: 'Nov', value: 52000 },
  { month: 'Dez', value: 61000 },
  { month: 'Jan', value: 55000 },
  { month: 'Fev', value: 67800 },
];

const mockTransactionVolume = [
  { month: 'Mar', transactions: 45 },
  { month: 'Abr', transactions: 62 },
  { month: 'Mai', transactions: 78 },
  { month: 'Jun', transactions: 95 },
  { month: 'Jul', transactions: 88 },
  { month: 'Ago', transactions: 120 },
  { month: 'Set', transactions: 110 },
  { month: 'Out', transactions: 145 },
  { month: 'Nov', transactions: 160 },
  { month: 'Dez', transactions: 198 },
  { month: 'Jan', transactions: 175 },
  { month: 'Fev', transactions: 220 },
];

const mockTopCategories = [
  { name: 'Casamento', value: 32, color: '#EC4899' },
  { name: 'Buffet', value: 22, color: '#F97316' },
  { name: 'Espaco para Eventos', value: 18, color: '#6C3CE1' },
  { name: 'Fotografia', value: 12, color: '#0EA5E9' },
  { name: 'Musica e DJ', value: 8, color: '#10B981' },
  { name: 'Outros', value: 8, color: '#737373' },
];

const mockUserGrowth = [
  { month: 'Mar', users: 120 },
  { month: 'Abr', users: 185 },
  { month: 'Mai', users: 240 },
  { month: 'Jun', users: 310 },
  { month: 'Jul', users: 380 },
  { month: 'Ago', users: 450 },
  { month: 'Set', users: 520 },
  { month: 'Out', users: 610 },
  { month: 'Nov', users: 720 },
  { month: 'Dez', users: 890 },
  { month: 'Jan', users: 1050 },
  { month: 'Fev', users: 1247 },
];

const topCities = [
  { city: 'Sao Paulo', percentage: 38 },
  { city: 'Rio de Janeiro', percentage: 22 },
  { city: 'Belo Horizonte', percentage: 14 },
  { city: 'Curitiba', percentage: 10 },
  { city: 'Porto Alegre', percentage: 8 },
];

// ============================================================================
// Label & Color Maps
// ============================================================================

const categoryLabels: Record<string, string> = {
  WEDDING_VENUE: 'Espaco para Eventos',
  BUFFET: 'Buffet',
  PHOTOGRAPHER: 'Fotografia',
  VIDEOGRAPHER: 'Filmagem',
  DJ_BAND: 'Musica e DJ',
  DECORATION: 'Decoracao',
  CATERING: 'Catering',
  WEDDING_DRESS: 'Vestido de Noiva',
  BEAUTY_MAKEUP: 'Beleza',
  PARTY_VENUE: 'Espaco Festa',
  TRANSPORT: 'Transporte',
  ACCOMMODATION: 'Hospedagem',
  OTHER: 'Outros',
};

const categoryColorMap: Record<string, string> = {
  WEDDING_VENUE: '#6C3CE1',
  BUFFET: '#F97316',
  PHOTOGRAPHER: '#0EA5E9',
  VIDEOGRAPHER: '#EF4444',
  DJ_BAND: '#10B981',
  DECORATION: '#F59E0B',
  CATERING: '#F97316',
  WEDDING_DRESS: '#EC4899',
  BEAUTY_MAKEUP: '#EC4899',
  PARTY_VENUE: '#8B5CF6',
  TRANSPORT: '#3B82F6',
  ACCOMMODATION: '#14B8A6',
  OTHER: '#737373',
};

// ============================================================================
// Custom Tooltip Components
// ============================================================================

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-bold text-[#6C3CE1]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

function TransactionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-bold text-[#0EA5E9]">
        {payload[0].value.toLocaleString('pt-BR')} transacoes
      </p>
    </div>
  );
}

function UserGrowthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-bold text-blue-500">
        {payload[0].value.toLocaleString('pt-BR')} usuarios
      </p>
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { name: string } }[];
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {payload[0].payload.name}
      </p>
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
        {payload[0].value}%
      </p>
    </div>
  );
}

// ============================================================================
// Custom Pie Chart Label
// ============================================================================

import type { PieLabelRenderProps } from 'recharts';

function renderCustomLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const innerRadius = Number(props.innerRadius ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const percent = Number(props.percent ?? 0);

  if (percent < 0.08) return null; // Hide labels for tiny slices

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
// Main Page Component
// ============================================================================

export default function AdminAnalyticsPage() {
  const [kpiCards, setKpiCards] = useState(mockKpiCards);
  const [monthlyRevenue, setMonthlyRevenue] = useState(mockMonthlyRevenue);
  const [topCategories, setTopCategories] = useState(mockTopCategories);
  const [userGrowth] = useState(mockUserGrowth);
  const [transactionVolume] = useState(mockTransactionVolume);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        if (isDemoMode()) {
          setKpiCards(mockKpiCards);
          setLoading(false);
          return;
        }

        const data = await adminService.getAnalyticsData();
        if (data) {
          // Update KPI cards
          setKpiCards((prev) =>
            prev.map((kpi) => {
              switch (kpi.key) {
                case 'gmv':
                  return { ...kpi, value: formatCurrencyCompact(data.totalGmv) };
                case 'revenue':
                  return { ...kpi, value: formatCurrencyCompact(data.totalRevenue) };
                case 'activeUsers':
                  return { ...kpi, value: data.activeUsers.toLocaleString('pt-BR') };
                default:
                  return kpi;
              }
            })
          );

          // Update categories from real data
          if (data.categoryCounts && Object.keys(data.categoryCounts).length > 0) {
            const total = Object.values(data.categoryCounts).reduce((a, b) => a + b, 0);
            if (total > 0) {
              const sorted = Object.entries(data.categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6);

              const mapped = sorted.map(([cat, count]) => ({
                name: categoryLabels[cat] || cat,
                value: Math.round((count / total) * 100),
                color: categoryColorMap[cat] || '#737373',
              }));

              setTopCategories(mapped);
            }
          }

          // Build monthly revenue from real data
          if (data.revenueByMonth && data.revenueByMonth.length > 0) {
            const monthMap: Record<string, number> = {};
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            data.revenueByMonth.forEach((item: { platform_fee: string | number; created_at: string }) => {
              const date = new Date(item.created_at);
              const key = `${date.getFullYear()}-${date.getMonth()}`;
              monthMap[key] = (monthMap[key] || 0) + Number(item.platform_fee || 0);
            });

            const sortedMonths = Object.entries(monthMap)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-12)
              .map(([key, value]) => {
                const [, monthIdx] = key.split('-');
                return {
                  month: monthNames[Number(monthIdx)] || key,
                  value,
                };
              });

            if (sortedMonths.length > 0) {
              setMonthlyRevenue(sortedMonths);
            }
          }
        } else {
          setError('Nenhum dado de analytics disponivel no momento.');
        }
      } catch {
        setError('Erro ao carregar analytics. Verifique sua conexao e tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

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
          Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Metricas detalhadas sobre o desempenho da plataforma.
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

      {error ? null : (
      <>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {kpi.label}
                    </p>
                    {loading ? (
                      <div className="h-8 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
                    ) : (
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {kpi.value}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      kpi.iconBg
                    )}
                  >
                    <kpi.icon className={cn('h-5 w-5', kpi.iconColor)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1: Revenue + Transaction Volume */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Monthly Revenue BarChart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#6C3CE1]" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-72">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-[#6C3CE1]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C3CE1" stopOpacity={1} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis
                      dataKey="month"
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
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                      }
                    />
                    <RechartsTooltip content={<RevenueTooltip />} />
                    <Bar
                      dataKey="value"
                      fill="url(#colorRevenue)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction Volume LineChart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#0EA5E9]" />
                Volume de Transacoes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-72">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-[#0EA5E9]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={transactionVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis
                      dataKey="month"
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
                    <RechartsTooltip content={<TransactionTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="transactions"
                      stroke="#0EA5E9"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0EA5E9", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#0EA5E9", strokeWidth: 2, stroke: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2: Categories PieChart + User Growth AreaChart */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Category Distribution PieChart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Categorias Mais Populares</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-72">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-[#6C3CE1]" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 lg:flex-row">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={topCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={renderCustomLabel}
                        labelLine={false}
                      >
                        {topCategories.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-y-3 min-w-[140px]">
                    {topCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color || PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {category.name}
                        </span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {category.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* User Growth AreaChart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Crescimento de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-72">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={userGrowth}>
                    <defs>
                      <linearGradient id="colorUserGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis
                      dataKey="month"
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
                      dataKey="users"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorUserGrowth)"
                      dot={{ r: 3, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 5, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Geographic Distribution (kept as styled bars - no chart needed) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-rose-500" />
                Distribuicao Geografica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                Top 5 cidades com mais usuarios ativos
              </p>
              <div className="space-y-5">
                {topCities.map((city, index) => (
                  <div key={city.city} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {city.city}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        {city.percentage}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#6C3CE1] to-[#A78BFA]"
                        initial={{ width: 0 }}
                        animate={{ width: `${city.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      </>
      )}
    </motion.div>
  );
}
