"use client";

import { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { star: "h-3.5 w-3.5", gap: "gap-0.5", text: "text-xs" },
  md: { star: "h-5 w-5", gap: "gap-0.5", text: "text-sm" },
  lg: { star: "h-6 w-6", gap: "gap-1", text: "text-base" },
};

export function RatingStars({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className,
}: RatingStarsProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const config = sizeMap[size];

  const displayRating = hoveredStar !== null ? hoveredStar : rating;

  const handleClick = useCallback(
    (star: number) => {
      if (interactive && onChange) {
        onChange(star);
      }
    },
    [interactive, onChange]
  );

  const handleMouseEnter = useCallback(
    (star: number) => {
      if (interactive) {
        setHoveredStar(star);
      }
    },
    [interactive]
  );

  const handleMouseLeave = useCallback(() => {
    if (interactive) {
      setHoveredStar(null);
    }
  }, [interactive]);

  return (
    <div
      className={cn("inline-flex items-center", config.gap, className)}
      onMouseLeave={handleMouseLeave}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`Rating: ${rating} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const fillPercentage = Math.min(
          Math.max((displayRating - i) * 100, 0),
          100
        );
        const isFull = fillPercentage === 100;
        const isEmpty = fillPercentage === 0;
        const isPartial = !isFull && !isEmpty;

        const starId = `star-${starValue}-${Math.random().toString(36).slice(2, 8)}`;

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            className={cn(
              "relative inline-flex items-center justify-center p-0 border-none bg-transparent",
              interactive
                ? "cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-1 rounded-sm"
                : "cursor-default"
            )}
            aria-label={
              interactive ? `Rate ${starValue} star${starValue > 1 ? "s" : ""}` : undefined
            }
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? starValue === Math.round(rating) : undefined}
            tabIndex={interactive ? 0 : -1}
          >
            {/* Empty star background */}
            <Star
              className={cn(
                config.star,
                "text-gray-200 dark:text-gray-700",
                "fill-gray-200 dark:fill-gray-700"
              )}
            />

            {/* Filled star overlay */}
            {!isEmpty && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: isPartial ? `${fillPercentage}%` : "100%" }}
              >
                <Star
                  className={cn(
                    config.star,
                    "text-amber-400 fill-amber-400"
                  )}
                />
              </span>
            )}

            {/* Gradient definition for partial fills */}
            {isPartial && (
              <svg className="absolute h-0 w-0" aria-hidden="true">
                <defs>
                  <linearGradient id={starId}>
                    <stop offset={`${fillPercentage}%`} stopColor="#FBBF24" />
                    <stop offset={`${fillPercentage}%`} stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </button>
        );
      })}

      {showValue && (
        <span
          className={cn(
            "ml-1.5 font-medium text-gray-600 dark:text-gray-400",
            config.text
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
