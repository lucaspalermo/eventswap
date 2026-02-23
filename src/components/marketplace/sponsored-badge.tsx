'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Sponsored Badge
// Animated "Destaque" badge with gradient border for sponsored listings
// ---------------------------------------------------------------------------

interface SponsoredBadgeProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function SponsoredBadge({ size = 'sm', className }: SponsoredBadgeProps) {
  const isSmall = size === 'sm';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative inline-flex items-center gap-1 rounded-full',
        'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500',
        'bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]',
        isSmall ? 'px-2 py-0.5' : 'px-2.5 py-1',
        className
      )}
      style={{
        backgroundSize: '200% 100%',
      }}
    >
      {/* Inner content with slight inset for border effect */}
      <div
        className={cn(
          'relative flex items-center gap-1 rounded-full',
          'bg-gradient-to-r from-amber-50 to-yellow-50',
          'dark:from-amber-950 dark:to-yellow-950',
          isSmall ? 'px-1.5 py-px' : 'px-2 py-0.5'
        )}
      >
        <Star
          className={cn(
            'fill-amber-500 text-amber-500',
            isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3'
          )}
        />
        <span
          className={cn(
            'font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent',
            'dark:from-amber-400 dark:to-yellow-300',
            isSmall ? 'text-[9px] leading-none' : 'text-[10px] leading-none'
          )}
        >
          Destaque
        </span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sponsored Card Border Wrapper
// Wraps a card to add a subtle gold/amber border gradient
// ---------------------------------------------------------------------------

interface SponsoredCardWrapperProps {
  children: React.ReactNode;
  isSponsored: boolean;
  className?: string;
}

export function SponsoredCardWrapper({
  children,
  isSponsored,
  className,
}: SponsoredCardWrapperProps) {
  if (!isSponsored) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'relative rounded-xl p-[1.5px]',
        'bg-gradient-to-br from-amber-400/60 via-yellow-300/40 to-amber-400/60',
        'dark:from-amber-500/40 dark:via-yellow-400/20 dark:to-amber-500/40',
        className
      )}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/10 via-transparent to-amber-400/10 blur-sm" />
      <div className="relative rounded-[10px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
