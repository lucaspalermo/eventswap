'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, CheckCircle, MessageCircle, Fingerprint } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerChild,
  cardHoverSubtle,
} from '@/design-system/animations';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgClass: string;
  iconColorClass: string;
  glowClass: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const features: Feature[] = [
  {
    icon: Shield,
    title: 'Pagamento Protegido com Escrow',
    description:
      'Seu dinheiro fica em cust\u00f3dia (escrow) at\u00e9 a transfer\u00eancia da reserva ser confirmada. Prote\u00e7\u00e3o total contra cancelamento e fraude para comprador e vendedor.',
    iconBgClass: 'bg-primary-100',
    iconColorClass: 'text-primary-600',
    glowClass: 'group-hover:shadow-primary-glow',
  },
  {
    icon: CheckCircle,
    title: 'Transfer\u00eancia de Reserva Verificada',
    description:
      'Verificamos contratos de casamento, buffet e outros eventos, confirmamos com fornecedores e garantimos que a transfer\u00eancia de reserva seja leg\u00edtima e segura.',
    iconBgClass: 'bg-success-100',
    iconColorClass: 'text-success-600',
    glowClass: 'group-hover:shadow-success-glow',
  },
  {
    icon: MessageCircle,
    title: 'Negociação de Reserva em Tempo Real',
    description:
      'Converse diretamente com o comprador ou vendedor da reserva. Negocie condi\u00e7\u00f5es de transfer\u00eancia e tire d\u00favidas antes de fechar o neg\u00f3cio.',
    iconBgClass: 'bg-secondary-100',
    iconColorClass: 'text-secondary-600',
    glowClass: 'group-hover:shadow-secondary-glow',
  },
  {
    icon: Fingerprint,
    title: 'Antifraude em Transferências de Eventos',
    description:
      'Sistema automatizado de verifica\u00e7\u00e3o de identidade e an\u00e1lise de risco em cada transfer\u00eancia de reserva de casamento, buffet ou qualquer evento.',
    iconBgClass: 'bg-accent-100',
    iconColorClass: 'text-accent-600',
    glowClass: 'group-hover:shadow-accent-glow',
  },
];

// ---------------------------------------------------------------------------
// Feature Card
// ---------------------------------------------------------------------------

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={staggerChild}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="group"
    >
      <motion.div
        variants={cardHoverSubtle}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-8',
          'shadow-card transition-colors duration-slow',
          feature.glowClass
        )}
      >
        {/* Subtle gradient shine overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-card-shine opacity-0 transition-opacity duration-slow group-hover:opacity-100" />

        {/* Icon */}
        <div className="relative mb-6">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              feature.iconBgClass,
              'transition-transform duration-slow group-hover:scale-110'
            )}
          >
            <Icon className={cn('h-6 w-6', feature.iconColorClass)} strokeWidth={1.8} />
          </div>
        </div>

        {/* Content */}
        <h3 className="mb-3 text-heading-sm text-neutral-900">
          {feature.title}
        </h3>
        <p className="text-body-md leading-relaxed text-neutral-500">
          {feature.description}
        </p>

        {/* Bottom accent line on hover */}
        <div
          className={cn(
            'absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-slow group-hover:scale-x-100',
            index === 0 && 'bg-primary',
            index === 1 && 'bg-success',
            index === 2 && 'bg-secondary',
            index === 3 && 'bg-accent'
          )}
        />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Features Section
// ---------------------------------------------------------------------------

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="seguranca"
      ref={sectionRef}
      role="region"
      aria-label="Recursos de segurança para transferência de reservas de eventos"
      className="relative overflow-hidden bg-neutral-50 py-24 lg:py-32"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mx-auto mb-16 max-w-2xl text-center lg:mb-20"
        >
          <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary">
            Por que EventSwap
          </span>
          <h2 className="mb-6 text-display-md text-neutral-900">
            Segurança na Transferência de Reservas de Eventos
          </h2>
          <p className="text-body-lg text-neutral-500">
            Cada transação na EventSwap é blindada por múltiplas
            camadas de proteção com escrow e verificação antifraude. Compre e venda reservas de
            casamento, buffet, salão de festa e fotografia com total tranquilidade.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;
