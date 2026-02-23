'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { staggerContainer, staggerChild } from '@/design-system/animations';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Floating Decorative Circle
// ---------------------------------------------------------------------------

interface FloatingCircleProps {
  className: string;
  size: string;
  delay?: number;
}

function FloatingCircle({ className, size, delay = 0 }: FloatingCircleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: [0.15, 0.25, 0.15],
        scale: [1, 1.1, 1],
        y: [0, -12, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl',
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

// ---------------------------------------------------------------------------
// CTA Section
// ---------------------------------------------------------------------------

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.4 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 bg-gradient-hero"
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Animated gradient overlay for shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Decorative Circles */}
      <FloatingCircle
        className="bg-white/10 -left-20 -top-20"
        size="280px"
        delay={0}
      />
      <FloatingCircle
        className="bg-secondary-300/20 right-10 top-10"
        size="200px"
        delay={1.5}
      />
      <FloatingCircle
        className="bg-accent-300/15 -bottom-16 left-1/3"
        size="240px"
        delay={3}
      />
      <FloatingCircle
        className="bg-success-300/15 -right-10 bottom-10"
        size="160px"
        delay={4.5}
      />
      <FloatingCircle
        className="bg-white/5 left-1/4 top-1/2"
        size="120px"
        delay={2}
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
          <motion.div
            variants={staggerChild}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={staggerChild}
            className="mb-6 text-display-md text-white"
          >
            Pronto para transferir sua reserva?
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={staggerChild}
            className="mb-10 text-body-xl text-white/70"
          >
            Junte-se a milhares de pessoas que já economizaram com o EventSwap
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={staggerChild}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          >
            {/* Primary CTA */}
            <a
              href="/register"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
                'bg-white text-primary font-semibold text-label-lg',
                'shadow-float transition-all duration-normal',
                'hover:bg-neutral-50 hover:shadow-2xl hover:gap-3',
                'focus:outline-none focus-ring',
                'w-full sm:w-auto'
              )}
            >
              Criar Conta Grátis
              <ArrowRight className="h-5 w-5 transition-transform duration-fast group-hover:translate-x-0.5" />
            </a>

            {/* Secondary CTA */}
            <a
              href="/marketplace"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
                'border-2 border-white/30 text-white font-semibold text-label-lg',
                'transition-all duration-normal backdrop-blur-sm',
                'hover:border-white/60 hover:bg-white/10',
                'focus:outline-none focus:ring-2 focus:ring-white/40',
                'w-full sm:w-auto'
              )}
            >
              Explorar Marketplace
            </a>
          </motion.div>

          {/* Trust signal */}
          <motion.p
            variants={staggerChild}
            className="mt-8 text-caption text-white/40"
          >
            Sem cartão de crédito necessário. Crie sua conta em 30 segundos.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;
