'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, HelpCircle, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, profile, signOut, isAdmin, isDemo } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  const userName = profile?.name || user?.user_metadata?.name || 'Usuario';
  const userEmail = user?.email || 'usuario@email.com';
  const userInitials = getInitials(userName);

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full',
          'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
          'hover:bg-primary-200 dark:hover:bg-primary-900/60',
          'transition-colors duration-200',
          'text-label-sm font-semibold',
          'focus:outline-none focus-ring'
        )}
        aria-label="Menu do usuario"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {userInitials}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 top-full mt-2 w-64',
              'bg-white dark:bg-neutral-900',
              'border border-neutral-200 dark:border-neutral-800',
              'rounded-xl shadow-xl',
              'overflow-hidden',
              'z-50'
            )}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 text-label-md font-semibold flex-shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-label-sm text-neutral-900 dark:text-neutral-100 font-medium truncate">
                    {userName}
                  </p>
                  <p className="text-caption text-neutral-500 dark:text-neutral-400 truncate">
                    {userEmail}
                  </p>
                  {isDemo && (
                    <span className="inline-block mt-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                      DEMO
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <MenuLink
                href="/profile"
                icon={<User className="h-4 w-4" />}
                label="Meu Perfil"
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href="/settings"
                icon={<Settings className="h-4 w-4" />}
                label="Configuracoes"
                onClick={() => setIsOpen(false)}
              />
              {isAdmin && (
                <MenuLink
                  href="/admin"
                  icon={<Shield className="h-4 w-4" />}
                  label="Painel Admin"
                  onClick={() => setIsOpen(false)}
                />
              )}
              <MenuLink
                href="/help"
                icon={<HelpCircle className="h-4 w-4" />}
                label="Central de Ajuda"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Separator + Sign out */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 py-1.5">
              <button
                onClick={handleSignOut}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-2.5',
                  'text-error-600 dark:text-error-400',
                  'hover:bg-error-50 dark:hover:bg-error-950/30',
                  'transition-colors duration-150',
                  'text-label-sm'
                )}
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5',
        'text-neutral-700 dark:text-neutral-300',
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
        'transition-colors duration-150',
        'text-label-sm'
      )}
    >
      <span className="text-neutral-400 dark:text-neutral-500">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
