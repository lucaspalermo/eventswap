'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Store,
  ArrowLeftRight,
  Shield,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Usuarios',
    icon: Users,
    href: '/admin/users',
  },
  {
    label: 'Eventos',
    icon: Store,
    href: '/admin/events',
  },
  {
    label: 'Transacoes',
    icon: ArrowLeftRight,
    href: '/admin/transactions',
  },
  {
    label: 'Antifraude',
    icon: Shield,
    href: '/admin/antifraud',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Logo + Admin badge */}
      <div className="flex items-center gap-3 px-6 py-6">
        <Logo size="sm" />
        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 ring-1 ring-inset ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'text-[#2563EB] dark:text-[#60A5FA]'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
              )}
            >
              {active && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute inset-0 rounded-xl bg-[#2563EB]/5 dark:bg-[#2563EB]/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon
                className={cn(
                  'relative z-10 h-5 w-5 shrink-0 transition-colors',
                  active
                    ? 'text-[#2563EB] dark:text-[#60A5FA]'
                    : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                )}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Back to App */}
      <div className="border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          <span>Voltar ao App</span>
        </Link>
      </div>
    </aside>
  );
}
