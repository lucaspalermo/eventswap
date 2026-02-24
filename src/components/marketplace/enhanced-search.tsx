'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  MapPin,
  Clock,
  TrendingUp,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { EVENT_CATEGORIES, BRAZILIAN_STATES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  onCityFilter: (city: string) => void;
  onCategorySelect: (category: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECENT_SEARCHES_KEY = 'eventswap:recent-searches';
const MAX_RECENT_SEARCHES = 5;

const POPULAR_SEARCHES = [
  'Buffet para casamento',
  'Espaço para festa',
  'Fotógrafo em São Paulo',
  'DJ para evento corporativo',
  'Decoração de casamento',
  'Vestido de noiva',
];

const TOP_CATEGORIES = EVENT_CATEGORIES.slice(0, 6);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const current = getRecentSearches();
    const filtered = current.filter(
      (s) => s.toLowerCase() !== query.trim().toLowerCase()
    );
    const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be full or blocked
  }
}

function removeRecentSearch(query: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentSearches();
    const updated = current.filter(
      (s) => s.toLowerCase() !== query.toLowerCase()
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EnhancedSearch({
  onSearch,
  onCityFilter,
  onCategorySelect,
  className,
}: EnhancedSearchProps) {
  // -- State ----------------------------------------------------------------
  const [query, setQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // -- Refs -----------------------------------------------------------------
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // -- Load recent searches on mount ----------------------------------------
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // -- Debounced search callback --------------------------------------------
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // -- Filtered suggestions based on query ----------------------------------
  const filteredSuggestions = useMemo(() => {
    if (query.length === 0) return [];
    return POPULAR_SEARCHES.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // -- Filtered cities/states based on cityQuery ----------------------------
  const filteredCities = useMemo(() => {
    if (cityQuery.length === 0) return BRAZILIAN_STATES.slice(0, 8);
    const lower = cityQuery.toLowerCase();
    return BRAZILIAN_STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(lower) ||
        state.uf.toLowerCase().includes(lower)
    );
  }, [cityQuery]);

  // -- Build the flat list of selectable items for keyboard navigation ------
  const selectableItems = useMemo(() => {
    const items: { type: 'suggestion' | 'recent' | 'popular'; value: string }[] =
      [];

    if (query.length > 0) {
      filteredSuggestions.forEach((s) =>
        items.push({ type: 'suggestion', value: s })
      );
    } else {
      // recent searches first, then popular
      recentSearches.forEach((s) => items.push({ type: 'recent', value: s }));
      POPULAR_SEARCHES.forEach((s) =>
        items.push({ type: 'popular', value: s })
      );
    }

    return items;
  }, [query, filteredSuggestions, recentSearches]);

  // -- Reset highlight when items change ------------------------------------
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [selectableItems]);

  // -- Handlers -------------------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    debouncedSearch(newValue);
    setShowDropdown(true);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleCityClear = () => {
    setCityQuery('');
    onCityFilter('');
    cityInputRef.current?.focus();
  };

  const selectSuggestion = (value: string) => {
    setQuery(value);
    onSearch(value);
    saveRecentSearch(value);
    setRecentSearches(getRecentSearches());
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const selectCity = (name: string) => {
    setCityQuery(name);
    onCityFilter(name);
    setShowCityDropdown(false);
    cityInputRef.current?.blur();
  };

  const handleRemoveRecent = (
    e: React.MouseEvent,
    searchToRemove: string
  ) => {
    e.stopPropagation();
    const updated = removeRecentSearch(searchToRemove);
    setRecentSearches(updated);
  };

  const handleSaveSearchAlert = () => {
    if (!query.trim()) return;
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    // In a real implementation this would trigger a backend API call to create
    // a saved search alert. For now we persist it in recent searches.
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Delay to allow click events on dropdown items to fire first
    setTimeout(() => {
      setIsFocused(false);
      setShowDropdown(false);
    }, 200);
  };

  const handleCityFocus = () => {
    setIsCityFocused(true);
    setShowCityDropdown(true);
  };

  const handleCityBlur = () => {
    setTimeout(() => {
      setIsCityFocused(false);
      setShowCityDropdown(false);
    }, 200);
  };

  // -- Keyboard navigation --------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < selectableItems.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : selectableItems.length - 1
        );
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < selectableItems.length
        ) {
          selectSuggestion(selectableItems[highlightedIndex].value);
        } else if (query.trim()) {
          // Submit what the user typed
          onSearch(query.trim());
          saveRecentSearch(query.trim());
          setRecentSearches(getRecentSearches());
          setShowDropdown(false);
          inputRef.current?.blur();
        }
        break;
      }
      case 'Escape': {
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
      }
    }
  };

  // -- Close on outside click -----------------------------------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setShowCityDropdown(false);
        setIsFocused(false);
        setIsCityFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // -- Determine if any dropdown content should be shown --------------------
  const hasDropdownContent =
    query.length > 0
      ? filteredSuggestions.length > 0
      : recentSearches.length > 0 || POPULAR_SEARCHES.length > 0;

  // -- Render ---------------------------------------------------------------
  return (
    <>
      {/* Mobile full-screen overlay backdrop */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => {
              setIsFocused(false);
              setShowDropdown(false);
              inputRef.current?.blur();
            }}
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className={cn(
          'relative w-full',
          // Mobile: when focused, go full-screen overlay mode
          isFocused &&
            'fixed inset-x-0 top-0 z-50 px-4 pt-4 pb-0 md:relative md:inset-auto md:z-auto md:p-0',
          className
        )}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Main Search Input                                                 */}
        {/* ---------------------------------------------------------------- */}
        <div
          className={cn(
            'relative flex items-center rounded-xl border bg-white transition-all duration-200',
            'dark:bg-zinc-900 dark:border-zinc-700',
            isFocused
              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-lg shadow-[#2563EB]/5'
              : 'border-zinc-200 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600'
          )}
        >
          <div className="pointer-events-none flex items-center pl-4">
            <Search
              className={cn(
                'h-5 w-5 transition-colors duration-200',
                isFocused ? 'text-[#2563EB]' : 'text-zinc-400'
              )}
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Buscar reservas de eventos..."
            autoComplete="off"
            className={cn(
              'h-12 w-full bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400',
              'focus:outline-none',
              'dark:text-zinc-100 dark:placeholder:text-zinc-500'
            )}
          />

          {/* Save search alert button */}
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleSaveSearchAlert}
                title="Salvar busca"
                className={cn(
                  'mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                  'text-zinc-400 transition-colors',
                  'hover:bg-[#2563EB]/10 hover:text-[#2563EB]',
                  'dark:text-zinc-500 dark:hover:bg-[#2563EB]/20 dark:hover:text-[#60A5FA]'
                )}
                aria-label="Salvar busca"
              >
                <Bell className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Clear button */}
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className={cn(
                  'mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
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
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Secondary City Input - appears when main input is focused         */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  'relative flex items-center rounded-xl border bg-white transition-all duration-200',
                  'dark:bg-zinc-900 dark:border-zinc-700',
                  isCityFocused
                    ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-lg shadow-[#2563EB]/5'
                    : 'border-zinc-200 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600'
                )}
              >
                <div className="pointer-events-none flex items-center pl-4">
                  <MapPin
                    className={cn(
                      'h-4 w-4 transition-colors duration-200',
                      isCityFocused ? 'text-[#2563EB]' : 'text-zinc-400'
                    )}
                  />
                </div>
                <input
                  ref={cityInputRef}
                  type="text"
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={handleCityFocus}
                  onBlur={handleCityBlur}
                  placeholder="Buscar por cidade ou estado..."
                  autoComplete="off"
                  className={cn(
                    'h-10 w-full bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400',
                    'focus:outline-none',
                    'dark:text-zinc-100 dark:placeholder:text-zinc-500'
                  )}
                />
                <AnimatePresence>
                  {cityQuery.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={handleCityClear}
                      className={cn(
                        'mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                        'bg-zinc-100 text-zinc-500 transition-colors',
                        'hover:bg-zinc-200 hover:text-zinc-700',
                        'dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
                      )}
                      aria-label="Limpar cidade"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* City autocomplete dropdown */}
              <AnimatePresence>
                {showCityDropdown && filteredCities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl',
                      'dark:border-zinc-700 dark:bg-zinc-900'
                    )}
                  >
                    <div className="px-3 py-2">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {cityQuery.length > 0 ? 'Resultados' : 'Estados Populares'}
                      </span>
                    </div>
                    {filteredCities.map((state) => (
                      <button
                        key={state.uf}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCity(state.name)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors',
                          'hover:bg-[#2563EB]/5 hover:text-[#2563EB]',
                          'dark:text-zinc-300 dark:hover:bg-[#2563EB]/10 dark:hover:text-[#60A5FA]'
                        )}
                      >
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                        <span className="flex-1">{state.name}</span>
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                          {state.uf}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------- */}
        {/* Category Quick Pills                                              */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {TOP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onCategorySelect(category.id);
                    setShowDropdown(false);
                    inputRef.current?.blur();
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    'border-zinc-200 bg-white text-zinc-600',
                    'hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 hover:text-[#2563EB]',
                    'dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
                    'dark:hover:border-[#2563EB]/40 dark:hover:bg-[#2563EB]/10 dark:hover:text-[#60A5FA]'
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------- */}
        {/* Main Dropdown (Suggestions / Recent / Popular)                     */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {showDropdown && hasDropdownContent && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl',
                'dark:border-zinc-700 dark:bg-zinc-900',
                // On mobile, when focused, offset from the fixed container
                isFocused && 'md:mt-2'
              )}
            >
              {/* ----- When query is non-empty: filtered suggestions ----- */}
              {query.length > 0 && filteredSuggestions.length > 0 && (
                <div>
                  <div className="px-3 py-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Sugestoes
                    </span>
                  </div>
                  {filteredSuggestions.map((suggestion, idx) => {
                    const itemIndex = idx;
                    return (
                      <button
                        key={suggestion}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(suggestion)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors',
                          'hover:bg-[#2563EB]/5 hover:text-[#2563EB]',
                          'dark:text-zinc-300 dark:hover:bg-[#2563EB]/10 dark:hover:text-[#60A5FA]',
                          highlightedIndex === itemIndex &&
                            'bg-[#2563EB]/5 text-[#2563EB] dark:bg-[#2563EB]/10 dark:text-[#60A5FA]'
                        )}
                      >
                        <Search className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                        <span className="flex-1">{suggestion}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ----- When query is empty: recent searches + popular ---- */}
              {query.length === 0 && (
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Buscas Recentes
                        </span>
                      </div>
                      {recentSearches.map((recent, idx) => {
                        const itemIndex = idx;
                        return (
                          <button
                            key={`recent-${recent}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectSuggestion(recent)}
                            className={cn(
                              'group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors',
                              'hover:bg-[#2563EB]/5 hover:text-[#2563EB]',
                              'dark:text-zinc-300 dark:hover:bg-[#2563EB]/10 dark:hover:text-[#60A5FA]',
                              highlightedIndex === itemIndex &&
                                'bg-[#2563EB]/5 text-[#2563EB] dark:bg-[#2563EB]/10 dark:text-[#60A5FA]'
                            )}
                          >
                            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                            <span className="flex-1">{recent}</span>
                            <button
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => handleRemoveRecent(e, recent)}
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity',
                                'group-hover:opacity-100',
                                'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                              )}
                              aria-label={`Remover "${recent}" das buscas recentes`}
                            >
                              <X className="h-3 w-3 text-zinc-400" />
                            </button>
                          </button>
                        );
                      })}
                      <div className="mx-3 border-b border-zinc-100 dark:border-zinc-800" />
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <div className="px-3 py-2">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Buscas Populares
                      </span>
                    </div>
                    {POPULAR_SEARCHES.map((popular, idx) => {
                      const itemIndex = recentSearches.length + idx;
                      return (
                        <button
                          key={`popular-${popular}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSuggestion(popular)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors',
                            'hover:bg-[#2563EB]/5 hover:text-[#2563EB]',
                            'dark:text-zinc-300 dark:hover:bg-[#2563EB]/10 dark:hover:text-[#60A5FA]',
                            highlightedIndex === itemIndex &&
                              'bg-[#2563EB]/5 text-[#2563EB] dark:bg-[#2563EB]/10 dark:text-[#60A5FA]'
                          )}
                        >
                          <TrendingUp className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                          <span className="flex-1">{popular}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
