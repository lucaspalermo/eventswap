'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Loader2 } from 'lucide-react';
import { SearchBar } from '@/components/marketplace/search-bar';
import { CategoryPills } from '@/components/marketplace/category-pills';
import { EventFilters, type FilterValues } from '@/components/marketplace/event-filters';
import { EventGrid } from '@/components/marketplace/event-grid';
import type { EventCardProps } from '@/components/marketplace/event-card';
import { listingsService, type SearchListingsParams } from '@/services/listings.service';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { RecommendationSection } from '@/components/shared/recommendation-section';
import type { EventCategory, Listing } from '@/types/database.types';

const ITEMS_PER_PAGE = 12;

// ---------------------------------------------------------------------------
// Category mapping: UI id -> Database EventCategory enum
// ---------------------------------------------------------------------------
const UI_TO_DB_CATEGORY: Record<string, EventCategory> = {
  casamento: 'WEDDING_VENUE',
  buffet: 'BUFFET',
  espaco: 'PARTY_VENUE',
  fotografia: 'PHOTOGRAPHER',
  musica: 'DJ_BAND',
  decoracao: 'DECORATION',
  video: 'VIDEOGRAPHER',
  convite: 'OTHER',
  'vestido-noiva': 'WEDDING_DRESS',
  'festa-infantil': 'PARTY_VENUE',
  corporativo: 'OTHER',
  outro: 'OTHER',
};

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
// Sort mapping: UI sort id -> service sortBy param
// ---------------------------------------------------------------------------
const SORT_MAP: Record<string, SearchListingsParams['sortBy']> = {
  newest: 'newest',
  oldest: 'newest', // fallback - service only supports these
  price_asc: 'price_asc',
  price_desc: 'price_desc',
  event_date_asc: 'date_asc',
  event_date_desc: 'date_desc',
  discount_desc: 'price_asc', // fallback
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

const defaultFilters: FilterValues = {
  category: null,
  priceMin: '',
  priceMax: '',
  city: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'newest',
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [listings, setListings] = useState<EventCardProps[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recommendedListings, setRecommendedListings] = useState<Listing[]>([]);
  const fetchIdRef = useRef(0);

  // Build search params from current state
  const searchParams = useMemo((): SearchListingsParams => {
    const params: SearchListingsParams = {
      page,
      limit: ITEMS_PER_PAGE,
    };
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory && UI_TO_DB_CATEGORY[selectedCategory]) {
      params.category = UI_TO_DB_CATEGORY[selectedCategory];
    }
    if (filters.city) params.city = filters.city;
    if (filters.priceMin) params.minPrice = Number(filters.priceMin);
    if (filters.priceMax) params.maxPrice = Number(filters.priceMax);
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.sortBy && SORT_MAP[filters.sortBy]) {
      params.sortBy = SORT_MAP[filters.sortBy];
    }
    return params;
  }, [searchQuery, selectedCategory, filters, page]);

  // Fetch listings from Supabase whenever params change
  useEffect(() => {
    const currentFetchId = ++fetchIdRef.current;
    setLoading(true);

    listingsService
      .search(searchParams)
      .then((result) => {
        // Ignore stale responses
        if (currentFetchId !== fetchIdRef.current) return;

        const mapped: EventCardProps[] = result.data.map((listing) => ({
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          category: DB_TO_UI_CATEGORY[listing.category] || 'outro',
          venueName: listing.venue_name,
          venueCity: listing.venue_city,
          venueState: listing.venue_state ?? null,
          eventDate: listing.event_date,
          originalPrice: listing.original_price,
          askingPrice: listing.asking_price,
          sellerName: listing.seller?.name || 'Vendedor',
          sellerAvatar: listing.seller?.avatar_url ?? null,
          sellerRating: listing.seller?.rating_avg ?? 0,
          images: listing.images ?? [],
          isSponsored: !!(listing as unknown as { is_sponsored?: boolean }).is_sponsored,
        }));
        setListings(mapped);
        setTotalCount(result.total);
        setTotalPages(result.totalPages);
        setIsLive(true);
      })
      .catch(() => {
        if (currentFetchId !== fetchIdRef.current) return;
        setListings([]);
        setTotalCount(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      });
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setFilters((prev) => ({ ...prev, category: categoryId }));
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setSelectedCategory(newFilters.category);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch recommended listings (most discounted)
  useEffect(() => {
    listingsService
      .search({ limit: 8, sortBy: 'price_asc' })
      .then((result) => {
        setRecommendedListings(result.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10">
                <Store className="h-5 w-5 text-[#2563EB]" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Marketplace
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Encontre as melhores ofertas em reservas de eventos. Casamentos, buffets,
              espacos, fotografia e muito mais com precos imperdveis.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 max-w-2xl"
          >
            <SearchBar
              value={searchQuery}
              onSearch={handleSearch}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-6"
        >
          <CategoryPills
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <EventFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 text-[#2563EB] animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            )}
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {loading ? (
                'Buscando anuncios...'
              ) : (
                <>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {totalCount}
                  </span>{' '}
                  {totalCount === 1 ? 'anuncio encontrado' : 'anuncios encontrados'}
                </>
              )}
            </p>
          </div>
        </motion.div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-zinc-200 dark:bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <EventGrid events={listings} />

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

        {/* Recommendations Section */}
        {recommendedListings.length > 0 && (
          <div className="mt-10">
            <RecommendationSection
              title="Melhores ofertas para voce"
              listings={recommendedListings}
              href="/marketplace?sortBy=price_asc"
            />
          </div>
        )}

        {/* SEO Content - always visible for search engines */}
        <section className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Marketplace de Transferência de Reservas de Eventos
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
              O EventSwap é o marketplace #1 do Brasil para compra e venda de reservas de eventos.
              Se você desistiu do casamento, buffet, salão de festa ou qualquer outro evento,
              não perca dinheiro com multas de cancelamento. Transfira sua reserva para outra pessoa
              com total segurança através do nosso sistema de escrow (pagamento protegido).
            </p>

            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Categorias de Reservas Disponíveis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
              {[
                { label: 'Casamento', href: '/categorias/casamento' },
                { label: 'Buffet', href: '/categorias/buffet' },
                { label: 'Salão de Festa', href: '/categorias/salao-de-festa' },
                { label: 'Fotografia', href: '/categorias/fotografia' },
                { label: 'Música / DJ', href: '/categorias/musica' },
                { label: 'Decoração', href: '/categorias/decoracao' },
                { label: 'Videografia', href: '/categorias/videografia' },
                { label: 'Vestido de Noiva', href: '/categorias/vestido-de-noiva' },
              ].map((cat) => (
                <a
                  key={cat.href}
                  href={cat.href}
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  {cat.label}
                </a>
              ))}
            </div>

            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Como Funciona a Transferência?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">1. Anuncie</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Crie um anúncio com detalhes da sua reserva de casamento, buffet ou evento.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">2. Negocie</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Receba ofertas de compradores interessados pelo chat seguro da plataforma.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">3. Transfira</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Pagamento protegido por escrow até a confirmação da transferência pelo fornecedor.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Evite multas de cancelamento de até 50% do valor do contrato. Compradores encontram
              reservas de eventos com descontos de até 70%. Segurança garantida com verificação
              de identidade (KYC) e sistema de escrow.
              <a href="/como-funciona" className="text-[#2563EB] hover:underline ml-1">
                Saiba como funciona →
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

