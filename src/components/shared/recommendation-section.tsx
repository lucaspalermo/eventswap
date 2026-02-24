'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getEventCategory } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingPlaceholder } from '@/components/shared/listing-placeholder';
import type { Listing } from '@/types/database.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecommendationSectionProps {
  /** Section heading, e.g. "Baseado no que voce viu" */
  title: string;
  /** Array of listings to display */
  listings: Listing[];
  /** Optional "Ver todos" destination */
  href?: string;
  /** Show skeleton loading state */
  isLoading?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SKELETON_COUNT = 6;
const SCROLL_AMOUNT = 320;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDiscountPercent(original: number, asking: number): number {
  if (original <= 0 || asking >= original) return 0;
  return Math.round(((original - asking) / original) * 100);
}

// ---------------------------------------------------------------------------
// Scroll arrow button (desktop only)
// ---------------------------------------------------------------------------

function ScrollArrow({
  direction,
  onClick,
  visible,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  visible: boolean;
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      initial={false}
      animate={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      aria-label={direction === 'left' ? 'Rolar para esquerda' : 'Rolar para direita'}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10',
        'hidden md:flex',
        'h-9 w-9 items-center justify-center rounded-full',
        'bg-white/90 dark:bg-zinc-900/90',
        'border border-zinc-200 dark:border-zinc-700',
        'shadow-lg backdrop-blur-sm',
        'text-zinc-600 dark:text-zinc-300',
        'hover:bg-white dark:hover:bg-zinc-800',
        'hover:scale-105 active:scale-95',
        'transition-transform duration-150',
        direction === 'left' ? '-left-4' : '-right-4'
      )}
    >
      <Icon className="h-5 w-5" />
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Individual recommendation card
// ---------------------------------------------------------------------------

function RecommendationCard({ listing }: { listing: Listing }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = listing.images.length > 0;
  const discount = getDiscountPercent(listing.original_price, listing.asking_price);
  const categoryData = getEventCategory(listing.category);

  return (
    <Link
      href={`/marketplace/${listing.slug}`}
      className="group block flex-shrink-0 w-[260px] snap-start"
    >
      <div
        className={cn(
          'overflow-hidden rounded-xl border bg-white shadow-sm',
          'border-zinc-200 dark:border-zinc-800',
          'dark:bg-zinc-900',
          'transition-shadow duration-300',
          'group-hover:shadow-lg group-hover:shadow-zinc-200/50',
          'dark:group-hover:shadow-zinc-900/50 dark:group-hover:border-zinc-700'
        )}
      >
        {/* Image */}
        <div className="relative h-36 w-full overflow-hidden">
          {hasImage && !imgError ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="260px"
              onError={() => setImgError(true)}
            />
          ) : (
            <ListingPlaceholder />
          )}

          {/* Category badge */}
          <div className="absolute left-2 top-2">
            <Badge
              className="border-0 text-white text-[10px] font-medium shadow-md backdrop-blur-sm"
              style={{ backgroundColor: categoryData.color + 'dd' }}
            >
              {categoryData.label}
            </Badge>
          </div>

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute right-2 top-2">
              <Badge className="border-0 bg-red-500 text-white text-[10px] font-bold shadow-md">
                -{discount}%
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-tight mb-1.5">
            {listing.title}
          </h4>

          {/* City */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-2">
            {listing.venue_city}
            {listing.venue_state ? `, ${listing.venue_state}` : ''}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            {discount > 0 && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-through">
                {formatCurrency(listing.original_price)}
              </span>
            )}
            <span className="text-sm font-bold text-[#2563EB] dark:text-[#60A5FA]">
              {formatCurrency(listing.asking_price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card for loading state
// ---------------------------------------------------------------------------

function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[260px] snap-start">
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Skeleton className="h-36 w-full rounded-none" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scroll progress indicator
// ---------------------------------------------------------------------------

function ScrollIndicator({ progress }: { progress: number }) {
  return (
    <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-[#2563EB] dark:bg-[#60A5FA]"
        initial={false}
        animate={{ width: `${Math.max(progress * 100, 10)}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecommendationSection component
// ---------------------------------------------------------------------------

export function RecommendationSection({
  title,
  listings,
  href,
  isLoading = false,
  className,
}: RecommendationSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // -------------------------------------------------------------------------
  // Scroll state tracking
  // -------------------------------------------------------------------------

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);

    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, listings, isLoading]);

  // -------------------------------------------------------------------------
  // Scroll handlers
  // -------------------------------------------------------------------------

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  // -------------------------------------------------------------------------
  // Empty state guard
  // -------------------------------------------------------------------------

  if (!isLoading && listings.length === 0) return null;

  return (
    <section className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        {href && (
          <Link
            href={href}
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium',
              'text-[#2563EB] dark:text-[#60A5FA]',
              'hover:underline hover:underline-offset-4',
              'transition-colors duration-150'
            )}
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Scroll container with arrow buttons */}
      <div
        className="relative group/scroll"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Left arrow (desktop only, appears on hover) */}
        <ScrollArrow
          direction="left"
          onClick={() => scroll('left')}
          visible={isHovering && canScrollLeft}
        />

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className={cn(
            'flex gap-4 overflow-x-auto',
            'snap-x snap-mandatory',
            'scroll-smooth',
            'pb-2',
            // Hide scrollbar
            'scrollbar-none',
            '[&::-webkit-scrollbar]:hidden',
            '[-ms-overflow-style:none]',
            '[scrollbar-width:none]'
          )}
        >
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <CardSkeleton key={`skel-${i}`} />
              ))
            : listings.map((listing) => (
                <RecommendationCard key={listing.id} listing={listing} />
              ))}

          {/* "Ver todos" trailing card */}
          {!isLoading && href && listings.length > 0 && (
            <Link
              href={href}
              className="flex-shrink-0 w-[260px] snap-start flex items-center justify-center"
            >
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-3',
                  'h-full w-full rounded-xl border-2 border-dashed',
                  'border-zinc-200 dark:border-zinc-700',
                  'bg-zinc-50/50 dark:bg-zinc-900/50',
                  'hover:border-[#2563EB] dark:hover:border-[#60A5FA]',
                  'hover:bg-[#2563EB]/5 dark:hover:bg-[#60A5FA]/5',
                  'transition-colors duration-200',
                  'min-h-[220px]'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    'bg-[#2563EB]/10 dark:bg-[#60A5FA]/10'
                  )}
                >
                  <ArrowRight className="h-5 w-5 text-[#2563EB] dark:text-[#60A5FA]" />
                </div>
                <span className="text-sm font-medium text-[#2563EB] dark:text-[#60A5FA]">
                  Ver todos
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Right arrow (desktop only, appears on hover) */}
        <ScrollArrow
          direction="right"
          onClick={() => scroll('right')}
          visible={isHovering && canScrollRight}
        />
      </div>

      {/* Scroll progress indicator (mobile-friendly) */}
      {!isLoading && listings.length > 2 && (
        <ScrollIndicator progress={scrollProgress} />
      )}
    </section>
  );
}
