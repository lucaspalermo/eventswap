'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Calendar,
  Star,
  ImageIcon,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { getEventCategory } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { TrustBadge } from '@/components/shared/trust-badge';
import { SponsoredBadge } from '@/components/marketplace/sponsored-badge';
import { ListingPlaceholder } from '@/components/shared/listing-placeholder';

export interface EventCardProps {
  id: number;
  title: string;
  slug: string;
  images: string[];
  category: string;
  venueName: string;
  venueCity: string;
  venueState: string | null;
  eventDate: string;
  originalPrice: number;
  askingPrice: number;
  sellerName: string;
  sellerAvatar: string | null;
  sellerRating: number;
  sellerVerified?: boolean;
  isFavorited?: boolean;
  isSponsored?: boolean;
  onFavoriteToggle?: (id: number) => void;
}

export function EventCard({
  id,
  title,
  slug,
  images,
  category,
  venueName,
  venueCity,
  venueState,
  eventDate,
  originalPrice,
  askingPrice,
  sellerName,
  sellerAvatar,
  sellerRating,
  sellerVerified = false,
  isFavorited = false,
  isSponsored = false,
  onFavoriteToggle,
}: EventCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [imgError, setImgError] = useState(false);
  const categoryData = getEventCategory(category);
  const hasDiscount = originalPrice > askingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - askingPrice) / originalPrice) * 100)
    : 0;

  const locationText = venueState
    ? `${venueName} — ${venueCity}, ${venueState}`
    : `${venueName} — ${venueCity}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(!favorited);
    onFavoriteToggle?.(id);
  };

  const hasImage = images.length > 0;

  return (
    <Link href={`/marketplace/${slug}`} className="block group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={cn(
          'overflow-hidden rounded-xl border bg-white shadow-sm',
          'transition-shadow duration-300',
          'group-hover:shadow-xl group-hover:shadow-zinc-200/50 group-hover:border-zinc-300',
          'dark:bg-zinc-900 dark:group-hover:border-zinc-700 dark:group-hover:shadow-zinc-900/50',
          isSponsored
            ? 'border-amber-300/70 dark:border-amber-600/40 ring-1 ring-amber-200/50 dark:ring-amber-700/30'
            : 'border-zinc-200 dark:border-zinc-800'
        )}
      >
        {/* Image Area */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          {hasImage && !imgError ? (
            <Image
              src={images[0]}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <ListingPlaceholder />
          )}

          {/* Category Badge - Top Left */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <Badge
              className="border-0 text-white text-[11px] font-medium shadow-md backdrop-blur-sm"
              style={{ backgroundColor: categoryData.color + 'dd' }}
            >
              {categoryData.label}
            </Badge>
            {isSponsored && <SponsoredBadge size="sm" />}
          </div>

          {/* Favorite Button - Top Right */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full',
              'bg-white/80 backdrop-blur-sm shadow-md transition-all duration-200',
              'hover:bg-white hover:scale-110',
              'dark:bg-zinc-900/80 dark:hover:bg-zinc-900',
              favorited && 'bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900'
            )}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                favorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-zinc-600 dark:text-zinc-300'
              )}
            />
          </button>

          {/* Verified Seller Badge - Top Right (below favorite) */}
          {sellerVerified && (
            <div className="absolute right-3 top-12">
              <TrustBadge variant="verified-seller" size="sm" showLabel={false} />
            </div>
          )}

          {/* Discount Badge - Bottom Left */}
          {hasDiscount && (
            <div className="absolute bottom-3 left-3">
              <Badge className="border-0 bg-red-500 text-white text-xs font-bold shadow-md">
                -{discountPercent}%
              </Badge>
            </div>
          )}

          {/* Image Count Badge - Bottom Center */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <Badge className="border-0 bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm gap-1 px-2">
                <ImageIcon className="h-3 w-3" />
                {images.length}
              </Badge>
            </div>
          )}

          {/* Protected Transaction Mini Badge - Bottom Right */}
          <div className="absolute bottom-3 right-3">
            <TrustBadge variant="protected-transaction" size="sm" showLabel={false} />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-zinc-900 line-clamp-2 leading-tight mb-2 dark:text-zinc-100">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>

          {/* Event Date */}
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(eventDate)}</span>
          </div>

          {/* Price Section */}
          <div className="mb-3">
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through dark:text-zinc-500">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <div className="text-lg font-bold text-[#6C3CE1] dark:text-[#A78BFA]">
              {formatCurrency(askingPrice)}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 mb-3" />

          {/* Seller Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {sellerAvatar && (
                <AvatarImage src={sellerAvatar} alt={sellerName} />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(sellerName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate flex-1">
              {sellerName}
            </span>
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {sellerRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
