'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  Plus,
  Tag,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  Wallet,
  BarChart3,
  Crown,
  Settings,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Marketplace', href: '/marketplace', icon: Store },
  { label: 'Vender', href: '/sell', icon: Plus },
  { label: 'Meus Anúncios', href: '/my-listings', icon: Tag },
  { label: 'Compras', href: '/purchases', icon: ShoppingBag },
  { label: 'Vendas', href: '/sales', icon: TrendingUp },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Carteira', href: '/wallet', icon: Wallet },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Planos', href: '/plans', icon: Crown },
];

const bottomNavItems: NavItem[] = [
  { label: 'Configurações', href: '/settings', icon: Settings },
  { label: 'Perfil', href: '/profile', icon: User },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  function isActive(href: string): boolean {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw]',
              'flex flex-col',
              'bg-white dark:bg-neutral-950',
              'shadow-2xl'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-100 dark:border-neutral-800/60 flex-shrink-0">
              <Link href="/dashboard" onClick={onClose} className="focus:outline-none focus-ring rounded-lg">
                <Logo size="md" />
              </Link>
              <button
                onClick={onClose}
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg',
                  'text-neutral-500 dark:text-neutral-400',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  'transition-colors duration-150',
                  'focus:outline-none focus-ring'
                )}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide" aria-label="Navegação principal">
              <ul className="space-y-1">
                {mainNavItems.map((item, index) => {
                  const active = isActive(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg',
                          'text-label-md font-medium',
                          'transition-colors duration-150',
                          active
                            ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 flex-shrink-0',
                            active
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-neutral-400 dark:text-neutral-500'
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom section */}
            <div className="flex-shrink-0 border-t border-neutral-100 dark:border-neutral-800/60 px-3 py-3">
              <ul className="space-y-1">
                {bottomNavItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg',
                          'text-label-md font-medium',
                          'transition-colors duration-150',
                          active
                            ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 flex-shrink-0',
                            active
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-neutral-400 dark:text-neutral-500'
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
