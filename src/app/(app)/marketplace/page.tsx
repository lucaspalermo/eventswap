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

