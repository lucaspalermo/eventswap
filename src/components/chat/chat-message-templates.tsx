'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  HandshakeIcon,
  HelpCircle,
  Package,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Template {
  text: string;
  icon: React.ReactNode;
}

interface TemplateCategory {
  label: string;
  icon: React.ReactNode;
  color: string;
  templates: Template[];
}

export interface ChatMessageTemplatesProps {
  onSelect: (template: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Template Data
// ---------------------------------------------------------------------------

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    label: 'Saudações',
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900',
    templates: [
      {
        text: 'Olá! Tenho interesse neste anúncio.',
        icon: <MessageSquare className="h-3 w-3" />,
      },
      {
        text: 'Obrigado pelo interesse!',
        icon: <MessageSquare className="h-3 w-3" />,
      },
    ],
  },
  {
    label: 'Perguntas',
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900',
    templates: [
      {
        text: 'Ainda está disponível?',
        icon: <HelpCircle className="h-3 w-3" />,
      },
      {
        text: 'Quando é a data do evento?',
        icon: <HelpCircle className="h-3 w-3" />,
      },
      {
        text: 'Posso ver o contrato original?',
        icon: <HelpCircle className="h-3 w-3" />,
      },
    ],
  },
  {
    label: 'Negociação',
    icon: <HandshakeIcon className="h-3.5 w-3.5" />,
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900',
    templates: [
      {
        text: 'Este valor é negociável?',
        icon: <HandshakeIcon className="h-3 w-3" />,
      },
      {
        text: 'Podemos combinar um valor?',
        icon: <HandshakeIcon className="h-3 w-3" />,
      },
    ],
  },
  {
    label: 'Logística',
    icon: <Package className="h-3.5 w-3.5" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900',
    templates: [
      {
        text: 'Aceito! Como procedemos?',
        icon: <Package className="h-3 w-3" />,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChatMessageTemplates({
  onSelect,
  className,
}: ChatMessageTemplatesProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Flatten all templates for the horizontal scroll view
  const allTemplates = TEMPLATE_CATEGORIES.flatMap((cat) =>
    cat.templates.map((t) => ({ ...t, categoryColor: cat.color }))
  );

  return (
    <div className={cn('w-full', className)}>
      {/* ---- Toggle Button ---- */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          'mb-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
          'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
          'dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Respostas rápidas
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* ---- Category Pills (visible on md+) ---- */}
            <div className="mb-2 hidden flex-wrap gap-1.5 md:flex">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() =>
                    setActiveCategory((prev) =>
                      prev === cat.label ? null : cat.label
                    )
                  }
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
                    activeCategory === cat.label
                      ? cat.color
                      : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
                  )}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ---- Desktop Grid View (filtered by category) ---- */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
                {(activeCategory
                  ? TEMPLATE_CATEGORIES.filter(
                      (c) => c.label === activeCategory
                    ).flatMap((c) =>
                      c.templates.map((t) => ({
                        ...t,
                        categoryColor: c.color,
                      }))
                    )
                  : allTemplates
                ).map((template, idx) => (
                  <motion.button
                    key={template.text}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    onClick={() => onSelect(template.text)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all',
                      template.categoryColor
                    )}
                  >
                    {template.icon}
                    <span className="line-clamp-1">{template.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ---- Mobile Horizontal Scroll View ---- */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:hidden scrollbar-none">
              {allTemplates.map((template, idx) => (
                <motion.button
                  key={template.text}
                  type="button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  onClick={() => onSelect(template.text)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-xs transition-all',
                    template.categoryColor
                  )}
                >
                  {template.icon}
                  <span>{template.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
