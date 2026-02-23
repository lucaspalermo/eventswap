"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, TrendingUp, ShoppingBag, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { listingsService } from "@/services/listings.service";
import { transactionsService } from "@/services/transactions.service";

interface StatCard {
  label: string;
  value: string;
  trend: string;
  trendColor: "green" | "blue" | "neutral";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const fallbackStats: StatCard[] = [
  {
    label: "Anuncios Ativos",
    value: "0",
    trend: "Nenhum anuncio",
    trendColor: "neutral",
    icon: Tag,
    iconBg: "bg-gradient-to-br from-[#6C3CE1] to-[#8B5CF6]",
    iconColor: "text-white",
  },
  {
    label: "Vendas Realizadas",
    value: "R$ 0",
    trend: "Sem vendas",
    trendColor: "neutral",
    icon: TrendingUp,
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white",
  },
  {
    label: "Compras",
    value: "0",
    trend: "Sem compras",
    trendColor: "neutral",
    icon: ShoppingBag,
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
  },
  {
    label: "Avaliacao Media",
    value: "0",
    trend: "0 avaliacoes",
    trendColor: "neutral",
    icon: Star,
    iconBg: "bg-gradient-to-br from-amber-400 to-amber-500",
    iconColor: "text-white",
  },
];

const trendColorMap = {
  green:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  neutral:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
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

export function StatsCards() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatCard[]>(fallbackStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchStats = async () => {
      try {
        const [listings, sales, purchases] = await Promise.all([
          listingsService.getMyListings(user.id).catch(() => []),
          transactionsService.getMySales(user.id).catch(() => []),
          transactionsService.getMyPurchases(user.id).catch(() => []),
        ]);

        const activeListings = listings.filter((l) => l.status === "ACTIVE");
        const completedSales = sales.filter((s) => s.status === "COMPLETED");
        const totalSalesAmount = completedSales.reduce(
          (sum, s) => sum + (s.agreed_price || 0),
          0
        );
        const pendingPurchases = purchases.filter(
          (p) => p.status !== "COMPLETED" && p.status !== "CANCELLED"
        );

        setStats([
          {
            label: "Anuncios Ativos",
            value: String(activeListings.length),
            trend: `${listings.length} total`,
            trendColor: activeListings.length > 0 ? "green" : "neutral",
            icon: Tag,
            iconBg: "bg-gradient-to-br from-[#6C3CE1] to-[#8B5CF6]",
            iconColor: "text-white",
          },
          {
            label: "Vendas Realizadas",
            value: `R$ ${totalSalesAmount.toLocaleString("pt-BR")}`,
            trend: `${completedSales.length} vendas`,
            trendColor: completedSales.length > 0 ? "green" : "neutral",
            icon: TrendingUp,
            iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            iconColor: "text-white",
          },
          {
            label: "Compras",
            value: String(purchases.length),
            trend: pendingPurchases.length > 0
              ? `${pendingPurchases.length} em andamento`
              : "Sem pendencias",
            trendColor: pendingPurchases.length > 0 ? "blue" : "neutral",
            icon: ShoppingBag,
            iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
            iconColor: "text-white",
          },
          {
            label: "Avaliacao Media",
            value: profile?.rating_avg
              ? profile.rating_avg.toFixed(1)
              : "0",
            trend: `${profile?.rating_count || 0} avaliacoes`,
            trendColor: "neutral",
            icon: Star,
            iconBg: "bg-gradient-to-br from-amber-400 to-amber-500",
            iconColor: "text-white",
          },
        ]);
      } catch {
        // Keep fallback stats on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, profile, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fallbackStats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow duration-200",
              "hover:shadow-lg",
              "dark:border-zinc-800 dark:bg-zinc-900"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg shadow-sm",
                  stat.iconBg
                )}
              >
                <Icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  trendColorMap[stat.trendColor]
                )}
              >
                {stat.trend}
              </span>
            </div>

            <div>
              <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
            </div>

            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-[#6C3CE1]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
