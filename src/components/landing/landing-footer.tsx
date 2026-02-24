'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Facebook, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';

const footerLinks = {
  marketplace: {
    title: 'Marketplace',
    links: [
      { label: 'Explorar Eventos', href: '/marketplace' },
      { label: 'Como Funciona', href: '/como-funciona' },
      { label: 'Precos', href: '#' },
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
  informacoes: {
    title: 'Informacoes',
    links: [
      { label: 'Como Funciona', href: '/como-funciona' },
      { label: 'Sobre Nos', href: '#' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '#' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', href: '/terms' },
      { label: 'Politica de Privacidade', href: '/privacy' },
      { label: 'Exclusao de Dados', href: '/data-deletion' },
      { label: 'Politica Antifraude', href: '/antifraud' },
      { label: 'Politica de Chargeback', href: '/chargeback' },
      { label: 'Mediacao e Disputas', href: '/disputes' },
    ],
  },
  suporte: {
    title: 'Suporte',
    links: [
      { label: 'WhatsApp', href: 'https://wa.me/5548991420313?text=Ola!%20Preciso%20de%20ajuda%20com%20o%20EventSwap.' },
      { label: 'Central de Ajuda', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Seguranca', href: '#' },
    ],
  },
} as const;

const socialLinks = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'Twitter', href: '#', icon: Twitter },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'Facebook', href: '#', icon: Facebook },
] as const;

export function LandingFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubscribed(true);
    setSubscribing(false);
    setEmail('');
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300">
      {/* Top Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent" />

      {/* Main Footer Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="container-wide section-padding"
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Logo + Tagline + Newsletter */}
          <motion.div variants={staggerChild} className="lg:col-span-4 space-y-6">
            <Logo size="md" className="[&_span]:!text-white" />
            <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
              Marketplace premium para transferencia segura de reservas de eventos.
            </p>

            {/* Newsletter */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-neutral-200">
                Receba novidades e ofertas exclusivas
              </p>
              {subscribed ? (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3"
                >
                  <svg
                    className="h-4 w-4 text-emerald-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-sm text-emerald-300">
                    Inscricao realizada com sucesso!
                  </span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu melhor e-mail"
                      required
                      className={cn(
                        'h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100',
                        'placeholder:text-neutral-500 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]'
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="default"
                    loading={subscribing}
                    className="shrink-0"
                  >
                    Inscrever
                    {!subscribing && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Link Columns */}
          <motion.div
            variants={staggerChild}
            className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5"
          >
            {Object.values(footerLinks).map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide text-neutral-100">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={cn(
                          'text-sm text-neutral-400 transition-colors duration-200',
                          'hover:text-white'
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container-wide flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-neutral-500">
            &copy; 2026 EventSwap. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    'bg-neutral-800/50 text-neutral-400 transition-all duration-200',
                    'hover:bg-[#2563EB]/20 hover:text-[#2563EB]'
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
