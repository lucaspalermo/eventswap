'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Search, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerChild,
} from '@/design-system/animations';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  numberBgClass: string;
  numberTextClass: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const steps: Step[] = [
  {
    number: 1,
    title: 'Publique sua Reserva',
    description:
      'Cadastre os detalhes da sua reserva, fotos do contrato e defina o preço. Em menos de 5 minutos.',
    icon: Upload,
    iconBgClass: 'bg-primary-100',
    iconColorClass: 'text-primary-600',
    numberBgClass: 'bg-primary',
    numberTextClass: 'text-white',
  },
  {
    number: 2,
    title: 'Encontre um Comprador',
    description:
      'Nossa plataforma conecta você com compradores interessados. Chat seguro para negociação.',
    icon: Search,
    iconBgClass: 'bg-secondary-100',
    iconColorClass: 'text-secondary-600',
    numberBgClass: 'bg-secondary',
    numberTextClass: 'text-white',
  },
  {
    number: 3,
    title: 'Transferência Segura',
    description:
      'Pagamento em escrow, verificação de documentos e confirmação com o fornecedor. Tudo protegido.',
    icon: ShieldCheck,
    iconBgClass: 'bg-success-100',
    iconColorClass: 'text-success-600',
    numberBgClass: 'bg-success',
    numberTextClass: 'text-white',
  },
];

// ---------------------------------------------------------------------------
// Connection Line Component
// ---------------------------------------------------------------------------

function ConnectionLine({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {/* Horizontal dashed line (desktop) */}
      <div className="hidden lg:block h-[2px] w-full border-t-2 border-dashed border-neutral-300" />
      {/* Vertical dashed line (mobile/tablet) */}
      <div className="block lg:hidden w-[2px] h-16 border-l-2 border-dashed border-neutral-300" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step Card Component
// ---------------------------------------------------------------------------

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;

  return (
    <motion.div
      variants={staggerChild}
      className="relative flex flex-col items-center text-center"
    >
      {/* Number Circle */}
      <div className="relative mb-6">
        {/* Glow ring behind the number */}
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-20 blur-md',
            step.numberBgClass
          )}
          style={{ transform: 'scale(1.3)' }}
        />
        <div
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-full',
            'text-heading-md font-bold shadow-lg',
            step.numberBgClass,
            step.numberTextClass
          )}
        >
          {step.number}
        </div>
      </div>

      {/* Icon */}
      <div className="mb-5">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-xl',
            step.iconBgClass,
            'transition-transform duration-slow hover:scale-110'
          )}
        >
          <Icon className={cn('h-7 w-7', step.iconColorClass)} strokeWidth={1.8} />
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-heading-sm text-neutral-900">
        {step.title}
      </h3>

      {/* Description */}
      <p className="max-w-xs text-body-sm leading-relaxed text-neutral-500">
        {step.description}
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// How It Works Section
// ---------------------------------------------------------------------------

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-50 py-24 lg:py-32"
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
            COMO FUNCIONA
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900">
            Simples, seguro e rápido
          </h2>
          <p className="text-body-lg text-neutral-500">
            Três passos para transferir ou adquirir uma reserva de evento com total segurança.
          </p>
        </motion.div>

        {/* Steps with Connection Lines */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="relative"
        >
          {/* Desktop: Horizontal layout with connection lines */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:items-start lg:gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="contents">
                {/* Step */}
                <div className="col-span-1">
                  <StepCard step={step} />
                </div>
                {/* Connection Line (not after last) */}
                {index < steps.length - 1 && (
                  <div className="col-span-1 flex items-center pt-8">
                    <ConnectionLine className="w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: Vertical layout with connection lines */}
          <div className="flex flex-col items-center gap-0 lg:hidden">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <StepCard step={step} />
                {index < steps.length - 1 && (
                  <div className="my-4">
                    <ConnectionLine />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;
