'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Shield,
  Banknote,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { paymentsService } from '@/services/payments.service';
import { useAuth } from '@/hooks/use-auth';
import { isDemoMode } from '@/lib/demo-auth';
import { WithdrawDialog } from '@/components/wallet/withdraw-dialog';

interface WalletTransaction {
  id: number;
  type: 'sale' | 'withdrawal' | 'refund';
  description: string;
  amount: number;
  status: 'completed' | 'processing' | 'pending';
  date: string;
}

interface WalletBalance {
  available: number;
  pending: number;
}

const transactionIcons: Record<string, typeof ArrowUpRight> = {
  sale: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  refund: ArrowDownLeft,
};

const transactionColors: Record<string, string> = {
  sale: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  withdrawal: 'text-red-500 bg-red-50 dark:bg-red-950/30',
  refund: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completado', color: 'text-emerald-600' },
  processing: { label: 'Processando', color: 'text-[#6C3CE1]' },
  pending: { label: 'Pendente', color: 'text-amber-500' },
};

function mapPaymentStatus(status: string): WalletTransaction['status'] {
  const map: Record<string, WalletTransaction['status']> = {
    SUCCEEDED: 'completed',
    PROCESSING: 'processing',
    PENDING: 'pending',
    FAILED: 'completed',
    REFUNDED: 'completed',
  };
  return map[status] || 'pending';
}

function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-9 w-36 mb-4" />
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-9 w-28 mb-4" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isDemoMode()) {
        setBalance({ available: 0, pending: 0 });
        setTransactions([]);
        setLoading(false);
        return;
      }

      const [balanceData, historyData] = await Promise.all([
        paymentsService.getWalletBalance(user.id),
        paymentsService.getPaymentHistory(user.id),
      ]);

      if (balanceData) {
        setBalance({
          available: balanceData.availableBalance,
          pending: balanceData.pendingAmount,
        });
      } else {
        setBalance({ available: 0, pending: 0 });
      }

      if (historyData && historyData.length > 0) {
        const mapped: WalletTransaction[] = historyData.map((p, index) => {
          const isPayee = p.payee_id === user.id;
          const isRefund = p.status === 'REFUNDED';
          const type: WalletTransaction['type'] = isRefund
            ? 'refund'
            : isPayee
              ? 'sale'
              : 'withdrawal';

          const title = p.transaction?.listing?.title || '';
          const description = isPayee
            ? `Venda: ${title || 'Transação'}`
            : `Pagamento: ${title || 'Transação'}`;

          return {
            id: p.id || index + 1,
            type,
            description,
            amount: isPayee ? (p.net_amount || p.gross_amount) : -(p.gross_amount),
            status: mapPaymentStatus(p.status),
            date: p.created_at?.split('T')[0] || '',
          };
        });
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch {
      setError('Erro ao carregar carteira. Verifique sua conexao e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Carteira
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gerencie seu saldo e transações
          </p>
        </motion.div>
        <WalletSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Carteira
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gerencie seu saldo e transações
        </p>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Erro ao carregar carteira
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!error && balance !== null && (
        <>
          {/* Balance Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Available Balance */}
            <motion.div variants={staggerChild}>
              <Card className="hover:shadow-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6C3CE1]/5 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">
                        Saldo Disponível
                      </p>
                      <p className="text-3xl font-bold text-neutral-950 dark:text-white">
                        {formatCurrency(balance.available)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6C3CE1]/10">
                      <Wallet className="h-6 w-6 text-[#6C3CE1]" />
                    </div>
                  </div>
                  <Button
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => setWithdrawOpen(true)}
                    disabled={!balance || balance.available <= 0}
                  >
                    <Banknote className="h-4 w-4" />
                    Solicitar Saque
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Balance */}
            <motion.div variants={staggerChild}>
              <Card className="hover:shadow-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Em Garantia</p>
                      <p className="text-3xl font-bold text-neutral-950 dark:text-white">
                        {formatCurrency(balance.pending)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                      <Shield className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Valor retido em garantia até a confirmação da transferência das
                    reservas em andamento.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Transaction History */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#6C3CE1]" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!transactions || transactions.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-8">
                    Nenhuma transação encontrada.
                  </p>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1"
                  >
                    {transactions.map((transaction, index) => {
                      const Icon = transactionIcons[transaction.type];
                      const colorClass = transactionColors[transaction.type];
                      const isPositive = transaction.amount > 0;
                      const statusInfo = statusLabels[transaction.status];

                      return (
                        <motion.div key={transaction.id} variants={staggerChild}>
                          <div className="flex items-center gap-4 py-3">
                            {/* Icon */}
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                colorClass
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {transaction.description}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-neutral-500">
                                  {new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                  })}
                                </span>
                                <span
                                  className={cn(
                                    'text-[10px] font-medium',
                                    statusInfo.color
                                  )}
                                >
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <span
                              className={cn(
                                'text-sm font-bold shrink-0',
                                isPositive ? 'text-emerald-600' : 'text-red-500'
                              )}
                            >
                              {isPositive ? '+' : ''}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                          </div>
                          {index < transactions.length - 1 && <Separator />}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Withdraw Dialog */}
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        availableBalance={balance?.available ?? 0}
        onSuccess={fetchData}
      />
    </div>
  );
}
