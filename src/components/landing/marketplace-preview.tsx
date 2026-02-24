'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Tag,
  Star,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerChild,
  cardHover,
} from '@/design-system/animations';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { listingsService } from '@/services/listings.service';
import { getEventCategory } from '@/lib/constants';

// ---------------------------------------------------------------------------
// DB enum → UI category id mapping
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
// Types
// ---------------------------------------------------------------------------

interface RealListing {
  id: number;
  slug: string;
  title: string;
  category: string;
  venueName: string;
  venueCity: string;
  venueState: string | null;
  eventDate: string;
  originalPrice: number;
  askingPrice: number;
  sellerName: string;
  sellerAvatar: string | null;
  sellerRating: number;
  images: string[];
}

type CategoryFilter = 'ALL' | string;

// ---------------------------------------------------------------------------
// Helper: Discount percentage
// ---------------------------------------------------------------------------

function getDiscount(original: number, asking: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - asking) / original) * 100);
}

// ---------------------------------------------------------------------------
// Helper: Initials from name
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Real Listing Card Component
// ---------------------------------------------------------------------------

function RealListingCard({ listing }: { listing: RealListing }) {
  const discount = getDiscount(listing.originalPrice, listing.askingPrice);
  const categoryData = getEventCategory(listing.category);
  const hasImage = listing.images.length > 0;

  return (
    <motion.div
      variants={staggerChild}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="group"
    >
      <Link href={`/marketplace/${listing.slug}`} className="block cursor-pointer">
        <motion.div
          variants={cardHover}
          className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
        >
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {hasImage ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-neutral-400" />
              </div>
            )}

            {/* Category Badge (top-left) */}
            <div className="absolute left-3 top-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm"
                style={{ backgroundColor: (categoryData.color || '#6C3CE1') + 'dd' }}
              >
                <Tag className="h-3 w-3" />
                {categoryData.label}
              </span>
            </div>

            {/* Discount badge (bottom-right) */}
            {discount > 0 && (
              <div className="absolute bottom-3 right-3">
                <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  -{discount}%
                </span>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-5">
            {/* Title */}
            <h3 className="mb-1 truncate text-base font-semibold text-neutral-900 group-hover:text-[#6C3CE1] transition-colors">
              {listing.title}
            </h3>

            {/* Date & Location */}
            <div className="mb-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                <span>{formatDate(listing.eventDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                <span>{listing.venueName} — {listing.venueCity}{listing.venueState ? `, ${listing.venueState}` : ''}</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#6C3CE1]">
                  {formatCurrency(listing.askingPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatCurrency(listing.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Seller + CTA */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-xs font-semibold text-[#6C3CE1]">
                  {getInitials(listing.sellerName)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-600">{listing.sellerName}</span>
                  {listing.sellerRating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-neutral-500">{listing.sellerRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-[#6C3CE1] group-hover:gap-2 transition-all">
                Ver detalhes
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Marketplace Preview Section
// ---------------------------------------------------------------------------

export function MarketplacePreview() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [listings, setListings] = useState<RealListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<{ key: string; label: string }[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  // Fetch real listings from Supabase
  useEffect(() => {
    listingsService
      .search({ limit: 12, sortBy: 'newest' })
      .then((result) => {
        const mapped: RealListing[] = result.data.map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          category: DB_TO_UI_CATEGORY[l.category] || 'outro',
          venueName: l.venue_name,
          venueCity: l.venue_city,
          venueState: l.venue_state ?? null,
          eventDate: l.event_date,
          originalPrice: l.original_price,
          askingPrice: l.asking_price,
          sellerName: l.seller?.name || 'Vendedor',
          sellerAvatar: l.seller?.avatar_url ?? null,
          sellerRating: l.seller?.rating_avg ?? 0,
          images: l.images ?? [],
        }));
        setListings(mapped);

        // Build category filters from actual listings
        const catSet = new Set(mapped.map((m) => m.category));
        const cats = Array.from(catSet).map((c) => {
          const data = getEventCategory(c);
          return { key: c, label: data.label || c };
        });
        setAvailableCategories(cats);
      })
      .catch(() => {
        setListings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredListings =
    activeCategory === 'ALL'
      ? listings
      : listings.filter((l) => l.category === activeCategory);

  const categoryPills = [
    { key: 'ALL', label: 'Todos' },
    ...availableCategories,
  ];

  return (
    <section
      id="marketplace"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-12 max-w-2xl text-center lg:mb-16"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary">
            MARKETPLACE
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900">
            Descubra reservas incríveis
          </h2>
          <p className="text-body-lg text-neutral-500">
            Eventos exclusivos esperando por você, com preços que cabem no seu bolso.
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        {categoryPills.length > 1 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="mb-10 lg:mb-12"
          >
            <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
              {categoryPills.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    'flex-shrink-0 rounded-full px-5 py-2.5 text-label-sm font-medium transition-all duration-fast',
                    activeCategory === cat.key
                      ? 'bg-primary text-white shadow-primary-glow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[#6C3CE1] animate-spin" />
          </div>
        )}

        {/* No Listings State */}
        {!loading && listings.length === 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="text-center py-16"
          >
            <p className="text-lg text-neutral-500 mb-4">
              Em breve novos anúncios estarão disponíveis.
            </p>
            <p className="text-sm text-neutral-400">
              Cadastre-se para ser notificado quando novas reservas forem publicadas.
            </p>
          </motion.div>
        )}

        {/* Real Listing Cards Grid */}
        {!loading && filteredListings.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          >
            {filteredListings.slice(0, 6).map((listing) => (
              <RealListingCard key={listing.id} listing={listing} />
            ))}
          </motion.div>
        )}

        {/* CTA Button */}
        {!loading && listings.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="mt-12 flex justify-center lg:mt-16"
          >
            <Link
              href="/marketplace"
              className={cn(
                'group inline-flex items-center gap-2 rounded-xl px-8 py-4',
                'bg-primary text-white text-label-lg font-semibold',
                'shadow-primary-glow transition-all duration-normal',
                'hover:bg-primary-600 hover:shadow-lg hover:gap-3',
                'focus:outline-none focus-ring'
              )}
            >
              Ver todos os eventos
              <ArrowRight className="h-5 w-5 transition-transform duration-fast group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default MarketplacePreview;
