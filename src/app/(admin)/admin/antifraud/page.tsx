'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Monitor,
  CreditCard,
  UserX,
  Search as SearchIcon,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/admin.service';

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

interface FraudAlert {
  id: number;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  affectedEntity: string;
  affectedEntityLink: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved';
  details: string[];
}

const severityConfig = {
  HIGH: {
    label: 'Alta',
    variant: 'destructive' as const,
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
  },
  MEDIUM: {
    label: 'Media',
    variant: 'warning' as const,
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
  },
  LOW: {
    label: 'Baixa',
    variant: 'default' as const,
    icon: AlertTriangle,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
  },
};

const statusConfig = {
  open: { label: 'Aberto', variant: 'destructive' as const },
  investigating: { label: 'Investigando', variant: 'warning' as const },
  resolved: { label: 'Resolvido', variant: 'success' as const },
};

const categoryIcons: Record<string, typeof Monitor> = {
  'Conta Duplicada': UserX,
  'Preco Suspeito': CreditCard,
  'Acesso Suspeito': Monitor,
};

export default function AdminAntifraudPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await adminService.getAntifraudAlerts();
        if (data) {
          const arr = data as FraudAlert[];
          setAlerts(arr);
        } else {
          setAlerts([]);
        }
      } catch {
        setAlerts([]);
        setError('Erro ao carregar alertas antifraude. Verifique sua conexao e tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const totalAlerts = alerts.length;
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved').length;
  const pendingAlerts = alerts.filter((a) => a.status !== 'resolved').length;

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
          Monitoramento Antifraude
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Monitore alertas de seguranca e atividades suspeitas na plataforma.
        </p>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Erro ao carregar alertas
          </h3>
          <p className="text-sm text-zinc-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </motion.div>
      )}

      {!error && (
      <>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total de Alertas',
            value: totalAlerts,
            icon: Shield,
            color: 'text-[#6C3CE1]',
            bg: 'bg-[#6C3CE1]/10',
          },
          {
            label: 'Resolvidos',
            value: resolvedAlerts,
            icon: CheckCircle2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950',
          },
          {
            label: 'Pendentes',
            value: pendingAlerts,
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950',
          },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                    stat.bg
                  )}
                >
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  {loading ? (
                    <div className="h-8 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  ) : (
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {stat.value}
                    </p>
                  )}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      </div>
                    </div>
                    <div className="h-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : alerts.length === 0 ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Nenhum alerta encontrado
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nao ha alertas de fraude no momento. O sistema esta monitorando atividades suspeitas.
            </p>
          </motion.div>
        ) : (
          alerts.map((alert) => {
            const severity = severityConfig[alert.severity];
            const status = statusConfig[alert.status];
            const CategoryIcon = categoryIcons[alert.category] || AlertTriangle;

            return (
              <motion.div key={alert.id} variants={itemVariants}>
                <Card className={cn('border-l-4', severity.border)}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                              severity.bg
                            )}
                          >
                            <CategoryIcon className={cn('h-5 w-5', severity.color)} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                {alert.title}
                              </h3>
                              <Badge variant={severity.variant}>
                                {severity.label}
                              </Badge>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-400">
                              {alert.category} &middot;{' '}
                              {new Date(alert.detectedAt).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <Button className="gap-2 shrink-0">
                          <SearchIcon className="h-4 w-4" />
                          Investigar
                        </Button>
                      </div>

                      {/* Description */}
                      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {alert.description}
                      </p>

                      {/* Details */}
                      <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                          Detalhes
                        </p>
                        <ul className="space-y-1.5">
                          {alert.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Affected entity */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Entidade afetada:</span>
                        <Link
                          href={alert.affectedEntityLink}
                          className="inline-flex items-center gap-1 font-medium text-[#6C3CE1] hover:underline"
                        >
                          {alert.affectedEntity}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      </>
      )}
    </motion.div>
  );
}
