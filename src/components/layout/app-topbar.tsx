'use client';

import { useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSelector } from '@/components/shared/language-selector';

export function AppTopbar({ className }: { className?: string }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6',
          'bg-white/80 dark:bg-neutral-950/80',
          'backdrop-blur-xl',
          'border-b border-neutral-200/80 dark:border-neutral-800/80',
          className
        )}
      >
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className={cn(
              'lg:hidden flex items-center justify-center w-9 h-9 rounded-lg',
              'text-neutral-600 dark:text-neutral-400',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors duration-150',
              'focus:outline-none focus-ring'
            )}
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb - hidden on small mobile */}
          <Breadcrumb className="hidden sm:flex" />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg',
              'text-neutral-500 dark:text-neutral-400',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'hover:text-neutral-700 dark:hover:text-neutral-200',
              'transition-colors duration-150',
              'focus:outline-none focus-ring'
            )}
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notification bell */}
          <button
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-lg',
              'text-neutral-500 dark:text-neutral-400',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'hover:text-neutral-700 dark:hover:text-neutral-200',
              'transition-colors duration-150',
              'focus:outline-none focus-ring'
            )}
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {/* Red dot badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full ring-2 ring-white dark:ring-neutral-950" />
          </button>

          {/* Language selector */}
          <LanguageSelector />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <UserMenu />
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
