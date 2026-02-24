'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TypingIndicatorProps {
  /** Whether the typing indicator should be visible */
  isTyping: boolean;
  /** Name of the user who is currently typing */
  userName: string;
  /** Optional avatar URL for the typing user */
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// Dot animation variants (framer-motion)
// ---------------------------------------------------------------------------

const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: { y: -5, opacity: 1 },
};

const dotTransition = (delay: number) => ({
  duration: 0.45,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  delay,
  ease: 'easeInOut' as const,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TypingIndicator({
  isTyping,
  userName,
  avatarUrl,
}: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 10, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-center gap-2.5 px-4 py-2"
        >
          {/* User Avatar */}
          <Avatar className="h-6 w-6 shrink-0">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={userName} />
            )}
            <AvatarFallback className="text-[10px]">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          {/* Bouncing Dots Container */}
          <div className="flex items-center gap-[5px] rounded-2xl bg-zinc-100 px-3.5 py-2 dark:bg-zinc-800">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={dotTransition(i * 0.15)}
                className="inline-block h-[6px] w-[6px] rounded-full bg-zinc-400 dark:bg-zinc-500"
              />
            ))}
          </div>

          {/* User Name Label */}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">
              {userName}
            </span>{' '}
            está digitando...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
