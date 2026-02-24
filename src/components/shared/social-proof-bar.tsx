'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Default messages
// ---------------------------------------------------------------------------

const DEFAULT_MESSAGES = [
  'Joao de SP comprou um buffet agora',
  '12 pessoas estao vendo este anuncio',
  'Maria vendeu uma reserva de R$ 8.500 hoje',
  '3 ofertas recebidas nas ultimas 2 horas',
  '+15 novas reservas adicionadas esta semana',
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const messageVariants = {
  enter: { opacity: 0, y: 8 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

const barVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30, delay: 1 },
  },
  dismissed: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ---------------------------------------------------------------------------
// SocialProofBar component
// ---------------------------------------------------------------------------

export interface SocialProofBarProps {
  messages?: string[];
  className?: string;
}

export function SocialProofBar({
  messages = DEFAULT_MESSAGES,
  className,
}: SocialProofBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Rotate messages every 4 seconds
  useEffect(() => {
    if (dismissed || messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [dismissed, messages.length]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          variants={barVariants}
          initial="hidden"
          animate="visible"
          exit="dismissed"
          className={cn(
            // Positioning: bottom-right on desktop, top on mobile
            'fixed z-50',
            'bottom-4 right-4',
            'sm:bottom-6 sm:right-6',
            'max-sm:bottom-auto max-sm:top-4 max-sm:left-4 max-sm:right-4',
            className
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg',
              'bg-white/95 dark:bg-zinc-900/95',
              'border border-zinc-200 dark:border-zinc-700',
              'backdrop-blur-md',
              'max-w-sm max-sm:max-w-none'
            )}
          >
            {/* Eye icon with animated pulse dot */}
            <div className="relative flex-shrink-0">
              <Eye className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span
                className={cn(
                  'absolute -top-0.5 -right-0.5',
                  'h-2 w-2 rounded-full',
                  'bg-emerald-500',
                  'animate-pulse'
                )}
              />
            </div>

            {/* Rotating message */}
            <div className="relative flex-1 overflow-hidden h-5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  variants={messageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={cn(
                    'absolute inset-0 flex items-center',
                    'text-xs font-medium text-zinc-700 dark:text-zinc-300',
                    'whitespace-nowrap truncate'
                  )}
                >
                  {messages[currentIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              aria-label="Fechar notificacao"
              className={cn(
                'flex-shrink-0 p-1 rounded-md',
                'text-zinc-400 hover:text-zinc-600',
                'dark:text-zinc-500 dark:hover:text-zinc-300',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                'transition-colors duration-150'
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
