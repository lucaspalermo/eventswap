'use client';

import { useRef, useEffect } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
} from 'framer-motion';
import { Star } from 'lucide-react';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatItem {
  /** Target numeric value for the count-up animation */
  value: number;
  /** Suffix appended after the number (e.g., "+", "%") */
  suffix: string;
  /** Prefix prepended before the number (e.g., "R$ ") */
  prefix: string;
  /** Label shown below the number */
  label: string;
  /** Whether to format with pt-BR thousand separators */
  formatted: boolean;
  /** Whether to show a decimal place */
  decimals: number;
  /** Optional icon to render next to the number */
  icon?: 'star';
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const stats: StatItem[] = [
  {
    value: 2500,
    suffix: '+',
    prefix: '',
    label: 'Reservas Transferidas',
    formatted: true,
    decimals: 0,
  },
  {
    value: 12,
    suffix: 'M+',
    prefix: 'R$ ',
    label: 'em Transa\u00e7\u00f5es Seguras',
    formatted: false,
    decimals: 0,
  },
  {
    value: 98,
    suffix: '%',
    prefix: '',
    label: 'Taxa de Satisfa\u00e7\u00e3o',
    formatted: false,
    decimals: 0,
  },
  {
    value: 4.8,
    suffix: '',
    prefix: '',
    label: 'Avalia\u00e7\u00e3o M\u00e9dia',
    formatted: false,
    decimals: 1,
    icon: 'star',
  },
];

// ---------------------------------------------------------------------------
// Animated Counter
// ---------------------------------------------------------------------------

function AnimatedCounter({
  stat,
  isInView,
}: {
  stat: StatItem;
  isInView: boolean;
}) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });

  const displayValue = useTransform(springValue, (latest: number) => {
    if (stat.decimals > 0) {
      return latest.toFixed(stat.decimals).replace('.', ',');
    }
    const rounded = Math.round(latest);
    if (stat.formatted) {
      return new Intl.NumberFormat('pt-BR').format(rounded);
    }
    return String(rounded);
  });

  useEffect(() => {
    if (isInView) {
      animate(motionValue, stat.value, {
        duration: 2,
        ease: [0.4, 0, 0.2, 1],
      });
    }
  }, [isInView, motionValue, stat.value]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-body-lg text-white/90">{stat.prefix}</span>
      <motion.span className="text-display-lg font-extrabold tracking-tight text-white">
        {displayValue}
      </motion.span>
      {stat.icon === 'star' && (
        <Star className="mb-1 ml-1.5 h-7 w-7 fill-accent text-accent" />
      )}
      <span className="text-display-sm font-bold text-white/80">{stat.suffix}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social Proof Section
// ---------------------------------------------------------------------------

export function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-950 py-24 lg:py-32"
    >
      {/* Gradient mesh overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(108, 60, 225, 0.08) 0px, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(14, 165, 233, 0.06) 0px, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(16, 185, 129, 0.05) 0px, transparent 50%)',
        }}
      />

      {/* Subtle purple glow orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(108, 60, 225, 0.12) 0%, rgba(108, 60, 225, 0.04) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary-300">
            Resultados reais
          </span>
          <h2 className="text-display-md text-white">
            N{'\u00fa'}meros que falam por si
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-0"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={staggerChild}
              className={cn(
                'flex flex-col items-center text-center',
                // Dividers between items on desktop
                index < stats.length - 1 &&
                  'lg:border-r lg:border-white/10'
              )}
            >
              <AnimatedCounter stat={stat} isInView={isInView} />
              <p className="mt-3 text-label-md text-neutral-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default SocialProof;
