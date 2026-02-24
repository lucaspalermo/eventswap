'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/marketplace', icon: Search, label: 'Buscar' },
  { href: '/sell/new/edit', icon: PlusCircle, label: 'Vender', isAction: true },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/settings', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Frosted glass background */}
      <div className="bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            if (item.isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary-600 dark:bg-secondary-500 shadow-lg shadow-secondary-600/30">
                    <item.icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-medium text-secondary-600 dark:text-secondary-400 mt-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center w-16 h-full transition-colors',
                  isActive
                    ? 'text-primary-800 dark:text-secondary-400'
                    : 'text-neutral-400 dark:text-neutral-500'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-800 dark:bg-secondary-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={cn(
                    'text-[10px] mt-0.5',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
