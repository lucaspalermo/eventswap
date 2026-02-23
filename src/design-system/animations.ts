// ============================================================================
// EventSwap Framer Motion Animation Variants
// Smooth, premium animations inspired by Linear and Apple
// ============================================================================

import { type Variants, type Transition } from 'framer-motion';

// ---------------------------------------------------------------------------
// Spring Configurations
// ---------------------------------------------------------------------------

export const springs = {
  /** Snappy UI interactions - buttons, toggles */
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  /** Default smooth motion - most elements */
  smooth: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  /** Gentle easing - page transitions, modals */
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  /** Bouncy feel - playful elements, notifications */
  bouncy: { type: 'spring', stiffness: 400, damping: 15 } as Transition,
  /** Slow, luxurious motion - hero sections */
  slow: { type: 'spring', stiffness: 100, damping: 20 } as Transition,
  /** Tween for predictable timing */
  tween: { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.3 } as Transition,
  /** Ease out for exits */
  easeOut: { type: 'tween', ease: [0, 0, 0.2, 1], duration: 0.2 } as Transition,
} as const;

// ---------------------------------------------------------------------------
// Fade Variants
// ---------------------------------------------------------------------------

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.2,
    },
  },
};

export const fadeDown: Variants = {
  hidden: {
    opacity: 0,
    y: -24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.2,
    },
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      type: 'tween',
      ease: [0.4, 0, 0.2, 1],
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.2,
    },
  },
};

export const fadeLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.2,
    },
  },
};

export const fadeRight: Variants = {
  hidden: {
    opacity: 0,
    x: 24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 12,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.2,
    },
  },
};

// ---------------------------------------------------------------------------
// Scale Variants
// ---------------------------------------------------------------------------

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.15,
    },
  },
};

export const scaleUp: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.2,
    },
  },
};

// ---------------------------------------------------------------------------
// Stagger Container & Children
// ---------------------------------------------------------------------------

export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
};

export const staggerChild: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.15,
    },
  },
};

export const staggerChildScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.15,
    },
  },
};

// ---------------------------------------------------------------------------
// Card Hover
// ---------------------------------------------------------------------------

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 1px 3px rgba(10, 10, 15, 0.08), 0 1px 2px rgba(10, 10, 15, 0.06)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 12px 24px rgba(10, 10, 15, 0.12), 0 4px 8px rgba(10, 10, 15, 0.08)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    boxShadow: '0 4px 12px rgba(10, 10, 15, 0.08)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

export const cardHoverSubtle: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  tap: {
    scale: 0.99,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

// ---------------------------------------------------------------------------
// Slide Variants (Sidebar, Drawer, Sheet)
// ---------------------------------------------------------------------------

export const slideInLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      type: 'tween',
      ease: [0.4, 0, 1, 1],
      duration: 0.25,
    },
  },
};

export const slideInRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      type: 'tween',
      ease: [0.4, 0, 1, 1],
      duration: 0.25,
    },
  },
};

export const slideInBottom: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      type: 'tween',
      ease: [0.4, 0, 1, 1],
      duration: 0.25,
    },
  },
};

export const slideInTop: Variants = {
  hidden: {
    y: '-100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: {
      type: 'tween',
      ease: [0.4, 0, 1, 1],
      duration: 0.25,
    },
  },
};

// ---------------------------------------------------------------------------
// Overlay / Backdrop
// ---------------------------------------------------------------------------

export const overlay: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: [0, 0, 0.2, 1],
    },
  },
};

// ---------------------------------------------------------------------------
// Pulse / Breathing
// ---------------------------------------------------------------------------

export const pulse: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const breathe: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ---------------------------------------------------------------------------
// Shimmer / Skeleton Loading
// ---------------------------------------------------------------------------

export const shimmer: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ---------------------------------------------------------------------------
// Number Counter
// ---------------------------------------------------------------------------

export const counterSpring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  mass: 1,
};

// ---------------------------------------------------------------------------
// Page Transitions
// ---------------------------------------------------------------------------

export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      ease: [0.4, 0, 0.2, 1],
      duration: 0.3,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.2,
    },
  },
};

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 5,
    transition: {
      type: 'tween',
      ease: [0, 0, 0.2, 1],
      duration: 0.15,
    },
  },
};

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

export const tooltip: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.1,
    },
  },
};

// ---------------------------------------------------------------------------
// Notification / Toast
// ---------------------------------------------------------------------------

export const toast: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    x: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      type: 'tween',
      ease: [0.4, 0, 1, 1],
      duration: 0.2,
    },
  },
};

// ---------------------------------------------------------------------------
// Floating Action Button
// ---------------------------------------------------------------------------

export const fab: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: -180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    rotate: 180,
    transition: {
      duration: 0.2,
    },
  },
};

// ---------------------------------------------------------------------------
// Hero Section - Landing Page
// ---------------------------------------------------------------------------

export const heroTitle: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 0.8,
    },
  },
};

export const heroSubtitle: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      delay: 0.2,
      duration: 0.8,
    },
  },
};

export const heroCTA: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      delay: 0.4,
    },
  },
};

// ---------------------------------------------------------------------------
// Utility: create delayed variant
// ---------------------------------------------------------------------------

export function withDelay(variants: Variants, delay: number): Variants {
  const result: Variants = {};
  for (const key in variants) {
    const variant = variants[key];
    if (typeof variant === 'object' && variant !== null && 'transition' in variant) {
      result[key] = {
        ...variant,
        transition: {
          ...(variant.transition as object),
          delay:
            ((variant.transition as Record<string, unknown>)?.delay as number ?? 0) + delay,
        },
      };
    } else {
      result[key] = variant;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Utility: create stagger with custom config
// ---------------------------------------------------------------------------

export function createStagger(
  staggerDelay = 0.08,
  childDelay = 0.1,
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  };
}
