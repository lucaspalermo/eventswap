'use client';

import { motion, AnimatePresence } from 'framer-motion';

export interface TypingIndicatorProps {
  name: string;
  visible: boolean;
}

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -4 },
};

export function TypingIndicator({ name, visible }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 10, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2"
        >
          {/* Bouncing Dots */}
          <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
                className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
              />
            ))}
          </div>

          {/* Name Label */}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {name} está digitando...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
