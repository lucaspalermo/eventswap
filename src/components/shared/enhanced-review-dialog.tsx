'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  Star,
  Camera,
  ThumbsUp,
  ThumbsDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import { springs } from '@/design-system/animations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryRating {
  communication: number;
  serviceQuality: number;
  punctuality: number;
  valueForMoney: number;
}

export interface EnhancedReviewData {
  transactionId: number;
  sellerId: string;
  overallRating: number;
  categoryRatings: CategoryRating;
  comment: string;
  photos: File[];
  recommends: boolean;
}

interface EnhancedReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number;
  sellerId: string;
  onSubmit: (review: EnhancedReviewData) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<keyof CategoryRating, string> = {
  communication: 'Comunicacao',
  serviceQuality: 'Qualidade do Servico',
  punctuality: 'Pontualidade',
  valueForMoney: 'Custo-Beneficio',
};

const CATEGORY_ICONS: Record<keyof CategoryRating, string> = {
  communication: '💬',
  serviceQuality: '⭐',
  punctuality: '⏰',
  valueForMoney: '💰',
};

const RATING_LABELS: Record<number, string> = {
  1: 'Ruim',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito bom',
  5: 'Excelente',
};

const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 1000;
const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ---------------------------------------------------------------------------
// AnimatedStar sub-component
// ---------------------------------------------------------------------------

interface AnimatedStarProps {
  filled: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  size?: 'sm' | 'md';
  ariaLabel: string;
}

function AnimatedStar({
  filled,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  size = 'md',
  ariaLabel,
}: AnimatedStarProps) {
  const sizeClass = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'relative p-0.5 rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-1'
      )}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      transition={springs.snappy}
      aria-label={ariaLabel}
    >
      {/* Background empty star */}
      <Star
        className={cn(
          sizeClass,
          'text-neutral-200 fill-neutral-200 dark:text-neutral-700 dark:fill-neutral-700',
          'transition-colors duration-150'
        )}
      />

      {/* Animated filled overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center p-0.5"
        initial={false}
        animate={{
          scale: filled || hovered ? 1 : 0,
          opacity: filled || hovered ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 25,
        }}
      >
        <Star
          className={cn(
            sizeClass,
            filled
              ? 'text-amber-400 fill-amber-400'
              : 'text-amber-300 fill-amber-300',
            'transition-colors duration-150'
          )}
        />
      </motion.div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// StarRatingRow sub-component
// ---------------------------------------------------------------------------

interface StarRatingRowProps {
  label: string;
  icon: string;
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md';
}

function StarRatingRow({
  label,
  icon,
  value,
  onChange,
  size = 'sm',
}: StarRatingRowProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const displayRating = hoveredStar || value;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base shrink-0" aria-hidden="true">
          {icon}
        </span>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <AnimatedStar
            key={star}
            filled={star <= value}
            hovered={star <= hoveredStar && star > value}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            size={size}
            ariaLabel={`${star} estrela${star > 1 ? 's' : ''} para ${label}`}
          />
        ))}
        {displayRating > 0 && (
          <span className="ml-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 w-16 text-right">
            {RATING_LABELS[displayRating]}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PhotoUploadSection sub-component
// ---------------------------------------------------------------------------

interface PhotoUploadSectionProps {
  photos: Array<{ file: File; preview: string }>;
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
  error: string | null;
}

function PhotoUploadSection({
  photos,
  onAdd,
  onRemove,
  error,
}: PhotoUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onAdd(e.target.files);
      }
      e.target.value = '';
    },
    [onAdd]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Fotos (opcional)
      </label>
      <div className="flex items-start gap-3 flex-wrap">
        {/* Existing photo thumbnails */}
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springs.snappy}
              className="relative group"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                aria-label={`Remover foto ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add photo button */}
        {photos.length < MAX_PHOTOS && (
          <motion.button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed transition-all',
              'border-neutral-200 hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5',
              'dark:border-neutral-700 dark:hover:border-[#2563EB]/50 dark:hover:bg-[#2563EB]/5',
              'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-1'
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Camera className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
              {photos.length}/{MAX_PHOTOS}
            </span>
          </motion.button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        JPG, PNG ou WebP. Max {MAX_PHOTO_SIZE_MB}MB cada.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main EnhancedReviewDialog component
// ---------------------------------------------------------------------------

export function EnhancedReviewDialog({
  open,
  onOpenChange,
  transactionId,
  sellerId,
  onSubmit,
  onClose,
}: EnhancedReviewDialogProps) {
  // Category ratings
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating>({
    communication: 0,
    serviceQuality: 0,
    punctuality: 0,
    valueForMoney: 0,
  });

  // Overall rating (auto-calculated or manually overridden)
  const [overallOverride, setOverallOverride] = useState<number | null>(null);
  const [overallHovered, setOverallHovered] = useState(0);

  // Comment
  const [comment, setComment] = useState('');

  // Photos
  const [photos, setPhotos] = useState<Array<{ file: File; preview: string }>>(
    []
  );
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Recommendation toggle
  const [recommends, setRecommends] = useState<boolean | null>(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Computed overall rating
  // ---------------------------------------------------------------------------

  const calculatedOverall = useMemo(() => {
    const values = Object.values(categoryRatings);
    const filled = values.filter((v) => v > 0);
    if (filled.length === 0) return 0;
    return Math.round(filled.reduce((a, b) => a + b, 0) / filled.length);
  }, [categoryRatings]);

  const overallRating = overallOverride ?? calculatedOverall;
  const overallDisplay = overallHovered || overallRating;

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const allCategoriesRated = Object.values(categoryRatings).every(
    (v) => v > 0
  );

  const commentValid =
    comment.trim().length >= MIN_COMMENT_LENGTH &&
    comment.trim().length <= MAX_COMMENT_LENGTH;

  const canSubmit =
    allCategoriesRated &&
    overallRating > 0 &&
    commentValid &&
    recommends !== null &&
    !submitting;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCategoryChange = useCallback(
    (category: keyof CategoryRating, value: number) => {
      setCategoryRatings((prev) => ({ ...prev, [category]: value }));
      // Reset override when categories change so auto-calc takes effect
      setOverallOverride(null);
    },
    []
  );

  const handleAddPhotos = useCallback(
    (fileList: FileList) => {
      setPhotoError(null);
      const files = Array.from(fileList);

      // Validate types
      const invalid = files.find((f) => !ALLOWED_IMAGE_TYPES.includes(f.type));
      if (invalid) {
        setPhotoError(
          `"${invalid.name}" nao e um formato aceito. Use JPG, PNG ou WebP.`
        );
        return;
      }

      // Validate sizes
      const oversized = files.find(
        (f) => f.size > MAX_PHOTO_SIZE_MB * 1024 * 1024
      );
      if (oversized) {
        setPhotoError(
          `"${oversized.name}" excede o limite de ${MAX_PHOTO_SIZE_MB}MB.`
        );
        return;
      }

      // Validate count
      if (photos.length + files.length > MAX_PHOTOS) {
        setPhotoError(`Maximo de ${MAX_PHOTOS} fotos permitidas.`);
        return;
      }

      const newPhotos = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
    },
    [photos.length]
  );

  const handleRemovePhoto = useCallback(
    (index: number) => {
      const photo = photos[index];
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      setPhotos((prev) => prev.filter((_, i) => i !== index));
      setPhotoError(null);
    },
    [photos]
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      onSubmit({
        transactionId,
        sellerId,
        overallRating,
        categoryRatings,
        comment: comment.trim(),
        photos: photos.map((p) => p.file),
        recommends: recommends!,
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    transactionId,
    sellerId,
    overallRating,
    categoryRatings,
    comment,
    photos,
    recommends,
    onSubmit,
  ]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Cleanup photo previews
        photos.forEach((p) => URL.revokeObjectURL(p.preview));

        // Reset all state
        setCategoryRatings({
          communication: 0,
          serviceQuality: 0,
          punctuality: 0,
          valueForMoney: 0,
        });
        setOverallOverride(null);
        setOverallHovered(0);
        setComment('');
        setPhotos([]);
        setPhotoError(null);
        setRecommends(null);
        setSubmitting(false);

        onClose();
      }
      onOpenChange(newOpen);
    },
    [photos, onClose, onOpenChange]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar Transacao</DialogTitle>
          <DialogDescription>
            Avalie sua experiencia em cada categoria. Sua avaliacao ajuda outros
            usuarios a tomar melhores decisoes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ---------------------------------------------------------------- */}
          {/* Category Ratings                                                 */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Avalie por categoria *
            </label>
            <div className="space-y-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
              {(
                Object.keys(CATEGORY_LABELS) as Array<keyof CategoryRating>
              ).map((category) => (
                <StarRatingRow
                  key={category}
                  label={CATEGORY_LABELS[category]}
                  icon={CATEGORY_ICONS[category]}
                  value={categoryRatings[category]}
                  onChange={(v) => handleCategoryChange(category, v)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Overall Rating                                                   */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nota geral *
              </label>
              {calculatedOverall > 0 && overallOverride === null && (
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  Calculada automaticamente
                </span>
              )}
              {overallOverride !== null && (
                <button
                  type="button"
                  onClick={() => setOverallOverride(null)}
                  className="text-xs text-[#2563EB] hover:underline"
                >
                  Usar automatica
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <AnimatedStar
                    key={star}
                    filled={star <= overallRating}
                    hovered={star <= overallHovered && star > overallRating}
                    onClick={() => setOverallOverride(star)}
                    onMouseEnter={() => setOverallHovered(star)}
                    onMouseLeave={() => setOverallHovered(0)}
                    size="md"
                    ariaLabel={`Nota geral: ${star} estrela${star > 1 ? 's' : ''}`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {overallDisplay > 0 && (
                  <motion.div
                    key={overallDisplay}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {overallDisplay}
                    </span>
                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {RATING_LABELS[overallDisplay]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Comment Textarea                                                 */}
          {/* ---------------------------------------------------------------- */}
          <Textarea
            label="Seu comentario *"
            placeholder="Conte como foi sua experiencia... (minimo 20 caracteres)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            error={
              comment.length > 0 && comment.trim().length < MIN_COMMENT_LENGTH
                ? `Minimo de ${MIN_COMMENT_LENGTH} caracteres (${comment.trim().length}/${MIN_COMMENT_LENGTH})`
                : undefined
            }
            hint={`${comment.trim().length}/${MAX_COMMENT_LENGTH} caracteres`}
          />

          {/* ---------------------------------------------------------------- */}
          {/* Photo Upload                                                     */}
          {/* ---------------------------------------------------------------- */}
          <PhotoUploadSection
            photos={photos}
            onAdd={handleAddPhotos}
            onRemove={handleRemovePhoto}
            error={photoError}
          />

          {/* ---------------------------------------------------------------- */}
          {/* Recommendation Toggle                                            */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Recomenda este vendedor? *
            </label>
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={() => setRecommends(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-1',
                  recommends === true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-600'
                    : 'border-neutral-200 text-neutral-600 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ThumbsUp
                  className={cn(
                    'h-4 w-4',
                    recommends === true
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  )}
                />
                Sim
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setRecommends(false)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-1',
                  recommends === false
                    ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-600'
                    : 'border-neutral-200 text-neutral-600 hover:border-red-300 hover:bg-red-50/50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-red-700 dark:hover:bg-red-950/20'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ThumbsDown
                  className={cn(
                    'h-4 w-4',
                    recommends === false
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  )}
                />
                Nao
              </motion.button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Footer                                                             */}
        {/* ------------------------------------------------------------------ */}
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
            disabled={!canSubmit}
            loading={submitting}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliacao'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
