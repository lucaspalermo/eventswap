'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const SCROLL_THRESHOLD = 20;

export function MarketplaceHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-200/60 dark:border-neutral-800/60 shadow-sm'
          : 'bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800',
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Back */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Início</span>
          </Link>
          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
          <Link href="/" aria-label="EventSwap - Página inicial">
            <Logo size="md" variant="full" />
          </Link>
        </div>

        {/* Right: Auth buttons or Dashboard link */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium',
                'bg-primary text-white shadow-sm',
                'hover:bg-primary-600 transition-colors',
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium',
                  'text-neutral-700 dark:text-neutral-300',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
                )}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
              <Link
                href="/register"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium',
                  'bg-primary text-white shadow-sm',
                  'hover:bg-primary-600 transition-colors',
                )}
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Cadastrar</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
