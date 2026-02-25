'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  MoreVertical,
  Pencil,
  Pause,
  Trash2,
  Eye,
  Package,
  Image as ImageIcon,
  Loader2,
  Play,
  HandCoins,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { cn, formatCurrency } from '@/lib/utils';
import { EVENT_CATEGORIES_MAP } from '@/lib/constants';
import { staggerContainer, staggerChild, fadeUp } from '@/design-system/animations';
import { listingsService } from '@/services/listings.service';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { useAuth } from '@/hooks/use-auth';
import { OffersList } from '@/components/transactions/offers-list';
import { offersService } from '@/services/offers.service';
import { SponsorDialog } from '@/components/listings/sponsor-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { Listing, Offer } from '@/types/database.types';

const ITEMS_PER_PAGE = 10;

// ---------------------------------------------------------------------------
// DB category -> UI category mapping
// ---------------------------------------------------------------------------
const DB_TO_UI_CATEGORY: Record<string, string> = {
  WEDDING_VENUE: 'casamento',
  BUFFET: 'buffet',
  PHOTOGRAPHER: 'fotografia',
  VIDEOGRAPHER: 'video',
  DJ_BAND: 'musica',
  DECORATION: 'decoracao',
  CATERING: 'buffet',
  WEDDING_DRESS: 'vestido-noiva',
  BEAUTY_MAKEUP: 'outro',
  PARTY_VENUE: 'espaco',
  TRANSPORT: 'outro',
  ACCOMMODATION: 'outro',
  OTHER: 'outro',
};

// ---------------------------------------------------------------------------
// DB listing status -> local status for the StatusBadge component
// ---------------------------------------------------------------------------
function mapDbStatus(dbStatus: string): string {
  const map: Record<string, string> = {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    ACTIVE: 'active',
    RESERVED: 'active',
    SOLD: 'sold',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
    SUSPENDED: 'cancelled',
    PAUSED: 'draft',
  };
  return map[dbStatus] || dbStatus.toLowerCase();
}

type TabFilter = 'all' | 'active' | 'draft' | 'sold' | 'expired';

interface DisplayListing {
  id: number;
  title: string;
  category: string;
  status: string;
  price: number;
  views: number;
  createdAt: string;
  imageUrl: string | null;
}

const tabs: { id: TabFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'draft', label: 'Rascunhos' },
  { id: 'sold', label: 'Vendidos' },
  { id: 'expired', label: 'Expirados' },
];

function mapListingToDisplay(listing: Listing): DisplayListing {
  return {
    id: listing.id,
    title: listing.title,
    category: DB_TO_UI_CATEGORY[listing.category] || 'outro',
    status: mapDbStatus(listing.status),
    price: listing.asking_price,
    views: listing.view_count ?? 0,
    createdAt: listing.created_at,
    imageUrl: listing.images && listing.images.length > 0 ? listing.images[0] : null,
  };
}

export default function MyListingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [listings, setListings] = useState<DisplayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [offerCounts, setOfferCounts] = useState<Record<number, number>>({});
  const [expandedOffers, setExpandedOffers] = useState<number | null>(null);
  const [sponsorDialog, setSponsorDialog] = useState<{ open: boolean; listingId: number; listingTitle: string }>({
    open: false,
    listingId: 0,
    listingTitle: '',
  });

  // Fetch listings + offer counts in parallel
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      listingsService.getMyListings(user.id).catch((err) => {
        console.error('[my-listings] Erro ao buscar anuncios:', err);
        return [] as Listing[];
      }),
      offersService.getOffers({ role: 'seller', per_page: 50 }).catch(() => ({
        data: [] as Offer[],
        pagination: { page: 1, per_page: 50, total: 0, total_pages: 0, has_next: false, has_prev: false },
      })),
    ]).then(([listingsData, offersResponse]) => {
      setListings(listingsData.map(mapListingToDisplay));

      const counts: Record<number, number> = {};
      offersResponse.data.forEach((offer: Offer) => {
        if (offer.status === 'PENDING') {
          counts[offer.listing_id] = (counts[offer.listing_id] || 0) + 1;
        }
      });
      setOfferCounts(counts);
    }).finally(() => setLoading(false));
  }, [user, authLoading]);

  const allFiltered =
    activeTab === 'all'
      ? listings
      : listings.filter((l) => l.status === activeTab);

  const totalFilteredCount = allFiltered.length;
  const totalPages = Math.ceil(totalFilteredCount / ITEMS_PER_PAGE);
  const filteredListings = allFiltered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleTabChange = useCallback((tab: TabFilter) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getCategoryLabel = (categoryId: string) => {
    return EVENT_CATEGORIES_MAP[categoryId]?.label || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    return EVENT_CATEGORIES_MAP[categoryId]?.color || '#737373';
  };

  const handleEdit = useCallback(
    (id: number) => {
      router.push(`/sell/${id}/edit`);
    },
    [router]
  );

  const handlePause = useCallback(
    async (id: number) => {
      setActionLoading(id);
      try {
        await listingsService.update(id, { status: 'DRAFT' });
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: 'draft' } : l))
        );
      } catch {
        toast.error('Erro ao pausar anuncio.');
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const handleResume = useCallback(
    async (id: number) => {
      setActionLoading(id);
      try {
        await listingsService.update(id, { status: 'ACTIVE' });
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: 'active' } : l))
        );
      } catch {
        toast.error('Erro ao reativar anuncio.');
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = useCallback(
    async (id: number) => {
      setDeleteLoading(true);
      try {
        await listingsService.cancel(id);
        setListings((prev) => prev.filter((l) => l.id !== id));
        toast.success('Anuncio excluido.');
      } catch {
        toast.error('Erro ao excluir anuncio.');
      } finally {
        setDeleteLoading(false);
        setDeleteConfirm(null);
      }
    },
    []
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
              Meus Anuncios
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Gerencie seus anuncios de reservas
            </p>
          </div>
        </motion.div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
        </div>
      </div>
    );
  }

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
            Meus Anuncios
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gerencie seus anuncios de reservas
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/sell">
            <Plus className="h-4 w-4" />
            Criar Novo Anuncio
          </Link>
        </Button>
      </motion.div>

      {/* Tab Pills */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => {
          const count =
            tab.id === 'all'
              ? listings.length
              : listings.filter((l) => l.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum anuncio encontrado"
          description={
            activeTab === 'all'
              ? 'Voce ainda nao possui anuncios. Crie seu primeiro anuncio agora!'
              : `Nenhum anuncio com status "${tabs.find((t) => t.id === activeTab)?.label}" encontrado.`
          }
          action={
            activeTab === 'all'
              ? {
                  label: 'Criar Anuncio',
                  onClick: () => router.push('/sell'),
                }
              : undefined
          }
        />
      ) : (
        <>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredListings.map((listing) => (
            <motion.div key={listing.id} variants={staggerChild}>
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                      {listing.imageUrl ? (
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-neutral-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {listing.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0"
                          style={{
                            borderColor: getCategoryColor(listing.category),
                            color: getCategoryColor(listing.category),
                          }}
                        >
                          {getCategoryLabel(listing.category)}
                        </Badge>
                        <StatusBadge status={listing.status as 'active' | 'draft' | 'sold' | 'expired'} />
                      </div>
                    </div>

                    {/* Price & Views */}
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-[#2563EB]">
                        {formatCurrency(listing.price)}
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.views} visualizacoes
                      </span>
                    </div>

                    {/* Date */}
                    <div className="hidden md:block text-right shrink-0">
                      <span className="text-xs text-neutral-400">
                        {new Date(listing.createdAt + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 shrink-0"
                          disabled={actionLoading === listing.id}
                        >
                          {actionLoading === listing.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(listing.id)}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {listing.status === 'active' && (
                          <DropdownMenuItem
                            onClick={() =>
                              setSponsorDialog({
                                open: true,
                                listingId: listing.id,
                                listingTitle: listing.title,
                              })
                            }
                            className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-950/20"
                          >
                            <Star className="h-4 w-4 fill-amber-500" />
                            Promover
                          </DropdownMenuItem>
                        )}
                        {listing.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handlePause(listing.id)}>
                            <Pause className="h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        ) : listing.status === 'draft' ? (
                          <DropdownMenuItem onClick={() => handleResume(listing.id)}>
                            <Play className="h-4 w-4" />
                            Reativar
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm({ id: listing.id, title: listing.title })}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile price row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 sm:hidden">
                    <span className="text-sm font-bold text-[#2563EB]">
                      {formatCurrency(listing.price)}
                    </span>
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.views} views
                    </span>
                  </div>

                  {/* Offers section */}
                  {listing.status === 'active' && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() =>
                          setExpandedOffers(
                            expandedOffers === listing.id ? null : listing.id
                          )
                        }
                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
                      >
                        <HandCoins className="h-4 w-4" />
                        <span>Ofertas</span>
                        {(offerCounts[listing.id] || 0) > 0 && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 text-[10px] px-1.5 py-0">
                            {offerCounts[listing.id]} pendente{offerCounts[listing.id] > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </button>

                      {expandedOffers === listing.id && (
                        <div className="mt-3">
                          <OffersList
                            listingId={listing.id}
                            role="seller"
                            currentUserId={user?.id}
                            onOfferAccepted={() => {
                              // Refresh offer counts
                              offersService
                                .getOffers({ role: 'seller', per_page: 50 })
                                .then((response) => {
                                  const counts: Record<number, number> = {};
                                  response.data.forEach((offer: Offer) => {
                                    if (offer.status === 'PENDING') {
                                      counts[offer.listing_id] =
                                        (counts[offer.listing_id] || 0) + 1;
                                    }
                                  });
                                  setOfferCounts(counts);
                                })
                                .catch(() => {});
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalFilteredCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
        </>
      )}

      {/* Sponsor Dialog */}
      <SponsorDialog
        open={sponsorDialog.open}
        onOpenChange={(open) => setSponsorDialog((prev) => ({ ...prev, open }))}
        listingId={sponsorDialog.listingId}
        listingTitle={sponsorDialog.listingTitle}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title="Excluir anuncio"
        description={`Tem certeza que deseja excluir "${deleteConfirm?.title}"? Esta acao nao pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        variant="destructive"
        loading={deleteLoading}
      />
    </div>
  );
}
