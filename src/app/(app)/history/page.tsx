'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Plus,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Banknote,
  MessageSquare,
  Star,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { cn, formatCurrency } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { transactionsService } from '@/services/transactions.service';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { useAuth } from '@/hooks/use-auth';
import { isDemoMode } from '@/lib/demo-auth';

const ITEMS_PER_PAGE = 15;

interface HistoryEntry {
  id: number;
  type: 'listing_created' | 'listing_sold' | 'payment_received' | 'withdrawal' | 'purchase' | 'review_received' | 'listing_approved' | 'message' | 'transfer_complete';
  title: string;
  description: string;
  date: string;
  status?: 'completed' | 'pending' | 'active';
  amount?: number;
}

const typeIcons: Record<string, typeof Plus> = {
  listing_created: Plus,
  listing_sold: ShoppingCart,
  payment_received: CreditCard,
  withdrawal: Banknote,
  purchase: ShoppingCart,
  review_received: Star,
  listing_approved: CheckCircle2,
  message: MessageSquare,
  transfer_complete: ArrowRightLeft,
};

const typeColors: Record<string, string> = {
  listing_created: 'bg-[#2563EB]/10 text-[#2563EB]',
  listing_sold: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30',
  payment_received: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30',
  withdrawal: 'bg-red-50 text-red-500 dark:bg-red-950/30',
  purchase: 'bg-sky-50 text-sky-500 dark:bg-sky-950/30',
  review_received: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30',
  listing_approved: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30',
  message: 'bg-sky-50 text-sky-500 dark:bg-sky-950/30',
  transfer_complete: 'bg-[#2563EB]/10 text-[#2563EB]',
};


function mapStatusToHistoryStatus(status: string): HistoryEntry['status'] {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED' || status === 'REFUNDED') return undefined;
  return 'pending';
}

function HistorySkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((g) => (
        <div key={g}>
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative flex gap-4">
                  <Skeleton className="relative z-10 h-10 w-10 rounded-xl" />
                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalCount = history.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedHistory = history.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (isDemoMode()) {
          setHistory([]);
          setLoading(false);
          return;
        }

        const [purchasesData, salesData] = await Promise.all([
          transactionsService.getMyPurchases(user.id),
          transactionsService.getMySales(user.id),
        ]);

        const entries: HistoryEntry[] = [];
        let idCounter = 1;

        if (purchasesData && purchasesData.length > 0) {
          for (const t of purchasesData) {
            const title = t.listing?.title || 'Reserva';
            const sellerName = t.seller?.name || 'Vendedor';

            entries.push({
              id: idCounter++,
              type: 'purchase',
              title: 'Compra realizada',
              description: `Você comprou a reserva "${title}" de ${sellerName}.`,
              date: t.created_at?.split('T')[0] || '',
              status: mapStatusToHistoryStatus(t.status),
              amount: t.agreed_price,
            });

            if (t.status === 'COMPLETED') {
              entries.push({
                id: idCounter++,
                type: 'transfer_complete',
                title: 'Transferência concluída',
                description: `A transferência da reserva "${title}" foi concluída com sucesso.`,
                date: t.completed_at?.split('T')[0] || t.created_at?.split('T')[0] || '',
                status: 'completed',
              });
            }
          }
        }

        if (salesData && salesData.length > 0) {
          for (const t of salesData) {
            const title = t.listing?.title || 'Reserva';
            const buyerName = t.buyer?.name || 'Comprador';

            entries.push({
              id: idCounter++,
              type: 'listing_sold',
              title: 'Anúncio vendido',
              description: `"${title}" foi vendido para ${buyerName}.`,
              date: t.created_at?.split('T')[0] || '',
              status: mapStatusToHistoryStatus(t.status),
              amount: t.agreed_price,
            });

            if (t.status === 'COMPLETED' || t.status === 'ESCROW_HELD' || t.status === 'PAYMENT_CONFIRMED') {
              entries.push({
                id: idCounter++,
                type: 'payment_received',
                title: 'Pagamento recebido',
                description: `Pagamento de ${formatCurrency(t.agreed_price)} recebido pela venda do "${title}".`,
                date: t.created_at?.split('T')[0] || '',
                status: 'completed',
                amount: t.seller_net_amount,
              });
            }

            if (t.status === 'COMPLETED') {
              entries.push({
                id: idCounter++,
                type: 'transfer_complete',
                title: 'Transferência concluída',
                description: `A transferência da reserva "${title}" para ${buyerName} foi concluída com sucesso.`,
                date: t.completed_at?.split('T')[0] || t.created_at?.split('T')[0] || '',
                status: 'completed',
              });
            }
          }
        }

        // Sort by date descending
        entries.sort((a, b) => b.date.localeCompare(a.date));
        setHistory(entries);
      } catch {
        setError('Erro ao carregar histórico. Verifique sua conexao e tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Group paginated entries by month
  const groupedHistory = paginatedHistory.reduce(
    (groups, entry) => {
      const date = new Date(entry.date + 'T12:00:00');
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
      if (!groups[key]) {
        groups[key] = { label, entries: [] };
      }
      groups[key].entries.push(entry);
      return groups;
    },
    {} as Record<string, { label: string; entries: HistoryEntry[] }>
  );

  const sortedMonths = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Histórico
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Linha do tempo de todas as suas atividades
        </p>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <HistorySkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Erro ao carregar histórico
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma atividade"
          description="Seu histórico de atividades aparecerá aqui conforme você usar a plataforma."
        />
      ) : (
        <>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {sortedMonths.map((monthKey) => {
            const group = groupedHistory[monthKey];
            return (
              <motion.div key={monthKey} variants={staggerChild}>
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 capitalize">
                  {group.label}
                </h2>

                {/* Timeline entries */}
                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />

                  <div className="space-y-4">
                    {group.entries.map((entry) => {
                      const Icon = typeIcons[entry.type] || History;
                      const colorClass = typeColors[entry.type] || 'bg-neutral-100 text-neutral-500';

                      return (
                        <div key={entry.id} className="relative flex gap-4">
                          {/* Timeline dot */}
                          <div
                            className={cn(
                              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                              colorClass
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <Card className="flex-1 hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                      {entry.title}
                                    </h3>
                                    {entry.status && (
                                      <StatusBadge status={entry.status} />
                                    )}
                                  </div>
                                  <p className="text-sm text-neutral-500 leading-relaxed">
                                    {entry.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  {entry.amount !== undefined && (
                                    <span
                                      className={cn(
                                        'text-sm font-bold',
                                        entry.amount > 0
                                          ? 'text-emerald-600'
                                          : 'text-red-500'
                                      )}
                                    >
                                      {entry.amount > 0 ? '+' : ''}
                                      {formatCurrency(Math.abs(entry.amount))}
                                    </span>
                                  )}
                                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                                    {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pagination */}
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
        </>
      )}
    </div>
  );
}
