'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PriceTagProps {
  originalPrice: number;
  askingPrice: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    asking: 'text-base font-bold',
    original: 'text-xs',
    badge: 'text-[10px] px-1.5 py-0',
  },
  md: {
    asking: 'text-xl font-bold',
    original: 'text-sm',
    badge: 'text-xs px-2 py-0.5',
  },
  lg: {
    asking: 'text-3xl font-bold',
    original: 'text-base',
    badge: 'text-sm px-2.5 py-0.5',
  },
};

export function PriceTag({
  originalPrice,
  askingPrice,
  size = 'md',
  className,
}: PriceTagProps) {
  const hasDiscount = originalPrice > askingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - askingPrice) / originalPrice) * 100)
    : 0;

  const styles = sizeStyles[size];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-zinc-400 line-through dark:text-zinc-500',
              styles.original
            )}
          >
            {formatCurrency(originalPrice)}
          </span>
          <Badge
            className={cn(
              'bg-red-500 text-white border-0 font-semibold',
              styles.badge
            )}
          >
            -{discountPercent}%
          </Badge>
        </div>
      )}
      <span className={cn('text-[#6C3CE1] dark:text-[#A78BFA]', styles.asking)}>
        {formatCurrency(askingPrice)}
      </span>
    </div>
  );
}
