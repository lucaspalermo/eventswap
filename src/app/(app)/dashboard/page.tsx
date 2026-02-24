"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Copy, Check, ArrowRight, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { MetricsGrid, buildUserMetrics } from "@/components/analytics/metrics-grid";
import { RevenueChart, type RevenueDataPoint } from "@/components/analytics/revenue-chart";
import { CategoryChart, type CategoryDataPoint } from "@/components/analytics/category-chart";
import { referralService } from "@/services/referral.service";
import { useAuth } from "@/hooks/use-auth";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function ReferralBannerCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('EVNT-...');

  useEffect(() => {
    const userId = user?.id ?? 'demo-user';
    setCode(referralService.generateReferralCode(userId));
  }, [user]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 sm:p-6 text-white shadow-lg">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-12 left-1/4 h-48 w-48 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
            <Gift className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base leading-snug">
              Convide amigos e ganhe R$ 50
            </p>
            <p className="text-sm text-white/75 mt-0.5">
              Compartilhe seu código:{' '}
              <span className="font-mono font-bold text-yellow-300">{code}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-medium transition-colors"
            aria-label="Copiar código"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-300" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Copiar</span>
          </button>
          <Link
            href="/referral"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-violet-700 text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
          >
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={sectionVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
          Visao geral da sua conta
        </p>
      </motion.div>

      {/* Stats Cards Row */}
      <motion.div variants={sectionVariants}>
        <StatsCards />
      </motion.div>

      {/* Two-column Layout: Recent Activity + Quick Actions */}
      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </motion.div>

      {/* Earnings Chart - Full Width */}
      <motion.div variants={sectionVariants}>
        <EarningsChart />
      </motion.div>

      {/* Analytics Preview Section */}
      <motion.div variants={sectionVariants}>
        <DashboardAnalyticsPreview />
      </motion.div>

      {/* Referral Banner */}
      <motion.div variants={sectionVariants}>
        <ReferralBannerCard />
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Analytics Preview (inline on dashboard)
// ============================================================================

function DashboardAnalyticsPreview() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<{
    metrics: ReturnType<typeof buildUserMetrics>;
    revenueData: RevenueDataPoint[];
    categoryData: CategoryDataPoint[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const json = await res.json();
        const data = json.data;
        if (!data) {
          setError(true);
          setLoading(false);
          return;
        }

        const metrics = buildUserMetrics(data);
        const revenueData: RevenueDataPoint[] = (data.monthlyVolume || []).map(
          (m: { label: string; revenue: number; spent: number }) => ({
            label: m.label,
            gmv: m.revenue + m.spent,
            revenue: m.revenue,
          })
        );
        const categoryData: CategoryDataPoint[] = data.topCategories || [];

        setAnalyticsData({ metrics, revenueData, categoryData });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  if (error && !analyticsData) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8 text-center">
        <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Analytics temporariamente indisponivel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#6C3CE1]" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Analytics
          </h2>
        </div>
        <Link
          href="/analytics"
          className="text-sm font-medium text-[#6C3CE1] hover:text-[#5a2fc4] transition-colors flex items-center gap-1"
        >
          Ver completo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid
        metrics={analyticsData?.metrics || []}
        loading={loading}
        columns={4}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart
          data={analyticsData?.revenueData || []}
          loading={loading}
          showGmv={false}
          title="Receita Mensal"
        />
        <CategoryChart
          data={analyticsData?.categoryData || []}
          loading={loading}
          title="Categorias"
        />
      </div>
    </div>
  );
}
