'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn, formatCurrency, formatDateShort } from '@/lib/utils';
import {
  ImageIcon,
  ArrowRight,
  User,
  Calendar,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransactionProfile {
  id: string;
  name: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface TransactionListing {
  id: number;
  title: string;
  images: string[];
  category: string;
  venue_city: string;
  event_date: string;
}

interface TransactionData {
  id: number;
  code: string;
  agreed_price: number;
  platform_fee: number;
  seller_net_amount: number;
  status: string;
  created_at: string;
  buyer?: TransactionProfile;
  seller?: TransactionProfile;
  listing?: TransactionListing;
}

interface TransactionCardProps {
  transaction: TransactionData;
  currentUserId?: string;
  onViewDetails?: (transactionId: number) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Map transaction status to StatusBadge compatible status
// ---------------------------------------------------------------------------

function mapStatusToBadgeStatus(status: string): string {
  const statusMapping: Record<string, string> = {
    INITIATED: 'pending',
    AWAITING_PAYMENT: 'awaiting_payment',
    PAYMENT_CONFIRMED: 'payment_confirmed',
    ESCROW_HELD: 'transferring',
    TRANSFER_PENDING: 'transferring',
    COMPLETED: 'completed',
    DISPUTE_OPENED: 'disputed',
    DISPUTE_RESOLVED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  };
  return statusMapping[status] || 'pending';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransactionCard({
  transaction,
  currentUserId,
  onViewDetails,
  className,
}: TransactionCardProps) {
  const isBuyer = currentUserId === transaction.buyer?.id;
  const counterpart = isBuyer ? transaction.seller : transaction.buyer;
  const roleLabel = isBuyer ? 'Compra' : 'Venda';
  const listing = transaction.listing;
  const thumbnailUrl = listing?.images?.[0] || null;

  return (
    <Card
      className={cn(
        'group cursor-pointer border border-zinc-200 dark:border-zinc-800',
        'hover:border-[#2563EB]/30 hover:shadow-lg hover:shadow-[#2563EB]/5',
        'transition-all duration-300',
        className
      )}
      onClick={() => onViewDetails?.(transaction.id)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: Thumbnail + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={listing?.title || 'Listing'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-zinc-400" />
                </div>
              )}
              {/* Role indicator */}
              <div
                className={cn(
                  'absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  isBuyer
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                )}
              >
                {roleLabel}
              </div>
            </div>

            {/* Title and code */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {listing?.title || 'Anuncio removido'}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {transaction.code}
              </p>
              {listing?.venue_city && (
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {listing.venue_city}
                </p>
              )}
            </div>
          </div>

          {/* Center: Buyer/Seller, Price, Date */}
          <div className="flex flex-col items-start sm:items-center gap-1.5 sm:min-w-[180px]">
            {/* Counterpart */}
            {counterpart && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[140px]">
                  {counterpart.display_name || counterpart.name}
                </span>
              </div>
            )}

            {/* Price */}
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(transaction.agreed_price)}
            </p>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDateShort(transaction.created_at)}</span>
            </div>
          </div>

          {/* Right: Status + Action */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-2 shrink-0">
            <StatusBadge
              status={mapStatusToBadgeStatus(transaction.status) as 'pending' | 'awaiting_payment' | 'payment_confirmed' | 'transferring' | 'completed' | 'disputed' | 'refunded' | 'cancelled'}
            />

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:bg-[#2563EB]/5"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(transaction.id);
              }}
            >
              Ver Detalhes
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
