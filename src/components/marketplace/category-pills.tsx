'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  UtensilsCrossed,
  Building2,
  Camera,
  Music,
  Sparkles,
  Video,
  Mail,
  Shirt,
  Cake,
  Briefcase,
  CalendarDays,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_CATEGORIES } from '@/lib/constants';

interface CategoryPillsProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Heart,
  UtensilsCrossed,
  Building2,
  Camera,
  Music,
  Sparkles,
  Video,
  Mail,
  Shirt,
  Cake,
  Briefcase,
  CalendarDays,
  LayoutGrid,
};

export function CategoryPills({ selected, onSelect, className }: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const allCategories = [
    { id: null, label: 'Todos', icon: 'LayoutGrid', color: '#2563EB' },
    ...EVENT_CATEGORIES.map((cat) => ({
      id: cat.id as string | null,
      label: cat.label,
      icon: cat.icon,
      color: cat.color,
    })),
  ];

  return (
    <div className={cn('relative group', className)}>
      {/* Left Scroll Button */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'absolute -left-1 top-1/2 z-10 -translate-y-1/2',
          'hidden md:flex h-8 w-8 items-center justify-center rounded-full',
          'bg-white/90 border border-zinc-200 shadow-md backdrop-blur-sm',
          'text-zinc-600 transition-all hover:bg-white hover:shadow-lg',
          'opacity-0 group-hover:opacity-100',
          'dark:bg-zinc-900/90 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
        )}
        aria-label="Rolar para esquerda"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll('right')}
        className={cn(
          'absolute -right-1 top-1/2 z-10 -translate-y-1/2',
          'hidden md:flex h-8 w-8 items-center justify-center rounded-full',
          'bg-white/90 border border-zinc-200 shadow-md backdrop-blur-sm',
          'text-zinc-600 transition-all hover:bg-white hover:shadow-lg',
          'opacity-0 group-hover:opacity-100',
          'dark:bg-zinc-900/90 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
        )}
        aria-label="Rolar para direita"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Pills Container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allCategories.map((cat) => {
          const isActive = selected === cat.id;
          const IconComponent = iconMap[cat.icon] || CalendarDays;

          return (
            <motion.button
              key={cat.id ?? 'all'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(cat.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium',
                'border transition-all duration-200 flex-shrink-0',
                isActive
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-[#2563EB]/25'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
              )}
            >
              <IconComponent
                className="h-4 w-4"
                style={!isActive ? { color: cat.color } : undefined}
              />
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
