'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const suggestions = [
  'Buffet para casamento',
  'Espaco para festa',
  'Fotografo em Sao Paulo',
  'DJ para evento corporativo',
  'Decoracao de casamento',
  'Vestido de noiva',
];

export function SearchBar({
  value = '',
  onSearch,
  placeholder = 'Buscar reservas de eventos...',
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length === 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const filteredSuggestions = query.length === 0
    ? suggestions
    : suggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className={cn('relative w-full', className)}>
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
          placeholder={placeholder}
          className={cn(
            'h-12 w-full bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400',
            'focus:outline-none',
            'dark:text-zinc-100 dark:placeholder:text-zinc-500'
          )}
        />
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

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl',
              'dark:border-zinc-700 dark:bg-zinc-900'
            )}
          >
            <div className="px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Sugestoes
              </span>
            </div>
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors',
                  'hover:bg-[#2563EB]/5 hover:text-[#2563EB]',
                  'dark:text-zinc-300 dark:hover:bg-[#2563EB]/10 dark:hover:text-[#60A5FA]'
                )}
              >
                <Search className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
