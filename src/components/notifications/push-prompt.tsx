'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pushNotifications } from '@/lib/push-notifications';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DISMISS_KEY = 'eventswap-push-prompt-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ---------------------------------------------------------------------------
// Component: PushPrompt
// ---------------------------------------------------------------------------

/**
 * A banner that prompts the user to enable push notifications.
 *
 * - Only renders when push is supported and permission is 'default' (undecided).
 * - Remembers dismissal for 7 days in localStorage.
 * - Calls pushNotifications.subscribe() when the user accepts.
 */
export function PushPrompt({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Don't show if not supported
    if (!pushNotifications.isSupported()) return;

    // Don't show if permission already decided
    const permission = pushNotifications.getPermission();
    if (permission !== 'default') return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) return;
    }

    // Show the prompt after a short delay so it doesn't feel intrusive
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      const subscription = await pushNotifications.subscribe();
      if (subscription) {
        setVisible(false);
      }
    } catch {
      // Silent fail - user likely denied
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md',
            'rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80',
            'bg-white dark:bg-neutral-900',
            'shadow-xl shadow-neutral-900/10 dark:shadow-neutral-900/40',
            'p-4 sm:p-5',
            className
          )}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className={cn(
              'absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg',
              'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors duration-150'
            )}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/20">
              <Bell className="h-5 w-5 text-[#2563EB]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                Ative as notificacoes
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Nao perca ofertas, mensagens e atualizacoes das suas transacoes!
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleEnable}
                  loading={isSubscribing}
                  className="gap-1.5 text-xs"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Ativar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs text-neutral-500"
                >
                  Agora nao
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
