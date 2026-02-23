'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  marketplace: 'Marketplace',
  sell: 'Vender',
  'my-listings': 'Meus Anúncios',
  purchases: 'Compras',
  sales: 'Vendas',
  chat: 'Chat',
  wallet: 'Carteira',
  profile: 'Perfil',
  settings: 'Configurações',
  notifications: 'Notificações',
  history: 'Histórico',
};

interface BreadcrumbSegment {
  label: string;
  href: string;
}

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();

  const segments = pathname
    .split('/')
    .filter(Boolean);

  const breadcrumbs: BreadcrumbSegment[] = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-body-sm', className)}
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Início</span>
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
            {isLast ? (
              <span className="text-neutral-700 dark:text-neutral-200 font-medium truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors truncate max-w-[200px]"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
