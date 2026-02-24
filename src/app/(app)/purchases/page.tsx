'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Eye,
  Calendar,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { cn, formatCurrency } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { transactionsService } from '@/services/transactions.service';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { useAuth } from '@/hooks/use-auth';
import { isDemoMode } from '@/lib/demo-auth';

const ITEMS_PER_PAGE = 10;

interface Purchase {
  id: number;
  listingTitle: string;
  price: number;
  status: 'completed' | 'awaiting_payment' | 'transferring';
  date: string;
  sellerName: string;
}

function mapTransactionStatus(status: string): Purchase['status'] {
  const map: Record<string, Purchase['status']> = {
    COMPLETED: 'completed',
    AWAITING_PAYMENT: 'awaiting_payment',
    INITIATED: 'awaiting_payment',
    PAYMENT_CONFIRMED: 'transferring',
    ESCROW_HELD: 'transferring',
    TRANSFER_PENDING: 'transferring',
  };
  return map[status] || 'awaiting_payment';
}

function PurchasesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PurchasesPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalCount = purchases.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedPurchases = purchases.slice(
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

    if (isDemoMode()) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    transactionsService
      .getMyPurchases(user.id)
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: Purchase[] = data.map((t) => ({
            id: t.id,
            listingTitle: t.listing?.title || 'Reserva',
            price: t.agreed_price,
            status: mapTransactionStatus(t.status),
            date: t.created_at?.split('T')[0] || '',
            sellerName: t.seller?.name || 'Vendedor',
          }));
          setPurchases(mapped);
        } else {
          setPurchases([]);
        }
      })
      .catch(() => {
        setError('Erro ao carregar compras. Verifique sua conexao e tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Minhas Compras
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Acompanhe suas compras de reservas de eventos
        </p>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <PurchasesSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Erro ao carregar compras
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma compra encontrada"
          description="Suas compras de reservas aparecerão aqui. Explore o marketplace para encontrar ofertas incríveis!"
          action={{
            label: 'Explorar Marketplace',
            onClick: () => (window.location.href = '/marketplace'),
          }}
        />
      ) : (
        <>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {paginatedPurchases.map((purchase) => (
            <motion.div key={purchase.id} variants={staggerChild}>
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                        purchase.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30'
                          : purchase.status === 'transferring'
                            ? 'bg-[#2563EB]/10'
                            : 'bg-amber-50 dark:bg-amber-950/30'
                      )}
                    >
                      <CreditCard
                        className={cn(
                          'h-6 w-6',
                          purchase.status === 'completed'
                            ? 'text-emerald-500'
                            : purchase.status === 'transferring'
                              ? 'text-[#2563EB]'
                              : 'text-amber-500'
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                        {purchase.listingTitle}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                        <span>Vendedor: {purchase.sellerName}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(purchase.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                      <span className="text-base font-bold text-[#2563EB]">
                        {formatCurrency(purchase.price)}
                      </span>
                      <StatusBadge status={purchase.status} />
                    </div>

                    {/* Action */}
                    <Link href={`/purchases/${purchase.id}`}>
                      <Button variant="outline" size="sm" className="shrink-0 gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
