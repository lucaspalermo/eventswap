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
import type { EventCategory } from '@/types/database.types';

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
// Mock data as fallback
// ---------------------------------------------------------------------------
const mockEvents: EventCardProps[] = [
  {
    id: 1,
    title: 'Buffet Premium para 200 pessoas - Villa Bianca',
    slug: 'buffet-premium-villa-bianca',
    category: 'buffet',
    venueName: 'Villa Bianca',
    venueCity: 'Sao Paulo',
    venueState: 'SP',
    eventDate: '2026-06-15',
    originalPrice: 45000,
    askingPrice: 32000,
    sellerName: 'Maria Silva',
    sellerAvatar: null,
    sellerRating: 4.8,
    images: [],
  },
  {
    id: 2,
    title: 'Espaco para Casamento - Fazenda Santa Clara',
    slug: 'espaco-casamento-fazenda-santa-clara',
    category: 'espaco',
    venueName: 'Fazenda Santa Clara',
    venueCity: 'Campinas',
    venueState: 'SP',
    eventDate: '2026-08-20',
    originalPrice: 28000,
    askingPrice: 19500,
    sellerName: 'Carlos Mendes',
    sellerAvatar: null,
    sellerRating: 4.9,
    images: [],
  },
  {
    id: 3,
    title: 'Fotografo Profissional - Cobertura Completa Casamento',
    slug: 'fotografo-profissional-cobertura-casamento',
    category: 'fotografia',
    venueName: 'Studio Luz',
    venueCity: 'Rio de Janeiro',
    venueState: 'RJ',
    eventDate: '2026-07-10',
    originalPrice: 12000,
    askingPrice: 8500,
    sellerName: 'Ana Beatriz',
    sellerAvatar: null,
    sellerRating: 5.0,
    images: [],
  },
  {
    id: 4,
    title: 'DJ e Iluminacao para Festa de 15 Anos',
    slug: 'dj-iluminacao-festa-15-anos',
    category: 'musica',
    venueName: 'Espaco Nobre',
    venueCity: 'Belo Horizonte',
    venueState: 'MG',
    eventDate: '2026-09-05',
    originalPrice: 8000,
    askingPrice: 5500,
    sellerName: 'Ricardo Santos',
    sellerAvatar: null,
    sellerRating: 4.7,
    images: [],
  },
  {
    id: 5,
    title: 'Decoracao Completa para Casamento - Tema Rustico',
    slug: 'decoracao-completa-casamento-rustico',
    category: 'decoracao',
    venueName: 'Atelier Flores',
    venueCity: 'Curitiba',
    venueState: 'PR',
    eventDate: '2026-05-22',
    originalPrice: 18000,
    askingPrice: 13000,
    sellerName: 'Juliana Costa',
    sellerAvatar: null,
    sellerRating: 4.6,
    images: [],
  },
  {
    id: 6,
    title: 'Vestido de Noiva Pronovias - Tamanho 38',
    slug: 'vestido-noiva-pronovias-38',
    category: 'vestido-noiva',
    venueName: 'Atelier Noivas',
    venueCity: 'Sao Paulo',
    venueState: 'SP',
    eventDate: '2026-10-12',
    originalPrice: 22000,
    askingPrice: 14000,
    sellerName: 'Patricia Oliveira',
    sellerAvatar: null,
    sellerRating: 4.9,
    images: [],
  },
  {
    id: 7,
    title: 'Festa Infantil Completa - Tema Princesas Disney',
    slug: 'festa-infantil-princesas-disney',
    category: 'festa-infantil',
    venueName: 'Buffet Encanto',
    venueCity: 'Salvador',
    venueState: 'BA',
    eventDate: '2026-04-18',
    originalPrice: 15000,
    askingPrice: 10500,
    sellerName: 'Fernanda Lima',
    sellerAvatar: null,
    sellerRating: 4.5,
    images: [],
  },
  {
    id: 8,
    title: 'Evento Corporativo - Auditorio 500 Pessoas',
    slug: 'evento-corporativo-auditorio-500',
    category: 'corporativo',
    venueName: 'Centro de Convencoes',
    venueCity: 'Brasilia',
    venueState: 'DF',
    eventDate: '2026-11-08',
    originalPrice: 55000,
    askingPrice: 42000,
    sellerName: 'Roberto Almeida',
    sellerAvatar: null,
    sellerRating: 4.8,
    images: [],
  },
];

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
  const [listings, setListings] = useState<EventCardProps[]>(mockEvents);
  const [totalCount, setTotalCount] = useState(mockEvents.length);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
        // On failure, keep mock data as fallback (only reset if was never live)
        if (currentFetchId !== fetchIdRef.current) return;
        if (!isLive) {
          // Apply client-side filters to mock data
          const filtered = applyMockFilters(mockEvents, searchQuery, selectedCategory, filters);
          const mockTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
          const paginatedFiltered = filtered.slice(
            (page - 1) * ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE
          );
          setListings(paginatedFiltered);
          setTotalCount(filtered.length);
          setTotalPages(mockTotalPages);
        }
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C3CE1]/10">
                <Store className="h-5 w-5 text-[#6C3CE1]" />
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
              <Loader2 className="h-4 w-4 text-[#6C3CE1] animate-spin" />
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
          {!isLive && !loading && (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
              Modo demo
            </span>
          )}
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
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Client-side filter for mock data fallback
// ---------------------------------------------------------------------------
function applyMockFilters(
  events: EventCardProps[],
  searchQuery: string,
  selectedCategory: string | null,
  filters: FilterValues
): EventCardProps[] {
  let filtered = events.filter((event) => {
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.venueCity.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.venueName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedCategory && event.category !== selectedCategory) return false;
    if (filters.priceMin && event.askingPrice < Number(filters.priceMin)) return false;
    if (filters.priceMax && event.askingPrice > Number(filters.priceMax)) return false;
    if (filters.city && !event.venueCity.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.dateFrom && event.eventDate < filters.dateFrom) return false;
    if (filters.dateTo && event.eventDate > filters.dateTo) return false;
    return true;
  });

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_asc': return a.askingPrice - b.askingPrice;
      case 'price_desc': return b.askingPrice - a.askingPrice;
      case 'event_date_asc': return a.eventDate.localeCompare(b.eventDate);
      case 'event_date_desc': return b.eventDate.localeCompare(a.eventDate);
      case 'oldest': return a.id - b.id;
      case 'newest':
      default: return b.id - a.id;
    }
  });

  return filtered;
}
