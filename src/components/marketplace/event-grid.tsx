'use client';

import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import { EventCard, type EventCardProps } from './event-card';
import { EmptyState } from '@/components/shared/empty-state';

interface EventGridProps {
  events: EventCardProps[];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

export function EventGrid({ events, className }: EventGridProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Nenhum anuncio encontrado"
        description="Nao encontramos anuncios com os filtros selecionados. Tente ajustar sua busca ou limpar os filtros."
        className={className}
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className || ''}`}
    >
      {events.map((event) => (
        <motion.div key={event.id} variants={itemVariants}>
          <EventCard {...event} />
        </motion.div>
      ))}
    </motion.div>
  );
}
