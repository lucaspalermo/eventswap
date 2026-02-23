'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Store,
  ArrowLeftRight,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { isDemoMode } from '@/lib/demo-auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const mockStats = [
  {
    key: 'totalUsers',
    title: 'Total Usuarios',
    value: '2.847',
    change: '+142 este mes',
    changeType: 'positive' as const,
    icon: Users,
    iconBg: 'bg-[#6C3CE1]/10',
    iconColor: 'text-[#6C3CE1]',
  },
  {
    key: 'activeListings',
    title: 'Anuncios Ativos',
    value: '456',
    change: '+38 esta semana',
    changeType: 'positive' as const,
    icon: Store,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'totalTransactions',
    title: 'Transacoes Mes',
    value: '89',
    change: formatCurrency(847500),
    changeType: 'neutral' as const,
    icon: ArrowLeftRight,
    iconBg: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'revenue',
    title: 'Receita Plataforma',
    value: formatCurrency(67800),
    change: '+22% vs mes anterior',
    changeType: 'positive' as const,
    icon: DollarSign,
    iconBg: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'openDisputes',
    title: 'Disputas Abertas',
    value: '3',
    change: 'urgente',
    changeType: 'negative' as const,
    icon: AlertTriangle,
    iconBg: 'bg-red-50 dark:bg-red-950',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    key: 'conversionRate',
    title: 'Taxa de Conversao',
    value: '12,4%',
    change: '+1,2%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    iconBg: 'bg-violet-50 dark:bg-violet-950',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
];

const mockRecentActivity = [
  {
    id: 1,
    user: 'Maria Silva',
    action: 'Criou novo anuncio',
    date: '23/02/2026, 14:32',
    status: 'success' as const,
  },
  {
    id: 2,
    user: 'Joao Santos',
    action: 'Completou transacao #TXN-089',
    date: '23/02/2026, 13:15',
    status: 'success' as const,
  },
  {
    id: 3,
    user: 'Ana Oliveira',
    action: 'Abriu disputa na transacao #TXN-085',
    date: '23/02/2026, 11:48',
    status: 'warning' as const,
  },
  {
    id: 4,
    user: 'Carlos Mendes',
    action: 'Registrou-se na plataforma',
    date: '23/02/2026, 10:22',
    status: 'neutral' as const,
  },
  {
    id: 5,
    user: 'Fernanda Costa',
    action: 'Anuncio rejeitado pela moderacao',
    date: '22/02/2026, 18:05',
    status: 'error' as const,
  },
];

const statusStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};

const statusLabels = {
  success: 'Concluido',
  warning: 'Pendente',
  error: 'Rejeitado',
  neutral: 'Info',
};

const statusIcons = {
  success: CheckCircle2,
  warning: Clock,
  error: XCircle,
  neutral: CheckCircle2,
};

type StatItem = typeof mockStats[0];
type ActivityItem = typeof mockRecentActivity[0];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatItem[] | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[] | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [disputeCount, setDisputeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (isDemoMode()) {
          setStats(mockStats);
          setRecentActivity(mockRecentActivity);
          setPendingCount(12);
          setDisputeCount(3);
          setLoading(false);
          return;
        }

        const [dashboardStats, recentUsers, recentTx, pendingListings, openDisputes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentUsers(5),
          adminService.getRecentTransactions(5),
          adminService.getPendingListings(),
          adminService.getOpenDisputes(),
        ]);

        const updatedStats = mockStats.map((s) => {
          if (!dashboardStats) return s;
          const conversionRate = dashboardStats.totalListings > 0
            ? ((dashboardStats.totalTransactions / dashboardStats.totalListings) * 100).toFixed(1)
            : '0';
          switch (s.key) {
            case 'totalUsers':
              return { ...s, value: dashboardStats.totalUsers.toLocaleString('pt-BR') };
            case 'activeListings':
              return { ...s, value: dashboardStats.activeListings.toLocaleString('pt-BR') };
            case 'totalTransactions':
              return { ...s, value: dashboardStats.totalTransactions.toLocaleString('pt-BR') };
            case 'revenue':
              return { ...s, value: formatCurrency(dashboardStats.revenue) };
            case 'openDisputes':
              return { ...s, value: String(dashboardStats.openDisputes) };
            case 'conversionRate':
              return { ...s, value: `${conversionRate.replace('.', ',')}%` };
            default:
              return s;
          }
        });

        setStats(updatedStats);

        // Build recent activity from real data
        const activities: ActivityItem[] = [];

        if (recentUsers && recentUsers.length > 0) {
          recentUsers.slice(0, 2).forEach((u: { id: string; name: string; created_at: string }) => {
            activities.push({
              id: activities.length + 1,
              user: u.name || 'Usuario',
              action: 'Registrou-se na plataforma',
              date: new Date(u.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
              status: 'neutral',
            });
          });
        }

        if (recentTx && recentTx.length > 0) {
          recentTx.slice(0, 3).forEach((tx: { code: string; status: string; created_at: string; buyer?: { name: string } }) => {
            activities.push({
              id: activities.length + 1,
              user: tx.buyer?.name || 'Comprador',
              action: `Transacao ${tx.code} - ${tx.status}`,
              date: new Date(tx.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
              status: tx.status === 'COMPLETED' ? 'success' : tx.status === 'DISPUTE_OPENED' ? 'warning' : 'neutral',
            });
          });
        }

        setRecentActivity(activities.length > 0 ? activities : []);
        setPendingCount(pendingListings?.length || 0);
        setDisputeCount(openDisputes?.length || 0);
      } catch {
        setError('Erro ao carregar dados do painel administrativo. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-sm text-zinc-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Painel Administrativo
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Bem-vindo ao painel de controle. Monitore metricas, gerencie usuarios e supervisione operacoes da plataforma.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(stats ?? mockStats).map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {stat.title}
                    </p>
                    {loading ? (
                      <div className="h-8 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
                    ) : (
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {stat.value}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5">
                      {stat.changeType === 'positive' && (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      {stat.changeType === 'negative' && (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          stat.changeType === 'positive' && 'text-emerald-600 dark:text-emerald-400',
                          stat.changeType === 'negative' && 'text-red-600 dark:text-red-400',
                          stat.changeType === 'neutral' && 'text-zinc-500 dark:text-zinc-400'
                        )}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                      stat.iconBg
                    )}
                  >
                    <stat.icon className={cn('h-6 w-6', stat.iconColor)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Activity Table */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Usuario
                        </th>
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Acao
                        </th>
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Data
                        </th>
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {recentActivity.map((activity) => {
                        const StatusIcon = statusIcons[activity.status];
                        return (
                          <tr key={activity.id} className="group">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-xs font-bold text-[#6C3CE1]">
                                  {activity.user.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                  {activity.user}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                                {activity.action}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                {activity.date}
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                  statusStyles[activity.status]
                                )}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusLabels[activity.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">
                  Nenhuma atividade recente encontrada.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Acoes Rapidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/events">
                <Button variant="outline" className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                      <FileCheck className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Aprovar Anuncios Pendentes</p>
                      <p className="text-xs text-zinc-500">{pendingCount} aguardando revisao</p>
                    </div>
                  </div>
                  <Badge variant="warning" className="shrink-0">{pendingCount}</Badge>
                </Button>
              </Link>

              <Link href="/admin/kyc">
                <Button variant="outline" className="w-full justify-between h-auto py-3 mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6C3CE1]/10 dark:bg-[#6C3CE1]/20">
                      <FileCheck className="h-4.5 w-4.5 text-[#6C3CE1]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Verificacoes KYC</p>
                      <p className="text-xs text-zinc-500">Revisar documentos pendentes</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">KYC</Badge>
                </Button>
              </Link>

              <Link href="/admin/transactions">
                <Button variant="outline" className="w-full justify-between h-auto py-3 mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Resolver Disputas</p>
                      <p className="text-xs text-zinc-500">{disputeCount} disputas abertas</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="shrink-0">{disputeCount}</Badge>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
