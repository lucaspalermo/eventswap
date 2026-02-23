'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerChildScale,
  cardHoverSubtle,
} from '@/design-system/animations';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarColor: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const testimonials: Testimonial[] = [
  {
    name: 'Marina Santos',
    role: 'Noiva que transferiu reserva',
    quote:
      'Consegui transferir minha reserva do buffet em menos de 48h. O processo foi super seguro e transparente. Recebi o dinheiro no dia seguinte!',
    rating: 5,
    avatarColor: 'from-primary-400 to-primary-600',
  },
  {
    name: 'Carlos Oliveira',
    role: 'Comprou reserva de fot\u00f3grafo',
    quote:
      'Encontrei um fot\u00f3grafo incr\u00edvel por 40% do valor original. A plataforma intermediou tudo e ainda me deu garantia. Experi\u00eancia nota 10!',
    rating: 5,
    avatarColor: 'from-secondary-400 to-secondary-600',
  },
  {
    name: 'Ana Beatriz Costa',
    role: 'Transferiu decora\u00e7\u00e3o',
    quote:
      'Estava com medo de perder tudo que paguei na decora\u00e7\u00e3o. O EventSwap me ajudou a encontrar um comprador em 3 dias. Recomendo demais!',
    rating: 5,
    avatarColor: 'from-accent-400 to-accent-600',
  },
];

// ---------------------------------------------------------------------------
// Helper: Get Initials
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Star Rating
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-neutral-200 text-neutral-200'
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Testimonial Card
// ---------------------------------------------------------------------------

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      variants={staggerChildScale}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="group"
    >
      <motion.div
        variants={cardHoverSubtle}
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-2xl',
          'border border-neutral-200/60 bg-white/80 backdrop-blur-sm',
          'p-8 shadow-card transition-shadow duration-slow',
          'group-hover:shadow-card-hover'
        )}
      >
        {/* Quote decoration */}
        <div className="pointer-events-none absolute -right-2 -top-2 opacity-[0.04]">
          <Quote className="h-24 w-24 rotate-180 text-primary" />
        </div>

        {/* Stars */}
        <div className="mb-5">
          <StarRating rating={testimonial.rating} />
        </div>

        {/* Quote text */}
        <blockquote className="mb-8 flex-1 text-body-lg leading-relaxed text-neutral-700">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br',
              testimonial.avatarColor,
              'shadow-md transition-transform duration-slow group-hover:scale-105'
            )}
          >
            <span className="text-label-md font-semibold text-white">
              {getInitials(testimonial.name)}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-label-lg font-semibold text-neutral-900">
              {testimonial.name}
            </p>
            <p className="truncate text-body-sm text-neutral-500">
              {testimonial.role}
            </p>
          </div>
        </div>

        {/* Bottom accent on hover */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-hero transition-transform duration-slow group-hover:scale-x-100" />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Testimonials Section
// ---------------------------------------------------------------------------

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary">
            Depoimentos
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900">
            Quem usou, recomenda
          </h2>
          <p className="text-body-lg text-neutral-500">
            Milhares de pessoas j{'\u00e1'} transferiram reservas de eventos com seguran{'\u00e7'}a
            pela EventSwap. Veja o que elas dizem.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;
