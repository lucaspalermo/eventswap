'use client';

import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 mt-8', className)}>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Mostrando{' '}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {start}-{end}
        </span>{' '}
        de{' '}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {totalItems}
        </span>
      </p>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
