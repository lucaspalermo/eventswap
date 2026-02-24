'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Camera,
  Calendar,
  CreditCard,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuickRepliesProps {
  /** Callback fired when a quick reply template is selected */
  onSelect: (message: string) => void;
  /** Optional additional class names */
  className?: string;
}

interface QuickReply {
  text: string;
  icon: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Template Data
// ---------------------------------------------------------------------------

const QUICK_REPLIES: QuickReply[] = [
  {
    text: 'Olá, tenho interesse!',
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  },
  {
    text: 'O preço é negociável?',
    icon: <CreditCard className="h-3.5 w-3.5" />,
  },
  {
    text: 'Ainda está disponível?',
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  },
  {
    text: 'Pode enviar mais fotos?',
    icon: <Camera className="h-3.5 w-3.5" />,
  },
  {
    text: 'Qual a data limite para transferência?',
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  {
    text: 'Aceita parcelar?',
    icon: <Send className="h-3.5 w-3.5" />,
  },
  {
    text: 'Posso agendar uma visita?',
    icon: <MapPin className="h-3.5 w-3.5" />,
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const chipVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuickReplies({ onSelect, className }: QuickRepliesProps) {
  return (
    <div
      className={cn(
        'w-full border-b border-zinc-100 bg-white/80 px-4 py-2.5 backdrop-blur-sm',
        'dark:border-zinc-800 dark:bg-zinc-900/80',
        className
      )}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'flex gap-2 overflow-x-auto pb-1',
          // Hide scrollbar across browsers
          'scrollbar-none',
          '[&::-webkit-scrollbar]:hidden',
          '[-ms-overflow-style:none]',
          '[scrollbar-width:none]'
        )}
      >
        {QUICK_REPLIES.map((reply) => (
          <motion.button
            key={reply.text}
            type="button"
            variants={chipVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(reply.text)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5',
              'text-xs font-medium whitespace-nowrap transition-colors',
              // Light mode
              'border-zinc-200 bg-white text-zinc-600',
              'hover:border-[#6C3CE1]/40 hover:bg-[#6C3CE1]/5 hover:text-[#6C3CE1]',
              // Dark mode
              'dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
              'dark:hover:border-[#A78BFA]/40 dark:hover:bg-[#6C3CE1]/10 dark:hover:text-[#A78BFA]'
            )}
          >
            {reply.icon}
            <span>{reply.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
