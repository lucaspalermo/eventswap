'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, Tag, Star, TrendingUp } from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATS: StatItem[] = [
  { value: 2500, suffix: '+', label: 'Reservas transferidas' },
  { value: 12, suffix: 'M+', prefix: 'R$ ', label: 'em transações' },
  { value: 4.8, suffix: '/5', label: 'Avaliação média' },
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

      </div>
    </section>
  );
}

export default HeroSection;
