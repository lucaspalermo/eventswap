'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, Tag, Star, ShieldCheck, TrendingUp } from 'lucide-react';
import { heroTitle, heroSubtitle, heroCTA, fadeUp, withDelay } from '@/design-system/animations';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}

interface MockCard {
  title: string;
  category: string;
  price: string;
  date: string;
  location: string;
  tag?: string;
  tagColor?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATS: StatItem[] = [
  { value: 2500, suffix: '+', label: 'Reservas transferidas' },
  { value: 12, suffix: 'M+', prefix: 'R$ ', label: 'em transações' },
  { value: 4.8, suffix: '/5', label: 'Avaliação média' },
];

const MOCK_CARDS: MockCard[] = [
  {
    title: 'Espaço Villa Borghese',
    category: 'Buffet & Espaço',
    price: 'R$ 18.500',
    date: '15 Mar 2026',
    location: 'São Paulo, SP',
    tag: 'Mais vendido',
    tagColor: 'bg-accent-100 text-accent-700',
  },
  {
    title: 'Foto Studio Premium',
    category: 'Fotografia',
    price: 'R$ 4.200',
    date: '22 Abr 2026',
    location: 'Rio de Janeiro, RJ',
  },
  {
    title: 'Quinta da Baroneza',
    category: 'Casamento',
    price: 'R$ 32.000',
    date: '08 Jun 2026',
    location: 'Campinas, SP',
    tag: 'Premium',
    tagColor: 'bg-primary-100 text-primary-700',
  },
  {
    title: 'DJ Marco Rossi',
    category: 'Música & DJ',
    price: 'R$ 3.800',
    date: '30 Mai 2026',
    location: 'Curitiba, PR',
  },
  {
    title: 'Cerimonial Elegance',
    category: 'Decoração',
    price: 'R$ 8.900',
    date: '12 Jul 2026',
    location: 'Belo Horizonte, MG',
    tag: 'Novo',
    tagColor: 'bg-success-100 text-success-700',
  },
  {
    title: 'Doces da Maria',
    category: 'Confeitaria',
    price: 'R$ 2.100',
    date: '18 Ago 2026',
    location: 'Porto Alegre, RS',
  },
];

// ---------------------------------------------------------------------------
// AnimatedCounter — animates from 0 to target value
// ---------------------------------------------------------------------------

function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    if (value % 1 !== 0) {
      return latest.toFixed(1);
    }
    return Math.round(latest).toLocaleString('pt-BR');
  });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, {
      duration: 2,
      ease: [0.4, 0, 0.2, 1],
    });
    return controls.stop;
  }, [isInView, motionValue, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// MockBrowserCard — single listing card inside the browser mockup
// ---------------------------------------------------------------------------

function MockBrowserCard({ card, index }: { card: MockCard; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white',
        'shadow-card transition-all duration-normal',
        'hover:shadow-card-hover hover:-translate-y-0.5',
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image placeholder — gradient strip */}
      <div className="relative h-[88px] overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200" role="img" aria-label={`Reserva de ${card.category} - ${card.title} em ${card.location}`}>
        <div className="absolute inset-0 bg-gradient-card-shine opacity-0 transition-opacity duration-slow group-hover:opacity-100" />
        {card.tag && (
          <span
            className={cn(
              'absolute left-2 top-2 inline-flex items-center rounded-full px-2 py-0.5',
              'text-[10px] font-semibold leading-none',
              card.tagColor ?? 'bg-neutral-100 text-neutral-600',
            )}
          >
            {card.tag}
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <p className="text-[11px] font-medium text-primary-500">{card.category}</p>
        <h4 className="truncate text-[13px] font-semibold text-neutral-900">{card.title}</h4>
        <p className="text-[10px] text-neutral-500">{card.location}</p>
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
          <span className="text-[13px] font-bold text-neutral-900">{card.price}</span>
          <span className="text-[10px] text-neutral-400">{card.date}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// MockBrowser — the stylised browser window
// ---------------------------------------------------------------------------

function MockBrowser() {
  return (
    <motion.div
      variants={withDelay(fadeUp, 0.6)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={cn(
        'relative w-full max-w-3xl mx-auto',
        'rounded-2xl border border-neutral-200/70 bg-white/80 backdrop-blur-sm',
        'shadow-float overflow-hidden',
      )}
    >
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 border-b border-neutral-200/60 bg-neutral-50/80 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 rounded-lg bg-white/90 border border-neutral-200/60 px-4 py-1.5 text-[11px] text-neutral-400 font-medium max-w-xs w-full">
            <ShieldCheck className="h-3 w-3 text-success-500 shrink-0" />
            <span className="truncate">eventswap.com.br/marketplace</span>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="p-4 sm:p-5">
        {/* Fake toolbar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-24 rounded-lg bg-primary-100/60" />
            <div className="h-7 w-20 rounded-lg bg-neutral-100" />
            <div className="h-7 w-16 rounded-lg bg-neutral-100 hidden sm:block" />
          </div>
          <div className="h-7 w-32 rounded-lg bg-neutral-100 hidden xs:block" />
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.8 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {MOCK_CARDS.map((card, i) => (
            <MockBrowserCard key={card.title} card={card} index={i} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FloatingOrb — decorative floating gradient circle
// ---------------------------------------------------------------------------

function FloatingOrb({
  className,
  size,
  delay = 0,
}: {
  className?: string;
  size: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl',
        'animate-float-slow',
        size,
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Component: HeroSection
// ---------------------------------------------------------------------------

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="hero"
      role="banner"
      aria-label="Transferência de reservas de eventos - casamento, buffet, salão de festa e mais"
      className="relative overflow-hidden bg-white"
    >
      {/* ================================================================ */}
      {/* Background Layers                                                */}
      {/* ================================================================ */}

      {/* Gradient mesh */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-mesh"
        aria-hidden="true"
      />

      {/* Dot grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(108, 60, 225, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Floating decorative orbs */}
      <FloatingOrb
        size="h-[420px] w-[420px]"
        className="bg-primary-300/20 -top-40 -left-32"
        delay={0}
      />
      <FloatingOrb
        size="h-[340px] w-[340px]"
        className="bg-secondary-300/15 top-20 -right-20"
        delay={0.3}
      />
      <FloatingOrb
        size="h-[280px] w-[280px]"
        className="bg-success-300/10 bottom-40 left-1/4"
        delay={0.5}
      />
      <FloatingOrb
        size="h-[200px] w-[200px]"
        className="bg-accent-300/10 bottom-20 right-1/3"
        delay={0.7}
      />

      {/* ================================================================ */}
      {/* Content Container                                                */}
      {/* ================================================================ */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-5 pb-12 pt-24 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
        {/* -------------------------------------------------------------- */}
        {/* Overline Badge                                                  */}
        {/* -------------------------------------------------------------- */}
        <motion.div
          variants={heroTitle}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-6"
        >
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5',
              'bg-primary-50 border border-primary-200/60',
              'text-label-sm text-primary-700',
              'shadow-xs',
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Plataforma #1 em Transferência de Reservas
          </span>
        </motion.div>

        {/* -------------------------------------------------------------- */}
        {/* Main Headline                                                   */}
        {/* -------------------------------------------------------------- */}
        <motion.h1
          variants={heroTitle}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={cn(
            'text-center',
            'text-[32px] leading-[1.15] font-bold sm:text-display-lg md:text-display-xl lg:text-display-2xl',
            'text-neutral-950',
            'max-w-4xl',
          )}
        >
          Transferência de Reservas de Eventos:{' '}
          <span className="text-gradient-hero">Casamento, Buffet e Mais com Segurança.</span>
        </motion.h1>

        {/* -------------------------------------------------------------- */}
        {/* Subtitle                                                        */}
        {/* -------------------------------------------------------------- */}
        <motion.p
          variants={heroSubtitle}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={cn(
            'mx-auto mt-6 max-w-2xl text-center',
            'text-body-lg sm:text-body-xl',
            'text-neutral-500',
          )}
        >
          Evite o prejuízo da desistência ou cancelamento de reservas de casamento, buffet,
          salão de festa e fotografia. Compre e venda com pagamento em escrow,
          intermediação segura e transferência verificada no marketplace #1 do Brasil.
        </motion.p>

        {/* -------------------------------------------------------------- */}
        {/* CTA Buttons                                                     */}
        {/* -------------------------------------------------------------- */}
        <motion.div
          variants={heroCTA}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          {/* Primary CTA */}
          <a
            href="#marketplace"
            className={cn(
              'group inline-flex items-center justify-center gap-2.5 rounded-xl',
              'px-7 py-3.5 text-label-lg',
              'bg-primary text-white',
              'shadow-primary-glow',
              'transition-all duration-normal',
              'hover:bg-primary-600 hover:shadow-[0_0_28px_rgba(108,60,225,0.45),0_0_72px_rgba(108,60,225,0.18)]',
              'hover:scale-[1.02]',
              'active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
            )}
          >
            Explorar Marketplace
            <ArrowRight className="h-5 w-5 transition-transform duration-fast group-hover:translate-x-0.5" />
          </a>

          {/* Secondary CTA */}
          <a
            href="#vender"
            className={cn(
              'group inline-flex items-center justify-center gap-2.5 rounded-xl',
              'px-7 py-3.5 text-label-lg',
              'border border-neutral-200 bg-white text-neutral-900',
              'shadow-xs',
              'transition-all duration-normal',
              'hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700',
              'hover:shadow-sm hover:scale-[1.02]',
              'active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
            )}
          >
            <Tag className="h-5 w-5 transition-colors duration-fast group-hover:text-primary-500" />
            Quero Vender
          </a>
        </motion.div>

        {/* -------------------------------------------------------------- */}
        {/* Stats Row                                                       */}
        {/* -------------------------------------------------------------- */}
        <motion.div
          variants={withDelay(fadeUp, 0.55)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={cn(
            'mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-12',
          )}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-heading-lg sm:text-heading-xl text-neutral-950 font-bold tabular-nums">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </span>
              <span className="text-label-sm text-neutral-500">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* -------------------------------------------------------------- */}
        {/* Social Proof Micro Bar                                          */}
        {/* -------------------------------------------------------------- */}
        <motion.div
          variants={withDelay(fadeUp, 0.7)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-6 flex items-center gap-2 text-label-xs text-neutral-400"
        >
          <div className="flex -space-x-1.5">
            {[
              'bg-primary-400',
              'bg-secondary-400',
              'bg-accent-400',
              'bg-success-400',
              'bg-primary-300',
            ].map((color, i) => (
              <div
                key={i}
                className={cn(
                  'h-6 w-6 rounded-full border-2 border-white',
                  color,
                )}
              />
            ))}
          </div>
          <span className="ml-1">
            Usado por <span className="font-medium text-neutral-600">+1.200</span> organizadores
          </span>
          <span className="flex items-center gap-0.5 ml-2">
            <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
            <span className="font-medium text-neutral-600">4.8</span>
          </span>
        </motion.div>

        {/* -------------------------------------------------------------- */}
        {/* Hero Browser Mockup                                             */}
        {/* -------------------------------------------------------------- */}
        <div className="mt-16 w-full lg:mt-20 hidden sm:block">
          <MockBrowser />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
