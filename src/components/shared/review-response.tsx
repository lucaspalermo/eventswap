'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, Send, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from '@/components/shared/rating-stars';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { fadeUp } from '@/design-system/animations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewCategoryRatings {
  communication: number;
  serviceQuality: number;
  punctuality: number;
  valueForMoney: number;
}

export interface ReviewData {
  id: number;
  author: {
    name: string;
    avatar_url?: string | null;
  };
  overallRating: number;
  categoryRatings?: ReviewCategoryRatings;
  comment: string;
  photos?: string[];
  recommends?: boolean;
  created_at: string;
  response?: {
    text: string;
    created_at: string;
  } | null;
}

interface ReviewResponseProps {
  review: ReviewData;
  onSubmit: (response: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RESPONSE_LENGTH = 500;

const CATEGORY_LABELS: Record<keyof ReviewCategoryRatings, string> = {
  communication: 'Comunicacao',
  serviceQuality: 'Qualidade do Servico',
  punctuality: 'Pontualidade',
  valueForMoney: 'Custo-Beneficio',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// ReviewResponse component
// ---------------------------------------------------------------------------

export function ReviewResponse({ review, onSubmit }: ReviewResponseProps) {
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const charCount = responseText.trim().length;
  const canSubmit = charCount > 0 && charCount <= MAX_RESPONSE_LENGTH && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      onSubmit(responseText.trim());
      setResponseText('');
      setIsExpanded(false);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, responseText, onSubmit]);

  const hasExistingResponse = review.response !== null && review.response !== undefined;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* ---------------------------------------------------------------- */}
          {/* Original Review Section                                          */}
          {/* ---------------------------------------------------------------- */}
          <div className="p-4 sm:p-5">
            {/* Author + date header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 text-xs font-medium">
                {review.author.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.author.avatar_url}
                    alt={review.author.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(review.author.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {review.author.name}
                  </h4>
                  <span className="text-xs text-neutral-400 shrink-0 ml-2">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {/* Overall rating */}
                <div className="flex items-center gap-2 mb-2">
                  <RatingStars rating={review.overallRating} size="sm" />
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {review.overallRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category ratings (if present) */}
            {review.categoryRatings && (
              <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                {(
                  Object.keys(CATEGORY_LABELS) as Array<
                    keyof ReviewCategoryRatings
                  >
                ).map((category) => {
                  const value = review.categoryRatings?.[category];
                  if (!value) return null;
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {CATEGORY_LABELS[category]}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comment text */}
            {review.comment && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                {review.comment}
              </p>
            )}

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {review.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Foto da avaliacao ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Recommendation badge */}
            {review.recommends !== undefined && (
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                  review.recommends
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                )}
              >
                {review.recommends ? (
                  <>
                    <ThumbsUp className="h-3 w-3" />
                    Recomenda
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-3 w-3" />
                    Nao recomenda
                  </>
                )}
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Existing Response (if any)                                       */}
          {/* ---------------------------------------------------------------- */}
          {hasExistingResponse && (
            <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <MessageCircle className="h-4 w-4 text-[#6C3CE1] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#6C3CE1]">
                      Resposta do vendedor
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatDate(review.response!.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {review.response!.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Response Form (only if no existing response)                     */}
          {/* ---------------------------------------------------------------- */}
          {!hasExistingResponse && (
            <div className="border-t border-neutral-100 dark:border-neutral-800">
              {!isExpanded ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                    'text-[#6C3CE1] hover:bg-[#6C3CE1]/5 dark:hover:bg-[#6C3CE1]/10',
                    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6C3CE1]/50'
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  Responder
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="p-4 sm:p-5 space-y-3"
                >
                  <Textarea
                    label="Sua resposta"
                    placeholder="Escreva sua resposta ao comprador..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={3}
                    maxLength={MAX_RESPONSE_LENGTH}
                    error={
                      charCount > MAX_RESPONSE_LENGTH
                        ? `Limite de ${MAX_RESPONSE_LENGTH} caracteres excedido`
                        : undefined
                    }
                    hint={`${charCount}/${MAX_RESPONSE_LENGTH} caracteres`}
                  />

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setResponseText('');
                      }}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      loading={submitting}
                      className="bg-[#6C3CE1] hover:bg-[#5B32C1] text-white"
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Responder
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
