'use client';

import { motion } from 'framer-motion';
import { MessageSquareOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/shared/rating-stars';
import { formatDate } from '@/lib/utils';
import { staggerContainer, staggerChild } from '@/design-system/animations';

export interface ReviewListItem {
  id: number;
  author: {
    name: string;
    avatar_url?: string | null;
  };
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: ReviewListItem[];
  emptyMessage?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ReviewList({
  reviews,
  emptyMessage = 'Nenhuma avaliacao ainda.',
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquareOff className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {emptyMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {reviews.map((review) => (
        <motion.div key={review.id} variants={staggerChild}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={review.author.avatar_url || ''} />
                  <AvatarFallback className="text-xs bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {getInitials(review.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                      {review.author.name}
                    </h4>
                    <span className="text-xs text-neutral-400 shrink-0 ml-2">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface ReviewSummaryProps {
  averageRating: number;
  totalCount: number;
}

export function ReviewSummary({ averageRating, totalCount }: ReviewSummaryProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-neutral-900 dark:text-white">
          {averageRating.toFixed(1)}
        </span>
        <div>
          <RatingStars rating={averageRating} size="sm" />
          <p className="text-xs text-neutral-500 mt-0.5">
            {totalCount} avaliacao{totalCount !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
