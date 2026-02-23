'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  UserPlus,
  Banknote,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  Users,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { referralService, type Referral, type ReferralStats } from '@/services/referral.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  staggerContainer,
  staggerChild,
  fadeUp,
} from '@/design-system/animations';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const statusConfig: Record<
  Referral['status'],
  { label: string; className: string }
> = {
  pending: {
    label: 'Pendente',
    className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
  registered: {
    label: 'Cadastrado',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  first_transaction: {
    label: 'Transação Realizada',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  rewarded: {
    label: 'Recompensado',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
};

// ---------------------------------------------------------------------------
// How it works steps
// ---------------------------------------------------------------------------

const steps = [
  {
    icon: Gift,
    title: 'Compartilhe seu código',
    description:
      'Envie seu código exclusivo para amigos via WhatsApp, email ou link direto.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    icon: UserPlus,
    title: 'Amigo se cadastra',
    description:
      'Seu amigo cria uma conta no EventSwap usando seu código de indicação.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Banknote,
    title: 'Vocês ganham créditos',
    description:
      'Após a primeira transação, você recebe R$ 50 e seu amigo ganha R$ 25 de desconto.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReferralPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);

  const userId = user?.id ?? 'demo-user';

  const loadData = useCallback(() => {
    referralService.seedDemoData(userId);
    setStats(referralService.getReferralStats(userId));
    setHistory(referralService.getReferralHistory(userId));
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const code = stats?.code ?? referralService.generateReferralCode(userId);
  const referralLink = `https://eventswap.com.br/register?ref=${code}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Tente manualmente.');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Oi! 👋 Eu uso o EventSwap para comprar e vender reservas de eventos com segurança. Se cadastra usando meu código *${code}* e ganha R$ 25 de desconto na primeira transação! 🎉\n\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent('Convite para o EventSwap — R$ 25 de desconto!');
    const body = encodeURIComponent(
      `Olá!\n\nEstou usando o EventSwap para comprar e vender reservas de eventos com segurança. É incrível!\n\nCrie sua conta usando meu código de indicação ${code} e ganhe R$ 25 de desconto na sua primeira transação.\n\nAcesse: ${referralLink}\n\nNos vemos lá! 🎊`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const statsCards = stats
    ? [
        {
          label: 'Total Convidados',
          value: stats.totalInvited,
          icon: Users,
          color: 'text-violet-600 dark:text-violet-400',
          bg: 'bg-violet-50 dark:bg-violet-900/20',
        },
        {
          label: 'Cadastrados',
          value: stats.totalRegistered,
          icon: UserPlus,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
          label: 'Transações',
          value: stats.totalCompleted,
          icon: TrendingUp,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
          label: 'Total Ganho',
          value: formatCurrency(stats.totalEarned),
          icon: Award,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          isReward: true,
        },
      ]
    : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Hero */}
      <motion.div
        variants={staggerChild}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 sm:p-10 text-white shadow-xl"
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70 uppercase tracking-wider">
                Programa de Indicação
              </p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Convide amigos,{' '}
            <span className="text-yellow-300">ganhe créditos</span>
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-xl">
            Ganhe{' '}
            <span className="font-semibold text-white">R$ 50</span> para cada
            amigo que completar uma transação. Seu amigo ganha{' '}
            <span className="font-semibold text-white">R$ 25</span> de
            desconto!
          </p>

          {/* Code display */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-yellow-300">
                {code}
              </span>
              <button
                onClick={copyCode}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Copiar código"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {stats && stats.pendingRewards > 0 && (
              <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 rounded-lg px-4 py-2">
                <Clock className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-medium text-amber-200">
                  {formatCurrency(stats.pendingRewards)} pendente
                </span>
              </div>
            )}
          </div>

          {/* Share buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium transition-colors shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              onClick={shareEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
              Copiar Link
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      {stats && (
        <motion.div
          variants={staggerChild}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.bg} mb-3`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {card.value}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {card.label}
                </p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* How it works */}
      <motion.div variants={staggerChild}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-5">
          Como funciona
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
              >
                {/* Step number connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-full w-5 h-[2px] bg-zinc-200 dark:bg-zinc-700 z-10 -translate-x-2.5" />
                )}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${step.bg} mb-4`}>
                  <Icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Passo {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Referral history */}
      <motion.div variants={staggerChild}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Histórico de Indicações
          </h2>
          {history.length > 0 && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {history.length} indicação{history.length !== 1 ? 'ões' : ''}
            </span>
          )}
        </div>

        {history.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
              <Gift className="h-7 w-7 text-violet-500" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Nenhuma indicação ainda
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Compartilhe seu código com amigos e acompanhe o progresso aqui.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Recompensa
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {history.map((referral) => {
                    const s = statusConfig[referral.status];
                    return (
                      <tr
                        key={referral.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-xs font-semibold text-violet-700 dark:text-violet-300">
                              {referral.referredName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {referral.referredName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">
                          {referral.referredEmail || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-medium">
                          {referral.status === 'rewarded' ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              +{formatCurrency(referral.referrerReward)}
                            </span>
                          ) : referral.status === 'first_transaction' ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              {formatCurrency(referral.referrerReward)} pendente
                            </span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-500">
                              {formatCurrency(referral.referrerReward)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-zinc-500 dark:text-zinc-400">
                          {formatDate(referral.createdAt, { dateStyle: 'short' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {history.map((referral) => {
                const s = statusConfig[referral.status];
                return (
                  <div key={referral.id} className="px-4 py-4 flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-sm font-semibold text-violet-700 dark:text-violet-300">
                      {referral.referredName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {referral.referredName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}
                        >
                          {s.label}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {formatDate(referral.createdAt, { dateStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {referral.status === 'rewarded' ? (
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(referral.referrerReward)}
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-400 dark:text-zinc-500">
                          {formatCurrency(referral.referrerReward)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Terms note */}
      <motion.p
        variants={staggerChild}
        className="text-xs text-zinc-400 dark:text-zinc-500 text-center pb-4"
      >
        Os créditos são liberados após a confirmação da primeira transação do
        amigo indicado.{' '}
        <Link
          href="/terms"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Ver termos completos
        </Link>
      </motion.p>
    </motion.div>
  );
}
