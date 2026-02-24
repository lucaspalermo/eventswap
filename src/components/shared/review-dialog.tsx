'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { usersService } from '@/services/users.service';
import { isDemoMode, getDemoSession } from '@/lib/demo-auth';
import { cn } from '@/lib/utils';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number | string;
  targetUserId: string;
  targetUserName: string;
  onReviewSubmitted?: () => void;
}

const DEMO_REVIEWS_KEY = 'eventswap_demo_reviews';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getDemoReviews(): Array<{
  id: number;
  transaction_id: number | string;
  author_id: string;
  target_id: string;
  rating: number;
  comment: string;
  created_at: string;
  author_name: string;
}> {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DEMO_REVIEWS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDemoReview(review: {
  id: number;
  transaction_id: number | string;
  author_id: string;
  target_id: string;
  rating: number;
  comment: string;
  created_at: string;
  author_name: string;
}) {
  if (typeof window === 'undefined') return;
  const reviews = getDemoReviews();
  reviews.unshift(review);
  localStorage.setItem(DEMO_REVIEWS_KEY, JSON.stringify(reviews));
}

export function ReviewDialog({
  open,
  onOpenChange,
  transactionId,
  targetUserId,
  targetUserName,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayRating = hoveredRating || rating;

  const ratingLabels: Record<number, string> = {
    1: 'Ruim',
    2: 'Regular',
    3: 'Bom',
    4: 'Muito bom',
    5: 'Excelente',
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Selecione uma avaliacao de 1 a 5 estrelas.');
      return;
    }

    setSubmitting(true);

    try {
      if (isDemoMode()) {
        // Store in localStorage for demo mode
        const demoSession = getDemoSession();
        saveDemoReview({
          id: Date.now(),
          transaction_id: transactionId,
          author_id: demoSession?.id || 'demo-buyer',
          target_id: targetUserId,
          rating,
          comment: comment.trim(),
          created_at: new Date().toISOString(),
          author_name: demoSession?.name || 'Usuario Demo',
        });

        toast.success('Avaliacao enviada com sucesso!');
      } else {
        const demoSession = getDemoSession();
        await usersService.createReview(
          Number(transactionId),
          demoSession?.id || '',
          targetUserId,
          rating,
          comment.trim() || undefined
        );
        toast.success('Avaliacao enviada com sucesso!');
      }

      // Reset form
      setRating(0);
      setHoveredRating(0);
      setComment('');
      onOpenChange(false);
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliacao. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setRating(0);
      setHoveredRating(0);
      setComment('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar Transacao</DialogTitle>
          <DialogDescription>
            Deixe sua avaliacao sobre a experiencia com este usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Target User */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-sm font-medium">
                {getInitials(targetUserName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {targetUserName}
              </p>
              <p className="text-xs text-neutral-500">
                Avaliando este usuario
              </p>
            </div>
          </div>

          {/* Star Rating Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Sua avaliacao *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={cn(
                    'p-1 rounded-md transition-all duration-150',
                    'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-1',
                    star <= displayRating
                      ? 'text-amber-400'
                      : 'text-neutral-200 dark:text-neutral-700'
                  )}
                  aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      star <= displayRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
                    )}
                  />
                </button>
              ))}
              {displayRating > 0 && (
                <span className="ml-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {ratingLabels[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <Textarea
            label="Comentario (opcional)"
            placeholder="Conte como foi sua experiencia..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            hint={`${comment.length}/500 caracteres`}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Avaliacao'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { getDemoReviews, DEMO_REVIEWS_KEY };
