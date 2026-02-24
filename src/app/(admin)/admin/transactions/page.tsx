'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  MoreHorizontal,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

interface TransactionRow {
  id: string;
  code: string;
  buyer: string;
  seller: string;
  listing: string;
  amount: number;
  fee: number;
  status: string;
  date: string;
}

const statusBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  COMPLETED: { label: 'Concluido', variant: 'success' },
  INITIATED: { label: 'Iniciado', variant: 'outline' },
  AWAITING_PAYMENT: { label: 'Aguardando Pgto', variant: 'warning' },
  PAYMENT_CONFIRMED: { label: 'Pago', variant: 'default' },
  ESCROW_HELD: { label: 'Em Garantia', variant: 'default' },
  TRANSFER_PENDING: { label: 'Transferindo', variant: 'warning' },
  DISPUTE_OPENED: { label: 'Em Disputa', variant: 'destructive' },
  DISPUTE_RESOLVED: { label: 'Disputa Resolvida', variant: 'secondary' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  REFUNDED: { label: 'Reembolsado', variant: 'secondary' },
};

const ITEMS_PER_PAGE = 20;

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    transactionId: number;
    transactionCode: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleForceRefund = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      await adminService.forceRefund(confirmAction.transactionId);
      toast.success('Reembolso forcado com sucesso.');
      loadTransactions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao forcar reembolso.');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);
  const averageTicket = transactions.length > 0 ? totalVolume / transactions.length : 0;

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getTransactions({
        search: search || undefined,
        status: statusFilter,
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (result?.data) {
        const mapped: TransactionRow[] = result.data.map(
          (tx: Record<string, unknown>) => ({
            id: String(tx.id),
            code: (tx.code as string) || `TXN-${tx.id}`,
            buyer: (tx.buyer as { name: string })?.name || 'Comprador',
            seller: (tx.seller as { name: string })?.name || 'Vendedor',
            listing: (tx.listing as { title: string })?.title || 'Anuncio',
            amount: Number(tx.agreed_price) || 0,
            fee: Number(tx.platform_fee) || 0,
            status: (tx.status as string) || 'INITIATED',
            date: tx.created_at as string,
          })
        );

        setTransactions(mapped);
        setTotalCount(result.count || mapped.length);
              }
    } catch {
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadTransactions();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadTransactions]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

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
          Transacoes
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Acompanhe todas as transacoes realizadas na plataforma.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por codigo, comprador, vendedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  iconLeft={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="COMPLETED">Concluido</SelectItem>
                    <SelectItem value="AWAITING_PAYMENT">Aguardando Pgto</SelectItem>
                    <SelectItem value="PAYMENT_CONFIRMED">Pago</SelectItem>
                    <SelectItem value="ESCROW_HELD">Em Garantia</SelectItem>
                    <SelectItem value="TRANSFER_PENDING">Transferindo</SelectItem>
                    <SelectItem value="DISPUTE_OPENED">Em Disputa</SelectItem>
                    <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Codigo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Comprador
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Vendedor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Anuncio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Taxa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Data
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4" colSpan={9}>
                          <div className="h-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                        </td>
                      </tr>
                    ))
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-sm text-zinc-500" colSpan={9}>
                        Nenhuma transacao encontrada.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/transactions/${tx.code}`}
                            className="text-sm font-mono font-medium text-[#2563EB] hover:underline"
                          >
                            {tx.code}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">{tx.buyer}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">{tx.seller}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-600 dark:text-zinc-300 max-w-[200px] truncate block">
                            {tx.listing}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {formatCurrency(tx.fee)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusBadge[tx.status]?.variant || 'outline'}>
                            {statusBadge[tx.status]?.label || tx.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {new Date(tx.date).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acoes</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/transactions/${tx.code}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              {!['REFUNDED', 'CANCELLED'].includes(tx.status) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-700"
                                    onClick={() => setConfirmAction({ transactionId: Number(tx.id), transactionCode: tx.code })}
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Forcar Reembolso
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Row */}
            <div className="border-t border-zinc-200 bg-zinc-50/50 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800/30">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Volume Total:</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(totalVolume)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Taxas:</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalFees)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Ticket Medio:</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(averageTicket)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, totalCount)} de {totalCount.toLocaleString('pt-BR')} transacoes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    className={page === p ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-[#2563EB]' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                {totalPages > 3 && (
                  <>
                    <span className="text-sm text-zinc-400">...</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Proximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        title="Forcar reembolso"
        description={`Tem certeza que deseja forcar o reembolso da transacao ${confirmAction?.transactionCode}? O valor sera devolvido ao comprador e o anuncio reativado.`}
        confirmText="Forcar Reembolso"
        cancelText="Cancelar"
        onConfirm={handleForceRefund}
        variant="destructive"
        loading={actionLoading}
      />
    </motion.div>
  );
}
