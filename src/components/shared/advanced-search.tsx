'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  ArrowRight,
  MapPin,
  Tag,
  Heart,
  UtensilsCrossed,
  Camera,
  Music,
  Video,
  Shirt,
} from 'lucide-react';
import { PartyPopper, Palette } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Custom useDebounce hook
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { id: 'WEDDING_VENUE', label: 'Casamento', icon: 'Heart' },
  { id: 'BUFFET', label: 'Buffet', icon: 'UtensilsCrossed' },
  { id: 'PARTY_VENUE', label: 'Espaco para Festas', icon: 'PartyPopper' },
  { id: 'PHOTOGRAPHER', label: 'Fotografia', icon: 'Camera' },
  { id: 'DJ_BAND', label: 'DJ / Banda', icon: 'Music' },
  { id: 'DECORATION', label: 'Decoracao', icon: 'Palette' },
  { id: 'VIDEOGRAPHER', label: 'Filmagem', icon: 'Video' },
  { id: 'WEDDING_DRESS', label: 'Vestido de Noiva', icon: 'Shirt' },
] as const;

const POPULAR_CITIES = [
  'Sao Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Brasilia',
  'Salvador',
] as const;

const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  UtensilsCrossed,
  PartyPopper,
  Camera,
  Music,
  Palette,
  Video,
  Shirt,
};

/** Mock results for demo / static autocomplete. Replace with API call if needed. */
const MOCK_RESULTS = [
  {
    id: 1,
    title: 'Buffet Premium - Casamento 150 pessoas',
    price: 8500,
    originalPrice: 12000,
  },
  {
    id: 2,
    title: 'Espaco para Festa - Chacara Bela Vista',
    price: 3200,
    originalPrice: 4800,
  },
  {
    id: 3,
    title: 'Fotografo Profissional - Pacote Completo',
    price: 2800,
    originalPrice: 3500,
  },
  {
    id: 4,
    title: 'DJ para Casamento - 6h de Festa',
    price: 1500,
    originalPrice: 2200,
  },
  {
    id: 5,
    title: 'Decoracao Rustica - Casamento ao Ar Livre',
    price: 4200,
    originalPrice: 6000,
  },
] as const;

const RECENT_SEARCHES_KEY = 'eventswap-recent-searches';
const MAX_RECENT_SEARCHES = 5;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdvancedSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

interface FlatItem {
  type: 'recent' | 'category' | 'city' | 'result';
  label: string;
  id?: string | number;
  price?: number;
  originalPrice?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const searches = getRecentSearches().filter(
      (s) => s.toLowerCase() !== query.toLowerCase()
    );
    searches.unshift(query.trim());
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {
    // localStorage may be unavailable
  }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // noop
  }
}

function discountPercent(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdvancedSearch({
  className,
  placeholder = 'Buscar eventos, categorias, cidades...',
  autoFocus = false,
}: AdvancedSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // ---------------------------------------------------------------------------
  // Filtered data based on debounced query
  // ---------------------------------------------------------------------------

  const normalizedQuery = debouncedQuery.toLowerCase().trim();

  const filteredCategories = useMemo(
    () =>
      normalizedQuery.length > 0
        ? CATEGORIES.filter((c) =>
            c.label.toLowerCase().includes(normalizedQuery)
          )
        : [],
    [normalizedQuery]
  );

  const filteredCities = useMemo(
    () =>
      normalizedQuery.length > 0
        ? POPULAR_CITIES.filter((city) =>
            city.toLowerCase().includes(normalizedQuery)
          )
        : POPULAR_CITIES.slice(0, 4).map(String),
    [normalizedQuery]
  );

  const filteredResults = useMemo(
    () =>
      normalizedQuery.length > 0
        ? MOCK_RESULTS.filter((r) =>
            r.title.toLowerCase().includes(normalizedQuery)
          )
        : [],
    [normalizedQuery]
  );

  // ---------------------------------------------------------------------------
  // Build flat navigable list for keyboard nav
  // ---------------------------------------------------------------------------

  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];

    // Recent searches (only when query is empty)
    if (normalizedQuery.length === 0 && recentSearches.length > 0) {
      recentSearches.forEach((s) =>
        items.push({ type: 'recent', label: s })
      );
    }

    // Categories
    filteredCategories.forEach((c) =>
      items.push({ type: 'category', label: c.label, id: c.id })
    );

    // Cities
    filteredCities.forEach((city) =>
      items.push({ type: 'city', label: city })
    );

    // Results
    filteredResults.forEach((r) =>
      items.push({
        type: 'result',
        label: r.title,
        id: r.id,
        price: r.price,
        originalPrice: r.originalPrice,
      })
    );

    return items;
  }, [
    normalizedQuery,
    recentSearches,
    filteredCategories,
    filteredCities,
    filteredResults,
  ]);

  const hasContent = flatItems.length > 0;
  const showDropdown = isOpen && hasContent;

  // Reset active index when items change
  useEffect(() => {
    setActiveIndex(-1);
  }, [flatItems.length]);

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------

  const navigateToSearch = useCallback(
    (searchTerm: string) => {
      saveRecentSearch(searchTerm);
      setRecentSearches(getRecentSearches());
      setIsOpen(false);
      inputRef.current?.blur();
      router.push(`/marketplace?search=${encodeURIComponent(searchTerm)}`);
    },
    [router]
  );

  const navigateToCategory = useCallback(
    (categoryId: string) => {
      setIsOpen(false);
      inputRef.current?.blur();
      router.push(`/marketplace?category=${encodeURIComponent(categoryId)}`);
    },
    [router]
  );

  const navigateToCity = useCallback(
    (city: string) => {
      saveRecentSearch(city);
      setRecentSearches(getRecentSearches());
      setIsOpen(false);
      inputRef.current?.blur();
      router.push(`/marketplace?search=${encodeURIComponent(city)}`);
    },
    [router]
  );

  const handleSelectItem = useCallback(
    (item: FlatItem) => {
      switch (item.type) {
        case 'recent':
          setQuery(item.label);
          navigateToSearch(item.label);
          break;
        case 'category':
          navigateToCategory(item.id as string);
          break;
        case 'city':
          navigateToCity(item.label);
          break;
        case 'result':
          navigateToSearch(item.label);
          break;
      }
    },
    [navigateToSearch, navigateToCategory, navigateToCity]
  );

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay close so click events on dropdown can fire
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigateToSearch(query.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < flatItems.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : flatItems.length - 1
        );
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatItems.length) {
          handleSelectItem(flatItems[activeIndex]);
        } else if (query.trim()) {
          navigateToSearch(query.trim());
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      }
    }
  };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // Section renderers
  // ---------------------------------------------------------------------------

  /** Compute the global flat-index offset for each section to highlight correctly */
  let runningIndex = 0;

  const recentSection = (() => {
    if (normalizedQuery.length !== 0 || recentSearches.length === 0) return null;
    const startIndex = runningIndex;
    runningIndex += recentSearches.length;

    return (
      <div>
        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Buscas Recentes
          </span>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClearRecent}
            className="text-[11px] font-medium text-[#2563EB] hover:text-[#5A2FBE] dark:text-[#60A5FA] dark:hover:text-[#C4B5FD] transition-colors"
          >
            Limpar recentes
          </button>
        </div>
        {recentSearches.map((term, i) => {
          const flatIdx = startIndex + i;
          return (
            <button
              key={`recent-${term}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectItem({ type: 'recent', label: term })}
              onMouseEnter={() => setActiveIndex(flatIdx)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                flatIdx === activeIndex
                  ? 'bg-[#2563EB]/5 text-[#2563EB] dark:bg-[#2563EB]/10 dark:text-[#60A5FA]'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
              )}
            >
              <Clock className="h-4 w-4 flex-shrink-0 text-zinc-400 dark:text-zinc-500" />
              <span className="flex-1 truncate">{term}</span>
              <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
            </button>
          );
        })}
      </div>
    );
  })();

  const categoriesSection = (() => {
    if (filteredCategories.length === 0) return null;
    const startIndex = runningIndex;
    runningIndex += filteredCategories.length;

    return (
      <div>
        <div className="px-4 pb-1 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Categorias
          </span>
        </div>
        {filteredCategories.map((cat, i) => {
          const flatIdx = startIndex + i;
          const IconComponent = ICON_MAP[cat.icon] || Tag;
          return (
            <button
              key={cat.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                handleSelectItem({ type: 'category', label: cat.label, id: cat.id })
              }
              onMouseEnter={() => setActiveIndex(flatIdx)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                flatIdx === activeIndex
                  ? 'bg-[#2563EB]/5 text-[#2563EB] dark:bg-[#2563EB]/10 dark:text-[#60A5FA]'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 dark:bg-[#2563EB]/20">
                <IconComponent className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA]" />
              </div>
              <span className="flex-1">{cat.label}</span>
              <Tag className="h-3.5 w-3.5 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
            </button>
          );
        })}
      </div>
    );
  })();

  const citiesSection = (() => {
    if (filteredCities.length === 0) return null;
    const startIndex = runningIndex;
    runningIndex += filteredCities.length;

    return (
      <div>
        <div className="px-4 pb-1 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Cidades Populares
          </span>
        </div>
        {filteredCities.map((city, i) => {
          const flatIdx = startIndex + i;
          return (
            <button
              key={`city-${city}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectItem({ type: 'city', label: city })}
              onMouseEnter={() => setActiveIndex(flatIdx)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                flatIdx === activeIndex
                  ? 'bg-[#2563EB]/5 text-[#2563EB] dark:bg-[#2563EB]/10 dark:text-[#60A5FA]'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
              )}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 text-zinc-400 dark:text-zinc-500" />
              <span className="flex-1">{city}</span>
              <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
            </button>
          );
        })}
      </div>
    );
  })();

  const resultsSection = (() => {
    if (filteredResults.length === 0) return null;
    const startIndex = runningIndex;
    runningIndex += filteredResults.length;

    return (
      <div>
        <div className="px-4 pb-1 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Resultados
          </span>
        </div>
        {filteredResults.map((result, i) => {
          const flatIdx = startIndex + i;
          const discount = discountPercent(result.originalPrice, result.price);
          return (
            <button
              key={result.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                handleSelectItem({
                  type: 'result',
                  label: result.title,
                  id: result.id,
                  price: result.price,
                  originalPrice: result.originalPrice,
                })
              }
              onMouseEnter={() => setActiveIndex(flatIdx)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                flatIdx === activeIndex
                  ? 'bg-[#2563EB]/5 text-[#2563EB] dark:bg-[#2563EB]/10 dark:text-[#60A5FA]'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
              )}
            >
              <Search className="h-4 w-4 flex-shrink-0 text-zinc-400 dark:text-zinc-500" />
              <span className="flex-1 truncate">{result.title}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {discount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    -{discount}%
                  </span>
                )}
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(result.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  })();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'relative flex items-center rounded-2xl border bg-white transition-all duration-200',
            'dark:bg-zinc-900 dark:border-zinc-700',
            isFocused
              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-lg shadow-[#2563EB]/5'
              : 'border-zinc-200 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600'
          )}
        >
          {/* Magnifying glass icon */}
          <div className="pointer-events-none flex items-center pl-5">
            <Search
              className={cn(
                'h-5 w-5 transition-colors duration-200',
                isFocused ? 'text-[#2563EB]' : 'text-zinc-400 dark:text-zinc-500'
              )}
            />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            className={cn(
              'h-14 w-full bg-transparent px-3 text-base text-zinc-900 placeholder:text-zinc-400',
              'focus:outline-none',
              'dark:text-zinc-100 dark:placeholder:text-zinc-500',
              'sm:text-sm sm:h-12'
            )}
          />

          {/* Clear button */}
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className={cn(
                  'mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                  'bg-zinc-100 text-zinc-500 transition-colors',
                  'hover:bg-zinc-200 hover:text-zinc-700',
                  'dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
                )}
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Search button (visible on sm+) */}
          <button
            type="submit"
            className={cn(
              'mr-2 hidden h-10 items-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition-colors sm:flex',
              'bg-[#2563EB] hover:bg-[#5A2FBE]',
              'dark:bg-[#7C4DFF] dark:hover:bg-[#2563EB]'
            )}
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="listbox"
            className={cn(
              'absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl',
              'dark:border-zinc-700 dark:bg-zinc-900',
              'scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700'
            )}
          >
            {recentSection}
            {categoriesSection}
            {citiesSection}
            {resultsSection}

            {/* Bottom padding */}
            <div className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
