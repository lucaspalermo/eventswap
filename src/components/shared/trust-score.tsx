'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrustScoreProfile {
  rating_avg?: number;
  rating_count?: number;
  is_verified?: boolean;
  kyc_status?: string;
  created_at?: string;
  transaction_count?: number;
  response_time_minutes?: number;
}

// ---------------------------------------------------------------------------
// Score calculation
// ---------------------------------------------------------------------------

/**
 * Calculates a trust score 0–100 from profile data.
 *
 * Weights:
 *  - rating_avg        40%  (5-star scale → 0-40 pts)
 *  - transaction_count 20%  (caps at 20 transactions)
 *  - account_age       15%  (caps at 24 months)
 *  - kyc_verified      15%  (binary: 15 or 0)
 *  - response_time     10%  (< 60 min = 10 pts; linear decay up to 24h)
 */
export function calculateTrustScore(profile: TrustScoreProfile): number {
  let score = 0;

  // 1. Rating (40 pts)
  const rating = profile.rating_avg ?? 0;
  score += Math.min((rating / 5) * 40, 40);

  // 2. Transaction count (20 pts, capped at 20)
  const txCount = profile.transaction_count ?? profile.rating_count ?? 0;
  score += Math.min((txCount / 20) * 20, 20);

  // 3. Account age (15 pts, capped at 24 months)
  if (profile.created_at) {
    const ageMs = Date.now() - new Date(profile.created_at).getTime();
    const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30);
    score += Math.min((ageMonths / 24) * 15, 15);
  }

  // 4. KYC / verified (15 pts)
  const isKycVerified =
    profile.is_verified ||
    profile.kyc_status === 'verified' ||
    profile.kyc_status === 'approved';
  if (isKycVerified) score += 15;

  // 5. Response time (10 pts)
  const responseMinutes = profile.response_time_minutes;
  if (responseMinutes != null) {
    if (responseMinutes <= 60) {
      score += 10;
    } else if (responseMinutes < 1440) {
      // linear decay from 60 min (10 pts) to 1440 min (0 pts)
      score += Math.max(0, 10 - ((responseMinutes - 60) / (1440 - 60)) * 10);
    }
    // > 24h = 0 pts
  } else {
    // No data → award partial credit (5 pts)
    score += 5;
  }

  return Math.round(Math.min(score, 100));
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function getScoreColor(score: number): {
  stroke: string;
  text: string;
  bg: string;
  label: string;
} {
  if (score <= 30) {
    return {
      stroke: '#EF4444',
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
      label: 'Baixa',
    };
  }
  if (score <= 60) {
    return {
      stroke: '#F59E0B',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      label: 'Media',
    };
  }
  return {
    stroke: '#10B981',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    label: 'Alta',
  };
}

// ---------------------------------------------------------------------------
// Circular SVG progress ring
// ---------------------------------------------------------------------------

interface RingProps {
  score: number;
  size: number;
  strokeWidth: number;
}

function ScoreRing({ score, size, strokeWidth }: RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { stroke } = getScoreColor(score);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-zinc-200 dark:text-zinc-700"
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TrustScore component sizes
// ---------------------------------------------------------------------------

type TrustScoreSize = 'sm' | 'md' | 'lg';

const TRUST_SCORE_SIZES: Record<
  TrustScoreSize,
  { ring: number; strokeWidth: number; scoreText: string; ptsText: string; labelText: string }
> = {
  sm: {
    ring: 48,
    strokeWidth: 4,
    scoreText: 'text-sm font-bold',
    ptsText: 'text-[8px]',
    labelText: 'text-[10px]',
  },
  md: {
    ring: 72,
    strokeWidth: 5,
    scoreText: 'text-lg font-bold',
    ptsText: 'text-[10px]',
    labelText: 'text-xs',
  },
  lg: {
    ring: 96,
    strokeWidth: 6,
    scoreText: 'text-2xl font-bold',
    ptsText: 'text-xs',
    labelText: 'text-sm',
  },
};

// ---------------------------------------------------------------------------
// TrustScore props
// ---------------------------------------------------------------------------

export interface TrustScoreProps {
  profile: TrustScoreProfile;
  size?: TrustScoreSize;
  showLabel?: boolean;
  className?: string;
}

export function TrustScore({
  profile,
  size = 'md',
  showLabel = true,
  className,
}: TrustScoreProps) {
  const score = useMemo(() => calculateTrustScore(profile), [profile]);
  const colors = getScoreColor(score);
  const sizeConfig = TRUST_SCORE_SIZES[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn('flex flex-col items-center gap-1', className)}
    >
      {/* Ring */}
      <div className="relative inline-flex items-center justify-center">
        <ScoreRing
          score={score}
          size={sizeConfig.ring}
          strokeWidth={sizeConfig.strokeWidth}
        />
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(sizeConfig.scoreText, colors.text)}>{score}</span>
          <span className={cn(sizeConfig.ptsText, 'text-zinc-400 dark:text-zinc-500 leading-none')}>
            pts
          </span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={cn(
              sizeConfig.labelText,
              'font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap'
            )}
          >
            Pontuacao de Confianca
          </span>
          <span
            className={cn(
              sizeConfig.ptsText,
              'font-semibold whitespace-nowrap',
              colors.text
            )}
          >
            {colors.label}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Compact inline variant (shows score as a pill)
// ---------------------------------------------------------------------------

export interface TrustScoreInlineProps {
  profile: TrustScoreProfile;
  className?: string;
}

export function TrustScoreInline({ profile, className }: TrustScoreInlineProps) {
  const score = useMemo(() => calculateTrustScore(profile), [profile]);
  const colors = getScoreColor(score);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'text-xs font-semibold',
        colors.bg,
        colors.text,
        className
      )}
    >
      <span>{score}</span>
      <span className="font-normal opacity-70">pts</span>
    </motion.span>
  );
}
