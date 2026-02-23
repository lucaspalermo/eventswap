'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  MapPin,
  Calendar,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_CATEGORIES, SORT_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterValues {
  category: string | null;
  priceMin: string;
  priceMax: string;
  city: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
}

interface EventFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
}

const defaultFilters: FilterValues = {
  category: null,
  priceMin: '',
  priceMax: '',
  city: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'newest',
};

export function EventFilters({
  filters,
  onFilterChange,
  className,
}: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    filters.category,
    filters.priceMin,
    filters.priceMax,
    filters.city,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy !== 'newest' ? filters.sortBy : null,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({ ...defaultFilters });
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Toggle */}
      <div className="flex items-center gap-3 md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-zinc-500 hover:text-zinc-700"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Desktop: Always Visible / Mobile: Collapsible */}
      <AnimatePresence>
        {(isOpen || typeof window === 'undefined') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden md:hidden"
          >
            <FilterContent
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Always Visible */}
      <div className="hidden md:block">
        <FilterContent
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </div>
  );
}

interface FilterContentProps {
  filters: FilterValues;
  updateFilter: <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  onClose?: () => void;
}

function FilterContent({
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount,
  onClose,
}: FilterContentProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 bg-white p-4 shadow-sm',
        'dark:border-zinc-800 dark:bg-zinc-900'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#6C3CE1]" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Filtros
          </h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {activeFilterCount} ativo{activeFilterCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#6C3CE1] hover:text-[#5B32C1] font-medium transition-colors"
            >
              Limpar filtros
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Categoria, Preco, Cidade */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <ChevronDown className="h-3 w-3" />
            Categoria
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              updateFilter('category', e.target.value || null)
            }
            className={cn(
              'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900',
              'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
              'transition-all duration-200'
            )}
          >
            <option value="">Todas as categorias</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <DollarSign className="h-3 w-3" />
            Faixa de preco
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => updateFilter('priceMin', e.target.value)}
              placeholder="Min"
              className={cn(
                'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900',
                'placeholder:text-zinc-400',
                'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
                'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
                'transition-all duration-200'
              )}
            />
            <span className="text-zinc-400 text-xs">-</span>
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => updateFilter('priceMax', e.target.value)}
              placeholder="Max"
              className={cn(
                'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900',
                'placeholder:text-zinc-400',
                'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
                'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
                'transition-all duration-200'
              )}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <MapPin className="h-3 w-3" />
            Cidade
          </label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
            placeholder="Ex: Sao Paulo"
            className={cn(
              'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900',
              'placeholder:text-zinc-400',
              'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
              'transition-all duration-200'
            )}
          />
        </div>
      </div>

      {/* Row 2: Data De, Data Ate, Ordenar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {/* Date From */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-3 w-3" />
            Data do evento (de)
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className={cn(
              'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900',
              'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-3 w-3" />
            Data do evento (ate)
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className={cn(
              'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900',
              'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <ArrowUpDown className="h-3 w-3" />
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className={cn(
              'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900',
              'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/50 focus:border-[#6C3CE1]',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
              'transition-all duration-200'
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
