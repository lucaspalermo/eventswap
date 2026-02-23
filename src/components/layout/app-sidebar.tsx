'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  Plus,
  Tag,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  Wallet,
  Gift,
  Settings,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';
import { getInitials } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
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
  { label: 'Indique e Ganhe', href: '/referral', icon: Gift, badge: 'Novo' },
];

const bottomNavItems: NavItem[] = [
  { label: 'Configurações', href: '/settings', icon: Settings },
  { label: 'Perfil', href: '/profile', icon: User },
];

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const userName = 'Usuário';
  const userRole = 'Comprador & Vendedor';
  const userInitials = getInitials(userName);

  function isActive(href: string): boolean {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-[280px] flex flex-col',
        'bg-white dark:bg-neutral-950',
        'border-r border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-neutral-100 dark:border-neutral-800/60 flex-shrink-0">
        <Link href="/dashboard" className="focus:outline-none focus-ring rounded-lg">
          <Logo size="md" />
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide" aria-label="Navegação principal">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'text-label-sm font-medium',
                    'transition-colors duration-150',
                    'group',
                    active
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 bg-primary-50 dark:bg-primary-950/40 rounded-lg"
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'relative z-10 h-5 w-5 flex-shrink-0',
                      active
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                    )}
                  />
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="relative z-10 ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 leading-none">
                      {item.badge}
                    </span>
                  )}

                  {/* Active indicator bar */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-600 dark:bg-primary-400 rounded-r-full"
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="flex-shrink-0 border-t border-neutral-100 dark:border-neutral-800/60">
        {/* Bottom nav items */}
        <div className="px-3 py-3">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'text-label-sm font-medium',
                      'transition-colors duration-150',
                      'group',
                      active
                        ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        active
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User info */}
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 text-label-sm font-semibold flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-label-sm text-neutral-900 dark:text-neutral-100 font-medium truncate">
                {userName}
              </p>
              <p className="text-caption text-neutral-500 dark:text-neutral-400 truncate">
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
