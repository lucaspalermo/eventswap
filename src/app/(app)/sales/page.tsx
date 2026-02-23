'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface Sale {
  id: number;
  listingTitle: string;
  buyerName: string;
  price: number;
  sellerNetAmount: number;
  platformFee: number;
  status: 'completed' | 'transferring' | 'awaiting_payment';
  date: string;
}

const mockSales: Sale[] = [
  {
    id: 1,
    listingTitle: 'Buffet Premium Villa Bianca',
    buyerName: 'Pedro Lima',
    price: 32000,
    sellerNetAmount: 29440,
    platformFee: 2560,
    status: 'completed',
    date: '2026-01-15',
  },
  {
    id: 2,
    listingTitle: 'Fotógrafo Profissional RJ',
    buyerName: 'Camila Ferreira',
    price: 8500,
    sellerNetAmount: 7820,
    platformFee: 680,
    status: 'transferring',
    date: '2026-02-18',
  },
  {
    id: 3,
    listingTitle: 'DJ Set Completo',
    buyerName: 'Lucas Martins',
    price: 4800,
    sellerNetAmount: 4416,
    platformFee: 384,
    status: 'awaiting_payment',
    date: '2026-02-22',
  },
];

function mapTransactionStatus(status: string): Sale['status'] {
  const map: Record<string, Sale['status']> = {
    COMPLETED: 'completed',
    AWAITING_PAYMENT: 'awaiting_payment',
    INITIATED: 'awaiting_payment',
    PAYMENT_CONFIRMED: 'transferring',
    ESCROW_HELD: 'transferring',
    TRANSFER_PENDING: 'transferring',
  };
  return map[status] || 'awaiting_payment';
}

function SalesSkeleton() {
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

export default function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalCount = sales.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedSales = sales.slice(
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
      setSales(mockSales);
      setLoading(false);
      return;
    }

    transactionsService
      .getMySales(user.id)
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: Sale[] = data.map((t) => ({
            id: t.id,
            listingTitle: t.listing?.title || 'Reserva',
            buyerName: t.buyer?.name || 'Comprador',
            price: t.agreed_price,
            sellerNetAmount: t.seller_net_amount,
            platformFee: t.platform_fee,
            status: mapTransactionStatus(t.status),
            date: t.created_at?.split('T')[0] || '',
          }));
          setSales(mapped);
        } else {
          setSales([]);
        }
      })
      .catch(() => {
        setError('Erro ao carregar vendas. Verifique sua conexao e tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const totalRevenue = sales
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.sellerNetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Minhas Vendas
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Acompanhe suas vendas e receitas
          </p>
        </div>
        {!loading && !error && totalRevenue > 0 && (
          <div className="text-right">
            <p className="text-xs text-neutral-500">Receita total</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        )}
      </motion.div>

      {/* Loading */}
      {loading ? (
        <SalesSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Erro ao carregar vendas
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : sales.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nenhuma venda realizada"
          description="Quando você vender uma reserva, os detalhes da transação aparecerão aqui."
          action={{
            label: 'Criar Anúncio',
            onClick: () => (window.location.href = '/sell'),
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
          {paginatedSales.map((sale) => (
            <motion.div key={sale.id} variants={staggerChild}>
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                        sale.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30'
                          : sale.status === 'transferring'
                            ? 'bg-[#6C3CE1]/10'
                            : 'bg-amber-50 dark:bg-amber-950/30'
                      )}
                    >
                      <DollarSign
                        className={cn(
                          'h-6 w-6',
                          sale.status === 'completed'
                            ? 'text-emerald-500'
                            : sale.status === 'transferring'
                              ? 'text-[#6C3CE1]'
                              : 'text-amber-500'
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                        {sale.listingTitle}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Comprador: {sale.buyerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sale.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Preço de venda</p>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {formatCurrency(sale.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Valor líquido</p>
                          <p className="text-sm font-bold text-emerald-600">
                            {formatCurrency(sale.sellerNetAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          Taxa: {formatCurrency(sale.platformFee)}
                        </Badge>
                        <StatusBadge status={sale.status} />
                      </div>
                    </div>

                    {/* Action */}
                    <Link href={`/sales/${sale.id}`}>
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
