'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
} from 'framer-motion';
import {
  ArrowRight,
  Upload,
  Search,
  ShieldCheck,
  Shield,
  Fingerprint,
  UserCheck,
  HeadphonesIcon,
  Heart,
  UtensilsCrossed,
  Camera,
  Music,
  Video,
  Sparkles,
  Star,
  Check,
  Building2,
  Shirt,
  TrendingUp,
  Lock,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
} from 'lucide-react';
import { AdvancedSearch } from '@/components/shared/advanced-search';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn } from '@/lib/utils';
import {
  heroTitle,
  heroSubtitle,
  heroCTA,
  fadeUp,
  staggerContainer,
  staggerChild,
  staggerChildScale,
  cardHoverSubtle,
  withDelay,
} from '@/design-system/animations';

// =============================================================================
// Animated Counter
// =============================================================================

function AnimatedStat({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });
  const displayValue = useTransform(springValue, (latest: number) => {
    if (decimals > 0) return latest.toFixed(decimals).replace('.', ',');
    const rounded = Math.round(latest);
    return rounded >= 1000
      ? new Intl.NumberFormat('pt-BR').format(rounded)
      : String(rounded);
  });

  useEffect(() => {
    if (isInView) {
      animate(motionValue, value, {
        duration: 2,
        ease: [0.4, 0, 0.2, 1],
      });
    }
  }, [isInView, motionValue, value]);

  return (
    <span ref={ref}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

// =============================================================================
// Decorative floating orb
// =============================================================================

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

// =============================================================================
// 1. HERO SECTION
// =============================================================================

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="hero"
      role="banner"
      aria-label="Transferencia de reservas de eventos - casamento, buffet, salao de festa e mais"
      className="relative overflow-hidden bg-white dark:bg-neutral-950"
    >
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(108, 60, 225, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Floating orbs */}
      <FloatingOrb size="h-[420px] w-[420px]" className="bg-primary-300/20 dark:bg-primary-500/10 -top-40 -left-32" delay={0} />
      <FloatingOrb size="h-[340px] w-[340px]" className="bg-secondary-300/15 dark:bg-secondary-500/10 top-20 -right-20" delay={0.3} />
      <FloatingOrb size="h-[280px] w-[280px]" className="bg-success-300/10 dark:bg-success-500/5 bottom-40 left-1/4" delay={0.5} />

      {/* Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-5 pb-16 pt-28 sm:pb-24 sm:pt-32 lg:px-8 lg:pt-36">
        {/* Overline Badge */}
        <motion.div
          variants={heroTitle}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-6"
        >
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5',
              'bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/40',
              'text-label-sm text-primary-700 dark:text-primary-300',
              'shadow-xs',
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Plataforma #1 em Transferencia de Reservas
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={heroTitle}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={cn(
            'text-center',
            'text-[28px] leading-[1.15] font-bold sm:text-display-lg md:text-display-xl lg:text-display-2xl',
            'text-neutral-950 dark:text-white',
            'max-w-4xl',
          )}
        >
          Desistiu da reserva?{' '}
          <span className="text-gradient-hero">Venda sem perder dinheiro.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={heroSubtitle}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={cn(
            'mx-auto mt-6 max-w-2xl text-center',
            'text-body-lg sm:text-body-xl',
            'text-neutral-500 dark:text-neutral-400',
          )}
        >
          O marketplace #1 do Brasil para transferencia segura de reservas de eventos.
          Casamentos, buffets, saloes de festa, fotografos e mais.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          variants={heroCTA}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-10 w-full max-w-2xl"
        >
          <AdvancedSearch placeholder="Buscar reservas de casamento, buffet, fotografia..." />
        </motion.div>

        {/* Stats Counter */}
        <motion.div
          variants={withDelay(fadeUp, 0.55)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-heading-lg sm:text-heading-xl text-neutral-950 dark:text-white font-bold tabular-nums">
              <AnimatedStat value={2500} suffix="+" />
            </span>
            <span className="text-label-sm text-neutral-500 dark:text-neutral-400">reservas negociadas</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-heading-lg sm:text-heading-xl text-neutral-950 dark:text-white font-bold tabular-nums">
              <AnimatedStat value={12} prefix="R$ " suffix="M+" />
            </span>
            <span className="text-label-sm text-neutral-500 dark:text-neutral-400">transacionados</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-heading-lg sm:text-heading-xl text-neutral-950 dark:text-white font-bold tabular-nums">
              <AnimatedStat value={98} suffix="%" />
            </span>
            <span className="text-label-sm text-neutral-500 dark:text-neutral-400">de satisfacao</span>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          variants={withDelay(fadeUp, 0.7)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-8 flex flex-wrap items-center justify-center gap-6"
        >
          {[
            { icon: Shield, label: 'Pagamento protegido' },
            { icon: UserCheck, label: 'Verificacao de identidade' },
            { icon: HeadphonesIcon, label: 'Suporte 24/7' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-label-xs text-neutral-500 dark:text-neutral-400"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success-50 dark:bg-success-950/50">
                <Icon className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 2. HOW IT WORKS
// =============================================================================

const STEPS = [
  {
    number: 1,
    title: 'Anuncie',
    description:
      'Cadastre os detalhes da sua reserva, fotos e defina o preco de venda. Em menos de 5 minutos esta disponivel no marketplace.',
    icon: Upload,
    iconBg: 'bg-primary-100 dark:bg-primary-900/40',
    iconColor: 'text-primary-600 dark:text-primary-400',
    numberBg: 'bg-primary dark:bg-primary-600',
  },
  {
    number: 2,
    title: 'Negocie',
    description:
      'Nossa plataforma conecta voce com compradores interessados. Chat seguro para negociacao de condicoes e preco.',
    icon: Search,
    iconBg: 'bg-secondary-100 dark:bg-secondary-900/40',
    iconColor: 'text-secondary-600 dark:text-secondary-400',
    numberBg: 'bg-secondary dark:bg-secondary-600',
  },
  {
    number: 3,
    title: 'Transfira com seguranca',
    description:
      'Pagamento protegido em escrow, verificacao de documentos e confirmacao com o fornecedor. Tudo protegido pela EventSwap.',
    icon: ShieldCheck,
    iconBg: 'bg-success-100 dark:bg-success-900/40',
    iconColor: 'text-success-600 dark:text-success-400',
    numberBg: 'bg-success dark:bg-success-600',
  },
];

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      role="region"
      aria-label="Como funciona a transferencia de reservas"
      className="relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
            COMO FUNCIONA
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900 dark:text-white">
            Tres passos simples para transferir sua reserva
          </h2>
          <p className="text-body-lg text-neutral-500 dark:text-neutral-400">
            Processo seguro com escrow e verificacao completa. Sem burocracia, sem risco.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Desktop horizontal layout */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:items-start lg:gap-0">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="contents">
                  <motion.div variants={staggerChild} className="col-span-1 flex flex-col items-center text-center">
                    {/* Number */}
                    <div className="relative mb-6">
                      <div className={cn('absolute inset-0 rounded-full opacity-20 blur-md', step.numberBg)} style={{ transform: 'scale(1.3)' }} />
                      <div className={cn('relative flex h-16 w-16 items-center justify-center rounded-full text-heading-md font-bold text-white shadow-lg', step.numberBg)}>
                        {step.number}
                      </div>
                    </div>
                    {/* Icon */}
                    <div className="mb-5">
                      <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-slow hover:scale-110', step.iconBg)}>
                        <Icon className={cn('h-7 w-7', step.iconColor)} strokeWidth={1.8} />
                      </div>
                    </div>
                    <h3 className="mb-3 text-heading-sm text-neutral-900 dark:text-white">{step.title}</h3>
                    <p className="max-w-xs text-body-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{step.description}</p>
                  </motion.div>
                  {/* Connection line */}
                  {idx < STEPS.length - 1 && (
                    <div className="col-span-1 flex items-center pt-8">
                      <div className="h-[2px] w-full border-t-2 border-dashed border-neutral-300 dark:border-neutral-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile vertical layout */}
          <div className="flex flex-col items-center gap-0 lg:hidden">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <motion.div variants={staggerChild} className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={cn('absolute inset-0 rounded-full opacity-20 blur-md', step.numberBg)} style={{ transform: 'scale(1.3)' }} />
                      <div className={cn('relative flex h-16 w-16 items-center justify-center rounded-full text-heading-md font-bold text-white shadow-lg', step.numberBg)}>
                        {step.number}
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl', step.iconBg)}>
                        <Icon className={cn('h-7 w-7', step.iconColor)} strokeWidth={1.8} />
                      </div>
                    </div>
                    <h3 className="mb-3 text-heading-sm text-neutral-900 dark:text-white">{step.title}</h3>
                    <p className="max-w-xs text-body-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{step.description}</p>
                  </motion.div>
                  {idx < STEPS.length - 1 && (
                    <div className="my-4">
                      <div className="w-[2px] h-16 border-l-2 border-dashed border-neutral-300 dark:border-neutral-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 3. CATEGORIES GRID
// =============================================================================

const CATEGORIES = [
  { id: 'casamento', label: 'Casamento', icon: Heart, color: '#EC4899', gradient: 'from-pink-500 to-pink-400' },
  { id: 'buffet', label: 'Buffet', icon: UtensilsCrossed, color: '#F97316', gradient: 'from-orange-500 to-orange-400' },
  { id: 'espaco', label: 'Espaco para Festas', icon: Building2, color: '#2563EB', gradient: 'from-[#2563EB] to-[#3B82F6]' },
  { id: 'fotografia', label: 'Fotografia', icon: Camera, color: '#0EA5E9', gradient: 'from-sky-500 to-sky-400' },
  { id: 'musica', label: 'Musica e DJ', icon: Music, color: '#10B981', gradient: 'from-emerald-500 to-emerald-400' },
  { id: 'decoracao', label: 'Decoracao', icon: Sparkles, color: '#F59E0B', gradient: 'from-amber-500 to-amber-400' },
  { id: 'video', label: 'Filmagem', icon: Video, color: '#EF4444', gradient: 'from-red-500 to-red-400' },
  { id: 'vestido-noiva', label: 'Vestido de Noiva', icon: Shirt, color: '#EC4899', gradient: 'from-pink-500 to-rose-400' },
];

function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="categorias"
      role="region"
      aria-label="Categorias de eventos"
      className="relative overflow-hidden bg-white dark:bg-neutral-950 py-24 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
            CATEGORIAS
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900 dark:text-white">
            Encontre reservas por categoria
          </h2>
          <p className="text-body-lg text-neutral-500 dark:text-neutral-400">
            Explore as melhores oportunidades em cada tipo de evento.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.id} variants={staggerChildScale}>
                <Link
                  href={`/marketplace?category=${cat.id}`}
                  className={cn(
                    'group relative flex flex-col items-center gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 p-6 lg:p-8',
                    'shadow-sm transition-all duration-300',
                    'hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-1',
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br',
                      cat.gradient,
                      'shadow-md transition-transform duration-300 group-hover:scale-110',
                    )}
                  >
                    <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
                  </div>

                  {/* Label */}
                  <span className="text-center text-label-md font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                    {cat.label}
                  </span>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 rounded-b-2xl"
                    style={{ backgroundColor: cat.color }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 4. SOCIAL PROOF (Testimonials + Company Logos)
// =============================================================================

const TESTIMONIALS = [
  {
    name: 'Marina Santos',
    city: 'Sao Paulo, SP',
    rating: 5,
    quote: 'Consegui transferir minha reserva do buffet em menos de 48h. O processo foi super seguro e transparente. Recebi o dinheiro no dia seguinte!',
    avatarColor: 'from-primary-400 to-primary-600',
  },
  {
    name: 'Carlos Oliveira',
    city: 'Rio de Janeiro, RJ',
    rating: 5,
    quote: 'Encontrei um fotografo incrivel por 40% do valor original. A plataforma intermediou tudo e ainda me deu garantia. Experiencia nota 10!',
    avatarColor: 'from-secondary-400 to-secondary-600',
  },
  {
    name: 'Ana Beatriz Costa',
    city: 'Belo Horizonte, MG',
    rating: 5,
    quote: 'Estava com medo de perder tudo que paguei na decoracao. O EventSwap me ajudou a encontrar um comprador em 3 dias. Recomendo demais!',
    avatarColor: 'from-accent-400 to-accent-600',
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SocialProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
            DEPOIMENTOS
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900 dark:text-white">
            Quem usou, recomenda
          </h2>
          <p className="text-body-lg text-neutral-500 dark:text-neutral-400">
            Milhares de pessoas ja transferiram reservas com seguranca pela EventSwap.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 mb-20"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
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
                  'border border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm',
                  'p-8 shadow-card transition-shadow duration-slow',
                  'group-hover:shadow-card-hover',
                )}
              >
                {/* Stars */}
                <div className="mb-5 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200',
                      )}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mb-8 flex-1 text-body-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br',
                      t.avatarColor,
                      'shadow-md transition-transform duration-slow group-hover:scale-105',
                    )}
                  >
                    <span className="text-label-md font-semibold text-white">
                      {getInitials(t.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-label-lg font-semibold text-neutral-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="truncate text-body-sm text-neutral-500 dark:text-neutral-400">
                      {t.city}
                    </p>
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-hero transition-transform duration-slow group-hover:scale-x-100" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Company Logos */}
        <motion.div
          variants={withDelay(fadeUp, 0.3)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <p className="mb-8 text-label-md text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Confiado por +500 empresas de eventos
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-40 dark:opacity-30">
            {['Buffet Gourmet', 'Espaco Nobre', 'Foto Premium', 'DJ Alliance', 'Decor Plus', 'Villa Events'].map(
              (company) => (
                <div
                  key={company}
                  className="flex h-10 items-center px-4 py-2 text-lg font-bold text-neutral-600 dark:text-neutral-400 tracking-tight"
                >
                  {company}
                </div>
              ),
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 5. TRUST & SECURITY SECTION
// =============================================================================

const TRUST_FEATURES = [
  {
    icon: Shield,
    title: 'Pagamento Escrow',
    description:
      'Seu dinheiro fica em custodia ate a transferencia ser confirmada. Protecao total contra fraude para comprador e vendedor.',
    iconBg: 'bg-primary-100 dark:bg-primary-900/40',
    iconColor: 'text-primary-600 dark:text-primary-400',
    accent: 'bg-primary',
  },
  {
    icon: Fingerprint,
    title: 'KYC - Verificacao de Identidade',
    description:
      'Verificamos a identidade de todos os usuarios com documento e selfie. Seguranca antifraude em cada transacao.',
    iconBg: 'bg-accent-100 dark:bg-accent-900/40',
    iconColor: 'text-accent-600 dark:text-accent-400',
    accent: 'bg-accent',
  },
  {
    icon: Lock,
    title: 'Mediacao de Disputas',
    description:
      'Equipe especializada para mediar qualquer conflito. Se algo der errado, intervimos para garantir uma resolucao justa.',
    iconBg: 'bg-success-100 dark:bg-success-900/40',
    iconColor: 'text-success-600 dark:text-success-400',
    accent: 'bg-success',
  },
];

function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="seguranca"
      ref={sectionRef}
      role="region"
      aria-label="Seguranca e confianca"
      className="relative overflow-hidden bg-white dark:bg-neutral-950 py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-40 dark:opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
            SEGURANCA
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900 dark:text-white">
            Sua seguranca e nossa prioridade
          </h2>
          <p className="text-body-lg text-neutral-500 dark:text-neutral-400">
            Multiplas camadas de protecao para que voce compre e venda reservas com total tranquilidade.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8"
        >
          {TRUST_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerChild}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="group"
              >
                <motion.div
                  variants={cardHoverSubtle}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 p-8',
                    'shadow-card transition-all duration-slow',
                    'group-hover:shadow-card-hover',
                  )}
                >
                  {/* Subtle gradient shine */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-card-shine opacity-0 transition-opacity duration-slow group-hover:opacity-100" />

                  {/* Shield visual accent (large translucent icon) */}
                  <div className="pointer-events-none absolute -right-4 -top-4 opacity-[0.04] dark:opacity-[0.06]">
                    <Shield className="h-32 w-32 text-primary" />
                  </div>

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', feature.iconBg, 'transition-transform duration-slow group-hover:scale-110')}>
                      <Icon className={cn('h-6 w-6', feature.iconColor)} strokeWidth={1.8} />
                    </div>
                  </div>

                  <h3 className="mb-3 text-heading-sm text-neutral-900 dark:text-white">{feature.title}</h3>
                  <p className="text-body-md leading-relaxed text-neutral-500 dark:text-neutral-400">{feature.description}</p>

                  {/* Bottom accent */}
                  <div className={cn('absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-slow group-hover:scale-x-100', feature.accent)} />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 6. PRICING PLANS
// =============================================================================

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/anuncio',
    description: 'Perfeito para quem quer comecar',
    fee: '12% de taxa sobre a venda',
    features: [
      'Ate 3 anuncios ativos',
      'Chat com compradores',
      'Pagamento escrow',
      'Suporte por e-mail',
    ],
    cta: 'Comecar gratis',
    href: '/register',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Pro',
    price: 'R$ 39,90',
    period: '/anuncio',
    description: 'Para quem quer vender mais rapido',
    fee: '8% de taxa sobre a venda',
    features: [
      'Anuncios ilimitados',
      'Destaque no marketplace',
      'Chat prioritario',
      'Pagamento escrow',
      'Suporte prioritario',
      'Selo verificado',
    ],
    cta: 'Assinar Pro',
    href: '/register?plan=pro',
    highlighted: true,
    badge: 'Mais popular',
  },
  {
    name: 'Business',
    price: 'R$ 99,90',
    period: '/anuncio',
    description: 'Para empresas e revendedores',
    fee: '5% de taxa sobre a venda',
    features: [
      'Tudo do Pro',
      'Destaque premium',
      'Pagina personalizada',
      'API de integracao',
      'Gerente de conta dedicado',
      'Relatorios avancados',
    ],
    cta: 'Falar com vendas',
    href: '/register?plan=business',
    highlighted: false,
    badge: null,
  },
];

function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="precos"
      role="region"
      aria-label="Planos e precos"
      className="relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
            PLANOS
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900 dark:text-white">
            Escolha o plano ideal para voce
          </h2>
          <p className="text-body-lg text-neutral-500 dark:text-neutral-400">
            Comece gratuitamente e faca upgrade quando precisar de mais recursos.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 items-stretch"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              variants={staggerChild}
              className={cn(
                'relative flex flex-col rounded-2xl border p-8',
                plan.highlighted
                  ? 'border-primary dark:border-primary-600 bg-white dark:bg-neutral-950 shadow-xl ring-1 ring-primary/20 dark:ring-primary-600/20 scale-[1.02]'
                  : 'border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-card',
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow-primary-glow">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-heading-md text-neutral-900 dark:text-white">{plan.name}</h3>
                <p className="mt-1 text-body-sm text-neutral-500 dark:text-neutral-400">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-2 flex items-baseline gap-1">
                <span className="text-display-sm font-bold text-neutral-900 dark:text-white">{plan.price}</span>
                <span className="text-body-md text-neutral-500 dark:text-neutral-400">{plan.period}</span>
              </div>
              <p className="mb-8 text-label-sm text-primary dark:text-primary-300 font-medium">{plan.fee}</p>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-600 dark:text-success-400" />
                    <span className="text-body-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={cn(
                  'flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-label-lg font-semibold transition-all duration-normal',
                  plan.highlighted
                    ? 'bg-primary text-white shadow-primary-glow hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98]'
                    : 'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary dark:hover:text-primary-300',
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 7. FINAL CTA
// =============================================================================

function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero" style={{ backgroundSize: '200% 200%' }} />

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating circles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1], y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute rounded-full blur-3xl bg-white/10 -left-20 -top-20"
        style={{ width: '280px', height: '280px' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1], y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="pointer-events-none absolute rounded-full blur-3xl bg-white/5 right-10 bottom-10"
        style={{ width: '200px', height: '200px' }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Sparkle icon */}
          <motion.div variants={staggerChild} className="mb-8 flex justify-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2 variants={staggerChild} className="mb-6 text-display-md text-white">
            Pronto para recuperar seu investimento?
          </motion.h2>

          {/* Subtitle */}
          <motion.p variants={staggerChild} className="mb-10 text-body-xl text-white/70">
            Junte-se a milhares de pessoas que ja economizaram com o EventSwap.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={staggerChild}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          >
            <Link
              href="/register"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
                'bg-white text-primary font-semibold text-label-lg',
                'shadow-float transition-all duration-normal',
                'hover:bg-neutral-50 hover:shadow-2xl hover:gap-3',
                'focus:outline-none focus-ring',
                'w-full sm:w-auto',
              )}
            >
              Vender minha reserva
              <ArrowRight className="h-5 w-5 transition-transform duration-fast group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/marketplace"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
                'border-2 border-white/30 text-white font-semibold text-label-lg',
                'transition-all duration-normal backdrop-blur-sm',
                'hover:border-white/60 hover:bg-white/10',
                'focus:outline-none focus:ring-2 focus:ring-white/40',
                'w-full sm:w-auto',
              )}
            >
              Explorar marketplace
            </Link>
          </motion.div>

          <motion.p variants={staggerChild} className="mt-8 text-caption text-white/40">
            Sem cartao de credito necessario. Crie sua conta em 30 segundos.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 8. FOOTER
// =============================================================================

const FOOTER_LINKS = {
  marketplace: {
    title: 'Marketplace',
    links: [
      { label: 'Explorar Eventos', href: '/marketplace' },
      { label: 'Como Funciona', href: '/como-funciona' },
      { label: 'Precos', href: '#precos' },
    ],
  },
  categorias: {
    title: 'Categorias',
    links: [
      { label: 'Casamento', href: '/categorias/casamento' },
      { label: 'Buffet', href: '/categorias/buffet' },
      { label: 'Salao de Festa', href: '/categorias/salao-de-festa' },
      { label: 'Fotografia', href: '/categorias/fotografia' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', href: '/terms' },
      { label: 'Politica de Privacidade', href: '/privacy' },
      { label: 'Politica Antifraude', href: '/antifraud' },
      { label: 'Mediacao e Disputas', href: '/disputes' },
    ],
  },
  suporte: {
    title: 'Suporte',
    links: [
      { label: 'WhatsApp', href: 'https://wa.me/5548991420313?text=Ola!%20Preciso%20de%20ajuda%20com%20o%20EventSwap.' },
      { label: 'Central de Ajuda', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Blog', href: '/blog' },
    ],
  },
} as const;

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'Twitter', href: '#', icon: Twitter },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'Facebook', href: '#', icon: Facebook },
] as const;

function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      {/* Top Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Logo + Tagline */}
          <div className="lg:col-span-4 space-y-6">
            <Logo size="md" className="[&_span]:!text-white" />
            <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
              Marketplace premium para transferencia segura de reservas de eventos.
              Compre e venda com pagamento protegido por escrow.
            </p>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.values(FOOTER_LINKS).map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide text-neutral-100">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row lg:px-8">
          <p className="text-xs text-neutral-500">
            &copy; 2026 EventSwap. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    'bg-neutral-800/50 text-neutral-400 transition-all duration-200',
                    'hover:bg-[#2563EB]/20 hover:text-[#2563EB]',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// HEADER (inline for landing page)
// =============================================================================

function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    },
    [],
  );

  const NAV_LINKS = [
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Categorias', href: '#categorias' },
    { label: 'Seguranca', href: '#seguranca' },
    { label: 'Precos', href: '#precos' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/60 shadow-sm'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="EventSwap - Pagina inicial" className="relative z-10 shrink-0">
          <Logo size="md" variant="full" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className={cn(
                'relative rounded-lg px-4 py-2 text-label-md transition-colors duration-fast',
                'text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white',
                'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70',
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className={cn(
              'rounded-lg px-4 py-2 text-label-md transition-colors duration-fast',
              'text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70',
            )}
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className={cn(
              'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-label-md',
              'bg-primary text-white shadow-primary-glow transition-all duration-normal',
              'hover:bg-primary-600 hover:shadow-[0_0_28px_rgba(108,60,225,0.4),0_0_72px_rgba(108,60,225,0.15)]',
              'active:scale-[0.97]',
            )}
          >
            Comecar Gratis
          </Link>
        </div>

        {/* Mobile: simplified buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-label-sm bg-primary text-white shadow-primary-glow"
          >
            Comecar
          </Link>
        </div>
      </nav>
    </header>
  );
}

// =============================================================================
// MAIN EXPORT: Full Landing Page Client Component
// =============================================================================

export function LandingPageClient() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CategoriesSection />
        <SocialProofSection />
        <TrustSection />
        <PricingSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
