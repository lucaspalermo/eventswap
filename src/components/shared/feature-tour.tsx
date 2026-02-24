'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface FeatureTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOOLTIP_GAP = 12;
const SPOTLIGHT_PADDING = 8;

function getStorageKey(tourId: string) {
  return `tour_${tourId}_complete`;
}

// ---------------------------------------------------------------------------
// Tooltip position calculator
// ---------------------------------------------------------------------------

interface TooltipPosition {
  top: number;
  left: number;
}

function calculateTooltipPosition(
  targetRect: DOMRect,
  tooltipRect: { width: number; height: number },
  position: TourStep['position']
): TooltipPosition {
  const scroll = { x: window.scrollX, y: window.scrollY };

  switch (position) {
    case 'top':
      return {
        top: targetRect.top + scroll.y - tooltipRect.height - TOOLTIP_GAP,
        left:
          targetRect.left +
          scroll.x +
          targetRect.width / 2 -
          tooltipRect.width / 2,
      };
    case 'bottom':
      return {
        top: targetRect.bottom + scroll.y + TOOLTIP_GAP,
        left:
          targetRect.left +
          scroll.x +
          targetRect.width / 2 -
          tooltipRect.width / 2,
      };
    case 'left':
      return {
        top:
          targetRect.top +
          scroll.y +
          targetRect.height / 2 -
          tooltipRect.height / 2,
        left: targetRect.left + scroll.x - tooltipRect.width - TOOLTIP_GAP,
      };
    case 'right':
      return {
        top:
          targetRect.top +
          scroll.y +
          targetRect.height / 2 -
          tooltipRect.height / 2,
        left: targetRect.right + scroll.x + TOOLTIP_GAP,
      };
  }
}

// ---------------------------------------------------------------------------
// Clamp tooltip within viewport
// ---------------------------------------------------------------------------

function clampPosition(
  pos: TooltipPosition,
  tooltipRect: { width: number; height: number }
): TooltipPosition {
  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  return {
    left: Math.max(
      scrollX + padding,
      Math.min(pos.left, scrollX + viewportWidth - tooltipRect.width - padding)
    ),
    top: Math.max(
      scrollY + padding,
      Math.min(pos.top, scrollY + viewportHeight - tooltipRect.height - padding)
    ),
  };
}

// ---------------------------------------------------------------------------
// Arrow component
// ---------------------------------------------------------------------------

function TooltipArrow({ position }: { position: TourStep['position'] }) {
  const arrowClasses = cn(
    'absolute w-3 h-3 rotate-45 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
  );

  switch (position) {
    case 'top':
      return (
        <span
          className={cn(arrowClasses, 'bottom-[-7px] left-1/2 -translate-x-1/2 border-t-0 border-l-0')}
        />
      );
    case 'bottom':
      return (
        <span
          className={cn(arrowClasses, 'top-[-7px] left-1/2 -translate-x-1/2 border-b-0 border-r-0')}
        />
      );
    case 'left':
      return (
        <span
          className={cn(arrowClasses, 'right-[-7px] top-1/2 -translate-y-1/2 border-l-0 border-b-0')}
        />
      );
    case 'right':
      return (
        <span
          className={cn(arrowClasses, 'left-[-7px] top-1/2 -translate-y-1/2 border-r-0 border-t-0')}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const tooltipVariants = {
  hidden: (position: TourStep['position']) => {
    const offset = 12;
    const transforms: Record<string, { x: number; y: number }> = {
      top: { x: 0, y: offset },
      bottom: { x: 0, y: -offset },
      left: { x: offset, y: 0 },
      right: { x: -offset, y: 0 },
    };
    return {
      opacity: 0,
      scale: 0.95,
      ...transforms[position],
    };
  },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 28 },
  },
  exit: (position: TourStep['position']) => {
    const offset = 8;
    const transforms: Record<string, { x: number; y: number }> = {
      top: { x: 0, y: offset },
      bottom: { x: 0, y: -offset },
      left: { x: offset, y: 0 },
      right: { x: -offset, y: 0 },
    };
    return {
      opacity: 0,
      scale: 0.96,
      ...transforms[position],
      transition: { duration: 0.15 },
    };
  },
};

// ---------------------------------------------------------------------------
// Spotlight overlay (backdrop with cutout)
// ---------------------------------------------------------------------------

function SpotlightOverlay({ targetRect }: { targetRect: DOMRect | null }) {
  if (!targetRect) return null;

  const spotW = targetRect.width + SPOTLIGHT_PADDING * 2;
  const spotH = targetRect.height + SPOTLIGHT_PADDING * 2;
  const borderRadius = 12;

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-[998] h-full w-full"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <defs>
        <mask id="tour-spotlight-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect
            x={targetRect.left - SPOTLIGHT_PADDING}
            y={targetRect.top - SPOTLIGHT_PADDING}
            width={spotW}
            height={spotH}
            rx={borderRadius}
            ry={borderRadius}
            fill="black"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.5)"
        mask="url(#tour-spotlight-mask)"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FeatureTour component
// ---------------------------------------------------------------------------

export function FeatureTour({ tourId, steps, onComplete }: FeatureTourProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Client-side mount check for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    try {
      const completed = localStorage.getItem(getStorageKey(tourId));
      if (!completed) {
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, [tourId, mounted]);

  // ---------------------------------------------------------------------------
  // Position calculation
  // ---------------------------------------------------------------------------

  const updatePosition = useCallback(() => {
    if (!step) return;

    const targetEl = document.querySelector(step.target);
    if (!targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    setTargetRect(rect);

    // Scroll target into view if needed
    const inViewport =
      rect.top >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth;

    if (!inViewport) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      // Re-read rect after scroll
      requestAnimationFrame(() => {
        const newRect = targetEl.getBoundingClientRect();
        setTargetRect(newRect);
      });
    }
  }, [step]);

  // Recalculate on step change
  useEffect(() => {
    if (!visible) return;
    updatePosition();
  }, [visible, currentStep, updatePosition]);

  // Recalculate tooltip position after targetRect or tooltip size changes
  useEffect(() => {
    if (!targetRect || !tooltipRef.current || !step) return;

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;

    const rawPos = calculateTooltipPosition(
      targetRect,
      { width: tooltipWidth, height: tooltipHeight },
      step.position
    );

    // Use viewport-relative coordinates (fixed positioning)
    const fixedPos = {
      top: rawPos.top - window.scrollY,
      left: rawPos.left - window.scrollX,
    };

    const clamped = clampPosition(
      fixedPos,
      { width: tooltipWidth, height: tooltipHeight }
    );

    // Clamp to viewport without scroll offsets for fixed positioning
    setTooltipPos({
      top: Math.max(8, Math.min(clamped.top, window.innerHeight - tooltipHeight - 8)),
      left: Math.max(8, Math.min(clamped.left, window.innerWidth - tooltipWidth - 8)),
    });
  }, [targetRect, step]);

  // Listen for scroll and resize
  useEffect(() => {
    if (!visible) return;

    const handleUpdate = () => updatePosition();

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [visible, updatePosition]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const markComplete = useCallback(() => {
    try {
      localStorage.setItem(getStorageKey(tourId), new Date().toISOString());
    } catch {
      // Ignore
    }
    setVisible(false);
    onComplete();
  }, [tourId, onComplete]);

  const handleNext = useCallback(() => {
    if (isLast) {
      markComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLast, markComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirst]);

  const handleSkip = useCallback(() => {
    markComplete();
  }, [markComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleSkip, handleNext, handlePrev]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!mounted || !visible || !step) return null;

  const tourContent = (
    <>
      {/* Spotlight overlay */}
      <SpotlightOverlay targetRect={targetRect} />

      {/* Clickable backdrop to skip */}
      <div
        className="fixed inset-0 z-[999] cursor-pointer"
        onClick={handleSkip}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          custom={step.position}
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'fixed z-[1000] w-[320px] rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl',
            'dark:border-neutral-700 dark:bg-neutral-800'
          )}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          <TooltipArrow position={step.position} />

          {/* Step counter */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-[#6C3CE1] dark:text-purple-400">
              {currentStep + 1} de {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              aria-label="Pular tour"
            >
              Pular tour
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Title */}
          <h3 className="mb-1.5 text-base font-bold text-neutral-900 dark:text-white">
            {step.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {step.description}
          </p>

          {/* Step progress bar */}
          <div className="mb-4 flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-300',
                  index <= currentStep
                    ? 'bg-[#6C3CE1]'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-2">
            {!isFirst ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="gap-1 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>
            ) : (
              <div />
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1 text-xs"
            >
              {isLast ? (
                'Concluir'
              ) : (
                <>
                  Proximo
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );

  return createPortal(tourContent, document.body);
}
