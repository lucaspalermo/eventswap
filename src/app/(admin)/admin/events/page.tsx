'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

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

interface ListingRow {
  id: number;
  title: string;
  seller: string;
  category: string;
  categoryLabel: string;
  price: number;
  status: string;
  views: number;
  createdAt: string;
}

const statusBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  PENDING_REVIEW: { label: 'Pendente', variant: 'warning' },
  SOLD: { label: 'Vendido', variant: 'default' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  DRAFT: { label: 'Rascunho', variant: 'outline' },
  EXPIRED: { label: 'Expirado', variant: 'secondary' },
  SUSPENDED: { label: 'Suspenso', variant: 'destructive' },
  RESERVED: { label: 'Reservado', variant: 'default' },
};

const categoryLabels: Record<string, string> = {
  WEDDING_VENUE: 'Espaco',
  BUFFET: 'Buffet',
  PHOTOGRAPHER: 'Fotografia',
  VIDEOGRAPHER: 'Filmagem',
  DJ_BAND: 'Musica e DJ',
  DECORATION: 'Decoracao',
  CATERING: 'Catering',
  WEDDING_DRESS: 'Vestido de Noiva',
  BEAUTY_MAKEUP: 'Beleza',
  PARTY_VENUE: 'Espaco Festa',
  TRANSPORT: 'Transporte',
  ACCOMMODATION: 'Hospedagem',
  OTHER: 'Outro',
};

const categoryColors: Record<string, string> = {
  BUFFET: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  WEDDING_VENUE: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
  PHOTOGRAPHER: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
  DJ_BAND: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  DECORATION: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  WEDDING_DRESS: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-400 dark:border-pink-800',
  VIDEOGRAPHER: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  OTHER: 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  CATERING: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  BEAUTY_MAKEUP: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-400 dark:border-pink-800',
  PARTY_VENUE: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
  TRANSPORT: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  ACCOMMODATION: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800',
};

const ITEMS_PER_PAGE = 20;

export default function AdminEventsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    listingId: number;
    listingTitle: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getStatusForTab = (tab: string): string | undefined => {
    switch (tab) {
      case 'pending': return 'PENDING_REVIEW';
      case 'active': return 'ACTIVE';
      case 'suspended': return 'CANCELLED';
      default: return undefined;
    }
  };

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const statusFilter = getStatusForTab(activeTab);
      const result = await adminService.getListings({
        search: search || undefined,
        status: statusFilter || 'all',
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (result?.data) {
        const mapped: ListingRow[] = result.data.map(
          (l: Record<string, unknown>) => ({
            id: l.id as number,
            title: (l.title as string) || 'Sem titulo',
            seller: (l.seller as { name: string })?.name || 'Vendedor',
            category: (l.category as string) || 'OTHER',
            categoryLabel:
              categoryLabels[(l.category as string)] || (l.category as string) || 'Outro',
            price: Number(l.asking_price) || 0,
            status: (l.status as string) || 'DRAFT',
            views: (l.view_count as number) || 0,
            createdAt: l.created_at as string,
          })
        );

        setListings(mapped);
        setTotalCount(result.count || mapped.length);
        setPendingCount(
          activeTab === 'all'
            ? mapped.filter((l) => l.status === 'PENDING_REVIEW').length
            : pendingCount
        );
              }
    } catch {
      setListings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTab, page]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadListings();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadListings]);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  const handleSuspend = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      await adminService.suspendListing(confirmAction.listingId);
      toast.success('Anuncio suspenso com sucesso.');
      loadListings();
    } catch {
      toast.error('Erro ao suspender anuncio.');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleApprove = async (listingId: number) => {
    try {
      await adminService.approveListing(listingId);
      toast.success('Anuncio aprovado com sucesso!');
      loadListings();
    } catch {
      toast.error('Erro ao aprovar anuncio. Tente novamente.');
    }
  };

  const handleReject = async (listingId: number) => {
    try {
      await adminService.rejectListing(listingId);
      toast.success('Anuncio rejeitado.');
      loadListings();
    } catch {
      toast.error('Erro ao rejeitar anuncio. Tente novamente.');
    }
  };

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
          Gerenciar Anuncios
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gerencie, aprove e modere os anuncios da plataforma.
        </p>
      </motion.div>

      {/* Tabs + Search */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pendentes
                {pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="suspended">Suspensos</TabsTrigger>
            </TabsList>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Buscar anuncios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconLeft={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Data Table (shared across all tabs) */}
          <div className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Titulo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Vendedor
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Categoria
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Preco
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Views
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Criado em
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
                      ) : listings.length === 0 ? (
                        <tr>
                          <td className="px-6 py-12 text-center text-sm text-zinc-500" colSpan={9}>
                            Nenhum anuncio encontrado.
                          </td>
                        </tr>
                      ) : (
                        listings.map((listing) => (
                          <tr key={listing.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
                                #{listing.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/admin/events/${listing.id}`}
                                className="text-sm font-medium text-zinc-900 hover:text-[#6C3CE1] dark:text-zinc-100 dark:hover:text-[#A78BFA]"
                              >
                                {listing.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                                {listing.seller}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                  categoryColors[listing.category] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
                                )}
                              >
                                {listing.categoryLabel}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {formatCurrency(listing.price)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={statusBadge[listing.status]?.variant || 'outline'}>
                                {statusBadge[listing.status]?.label || listing.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                                {listing.views.toLocaleString('pt-BR')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
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
                                    <Link href={`/admin/events/${listing.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver
                                    </Link>
                                  </DropdownMenuItem>
                                  {listing.status === 'PENDING_REVIEW' && (
                                    <>
                                      <DropdownMenuItem
                                        className="text-emerald-600 focus:text-emerald-700"
                                        onClick={() => handleApprove(listing.id)}
                                      >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Aprovar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-700"
                                        onClick={() => handleReject(listing.id)}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Rejeitar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-amber-600 focus:text-amber-700"
                                    onClick={() => setConfirmAction({ listingId: listing.id, listingTitle: listing.title })}
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspender
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, totalCount)} de {totalCount.toLocaleString('pt-BR')} anuncios
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
                        className={page === p ? 'bg-[#6C3CE1] text-white hover:bg-[#5B32C1] border-[#6C3CE1]' : ''}
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
          </div>
        </Tabs>
      </motion.div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        title="Suspender anuncio"
        description={`Tem certeza que deseja suspender "${confirmAction?.listingTitle}"? O anuncio nao sera mais visivel no marketplace.`}
        confirmText="Suspender"
        cancelText="Cancelar"
        onConfirm={handleSuspend}
        variant="destructive"
        loading={actionLoading}
      />
    </motion.div>
  );
}
