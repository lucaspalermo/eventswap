'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Heart,
  Calendar,
  MapPin,
  ArrowRight,
  Tag,
  Music,
  Camera,
  Utensils,
  Flower2,
  Shirt,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerChild,
  cardHover,
} from '@/design-system/animations';
import { cn, formatCurrency } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventCategory =
  | 'ALL'
  | 'WEDDING_VENUE'
  | 'BUFFET'
  | 'PHOTOGRAPHER'
  | 'DECORATION'
  | 'DJ_BAND'
  | 'WEDDING_DRESS';

interface EventCard {
  id: number;
  title: string;
  category: EventCategory;
  categoryLabel: string;
  location: string;
  originalPrice: number;
  askingPrice: number;
  eventDate: string;
  sellerName: string;
  icon: LucideIcon;
  badgeColor: string;
  gradientFrom: string;
  gradientTo: string;
}

interface CategoryFilter {
  key: EventCategory;
  label: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const categories: CategoryFilter[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'WEDDING_VENUE', label: 'Casamento' },
  { key: 'BUFFET', label: 'Buffet' },
  { key: 'PHOTOGRAPHER', label: 'Fotógrafo' },
  { key: 'DECORATION', label: 'Decoração' },
  { key: 'DJ_BAND', label: 'DJ/Banda' },
  { key: 'WEDDING_DRESS', label: 'Vestido' },
];

const events: EventCard[] = [
  {
    id: 1,
    title: 'Espaço Villa Garden',
    category: 'WEDDING_VENUE',
    categoryLabel: 'Casamento',
    location: 'São Paulo, SP',
    originalPrice: 45000,
    askingPrice: 28000,
    eventDate: '15 Mar 2026',
    sellerName: 'Mariana S.',
    icon: Building2,
    badgeColor: 'bg-primary-100 text-primary-700',
    gradientFrom: 'from-primary-400',
    gradientTo: 'to-primary-600',
  },
  {
    id: 2,
    title: 'Buffet Requinte',
    category: 'BUFFET',
    categoryLabel: 'Buffet',
    location: 'Rio de Janeiro, RJ',
    originalPrice: 18000,
    askingPrice: 12500,
    eventDate: '22 Abr 2026',
    sellerName: 'Carlos M.',
    icon: Utensils,
    badgeColor: 'bg-accent-100 text-accent-700',
    gradientFrom: 'from-accent-400',
    gradientTo: 'to-accent-600',
  },
  {
    id: 3,
    title: 'Studio Lens Pro',
    category: 'PHOTOGRAPHER',
    categoryLabel: 'Fotógrafo',
    location: 'Curitiba, PR',
    originalPrice: 8500,
    askingPrice: 5200,
    eventDate: '08 Mai 2026',
    sellerName: 'Rafael A.',
    icon: Camera,
    badgeColor: 'bg-secondary-100 text-secondary-700',
    gradientFrom: 'from-secondary-400',
    gradientTo: 'to-secondary-600',
  },
  {
    id: 4,
    title: 'DJ Marco Beat',
    category: 'DJ_BAND',
    categoryLabel: 'DJ/Banda',
    location: 'Belo Horizonte, MG',
    originalPrice: 4000,
    askingPrice: 2800,
    eventDate: '10 Jun 2026',
    sellerName: 'Lucas P.',
    icon: Music,
    badgeColor: 'bg-warning-100 text-warning-700',
    gradientFrom: 'from-warning-400',
    gradientTo: 'to-warning-600',
  },
  {
    id: 5,
    title: 'Floricultura Encanto',
    category: 'DECORATION',
    categoryLabel: 'Decoração',
    location: 'Brasília, DF',
    originalPrice: 12000,
    askingPrice: 7500,
    eventDate: '20 Jul 2026',
    sellerName: 'Ana B.',
    icon: Flower2,
    badgeColor: 'bg-success-100 text-success-700',
    gradientFrom: 'from-success-400',
    gradientTo: 'to-success-600',
  },
  {
    id: 6,
    title: 'Ateliê Noivas Douradas',
    category: 'WEDDING_DRESS',
    categoryLabel: 'Vestido',
    location: 'Salvador, BA',
    originalPrice: 6000,
    askingPrice: 3900,
    eventDate: '05 Ago 2026',
    sellerName: 'Fernanda L.',
    icon: Shirt,
    badgeColor: 'bg-primary-100 text-primary-700',
    gradientFrom: 'from-primary-300',
    gradientTo: 'to-accent-400',
  },
];

// ---------------------------------------------------------------------------
// Helper: Discount percentage
// ---------------------------------------------------------------------------

function getDiscount(original: number, asking: number): number {
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
// Event Card Component
// ---------------------------------------------------------------------------

function EventCardComponent({ event }: { event: EventCard }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const Icon = event.icon;
  const discount = getDiscount(event.originalPrice, event.askingPrice);

  return (
    <motion.div
      variants={staggerChild}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="group cursor-pointer"
    >
      <motion.div
        variants={cardHover}
        className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white"
      >
        {/* Image Placeholder */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              event.gradientFrom,
              event.gradientTo,
              'opacity-90'
            )}
          />
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-white/20 p-5 backdrop-blur-sm">
              <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Category Badge (top-left) */}
          <div className="absolute left-3 top-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-xs font-medium backdrop-blur-sm',
                event.badgeColor,
                'bg-opacity-90'
              )}
            >
              <Tag className="h-3 w-3" />
              {event.categoryLabel}
            </span>
          </div>

          {/* Favorite Button (top-right) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full',
              'bg-white/90 backdrop-blur-sm transition-all duration-fast hover:scale-110',
              isFavorited ? 'text-error-500' : 'text-neutral-400 hover:text-error-400'
            )}
            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className="h-4.5 w-4.5"
              fill={isFavorited ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>

          {/* Discount badge (bottom-right) */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center rounded-full bg-success-500 px-2.5 py-0.5 text-label-xs font-semibold text-white shadow-sm">
              -{discount}%
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Title & Venue */}
          <h3 className="mb-1 truncate text-heading-sm text-neutral-900 group-hover:text-primary transition-colors duration-fast">
            {event.title}
          </h3>

          {/* Date & Location */}
          <div className="mb-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-body-sm text-neutral-500">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
              <span>{event.eventDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-body-sm text-neutral-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-heading-md text-primary">
                {formatCurrency(event.askingPrice, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </span>
              <span className="text-body-sm text-neutral-400 line-through">
                {formatCurrency(event.originalPrice, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Bottom Row: Seller Avatar + CTA */}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-label-xs font-semibold text-primary-700">
                {getInitials(event.sellerName)}
              </div>
              <span className="text-body-sm text-neutral-500">{event.sellerName}</span>
            </div>
            <span className="flex items-center gap-1 text-label-sm font-medium text-primary group-hover:gap-2 transition-all duration-fast">
              Ver detalhes
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Marketplace Preview Section
// ---------------------------------------------------------------------------

export function MarketplacePreview() {
  const [activeCategory, setActiveCategory] = useState<EventCategory>('ALL');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const filteredEvents =
    activeCategory === 'ALL'
      ? events
      : events.filter((e) => e.category === activeCategory);

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
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-10 lg:mb-12"
        >
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {categories.map((cat) => (
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

        {/* Event Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {filteredEvents.map((event) => (
            <EventCardComponent key={event.id} event={event} />
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-12 flex justify-center lg:mt-16"
        >
          <a
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
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default MarketplacePreview;
