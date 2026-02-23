'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { fadeDown, slideInRight, overlay, staggerContainer, staggerChild } from '@/design-system/animations';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSelector } from '@/components/shared/language-selector';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavLink {
  label: string;
  href: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_LINKS: NavLink[] = [
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Segurança', href: '#seguranca' },
  { label: 'Preços', href: '#precos' },
];

const SCROLL_THRESHOLD = 20;

// ---------------------------------------------------------------------------
// Smooth Scroll Helper
// ---------------------------------------------------------------------------

function handleSmoothScroll(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  onAfterScroll?: () => void,
) {
  if (!href.startsWith('#')) return;
  e.preventDefault();

  const targetId = href.slice(1);
  const target = document.getElementById(targetId);

  if (target) {
    const headerOffset = 80;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }

  onAfterScroll?.();
}

// ---------------------------------------------------------------------------
// Component: LandingHeader
// ---------------------------------------------------------------------------

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Scroll detection
  // -------------------------------------------------------------------------
  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll(); // initialise on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <motion.header
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className={cn(
          'fixed top-0 left-0 right-0 z-sticky transition-all duration-slow',
          isScrolled
            ? 'bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/60 shadow-sm'
            : 'bg-transparent border-b border-transparent',
        )}
      >
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* ---- Logo ---- */}
          <Link
            href="/"
            aria-label="EventSwap - Página inicial"
            className="relative z-10 shrink-0"
          >
            <Logo size="md" variant="full" />
          </Link>

          {/* ---- Desktop Nav Links (center) ---- */}
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
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ---- Desktop Right Side ---- */}
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSelector />
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                'rounded-lg px-4 py-2 text-label-md transition-colors duration-fast',
                'text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
              )}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-label-md',
                'bg-primary text-white',
                'shadow-primary-glow',
                'transition-all duration-normal',
                'hover:bg-primary-600 hover:shadow-[0_0_28px_rgba(108,60,225,0.4),0_0_72px_rgba(108,60,225,0.15)]',
                'active:scale-[0.97]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
              )}
            >
              Começar Grátis
            </Link>
          </div>

          {/* ---- Mobile Hamburger Button ---- */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center rounded-lg p-2 lg:hidden',
              'text-neutral-700 dark:text-neutral-300 transition-colors duration-fast',
              'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 hover:text-neutral-950 dark:hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-6 w-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </motion.header>

      {/* ================================================================== */}
      {/* Mobile Drawer */}
      {/* ================================================================== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[19] bg-neutral-950/40 backdrop-blur-sm lg:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'fixed right-0 top-0 bottom-0 z-sticky w-[85vw] max-w-[360px] lg:hidden',
                'bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl',
                'border-l border-neutral-200/60 dark:border-neutral-800/60',
                'shadow-2xl',
                'flex flex-col',
              )}
            >
              {/* Drawer Header */}
              <div className="flex h-[72px] items-center justify-between px-5">
                <Logo size="sm" variant="full" />
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={closeMobileMenu}
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg p-2',
                    'text-neutral-700 dark:text-neutral-300 transition-colors duration-fast',
                    'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 hover:text-neutral-950 dark:hover:text-white',
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-5 h-px bg-neutral-200/60 dark:bg-neutral-800/60" />

              {/* Nav Links */}
              <motion.nav
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6"
              >
                {NAV_LINKS.map((link) => (
                  <motion.a
                    key={link.href}
                    variants={staggerChild}
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href, closeMobileMenu)}
                    className={cn(
                      'rounded-xl px-4 py-3 text-body-lg font-medium',
                      'text-neutral-700 dark:text-neutral-300 transition-colors duration-fast',
                      'hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-700 dark:hover:text-primary-300',
                      'active:bg-primary-100 dark:active:bg-primary-950/70',
                    )}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </motion.nav>

              {/* Drawer Footer / CTAs */}
              <div className="border-t border-neutral-200/60 dark:border-neutral-800/60 px-5 py-5 space-y-3">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex w-full items-center justify-center rounded-xl px-5 py-3 text-label-lg',
                    'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100',
                    'transition-all duration-fast',
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600',
                    'active:scale-[0.98]',
                  )}
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex w-full items-center justify-center rounded-xl px-5 py-3 text-label-lg',
                    'bg-primary text-white shadow-primary-glow',
                    'transition-all duration-fast',
                    'hover:bg-primary-600',
                    'active:scale-[0.98]',
                  )}
                >
                  Começar Grátis
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default LandingHeader;
