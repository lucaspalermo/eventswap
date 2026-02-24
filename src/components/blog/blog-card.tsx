'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  guia: 'bg-[#2563EB]/10 text-[#2563EB]',
  dicas: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  juridico: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  financeiro: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  guia: 'Guia',
  dicas: 'Dicas',
  juridico: 'Juridico',
  financeiro: 'Financeiro',
};

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  publishedAt: string;
  readingTime: number;
}

export function BlogCard({ slug, title, excerpt, image, category, publishedAt, readingTime }: BlogCardProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 hover:shadow-lg transition-shadow"
    >
      <Link href={`/blog/${slug}`}>
        <div className="aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <div className="mb-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[category] || CATEGORY_COLORS.guia}`}>
              {CATEGORY_LABELS[category] || category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">
            {excerpt}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min de leitura
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
