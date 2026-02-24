// ============================================================================
// EventSwap - Fraud Risk Scoring Engine
// Evaluates users and listings for fraudulent activity using 10 weighted
// signals across account age, KYC, pricing, behavior, and listing quality.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FraudSignal {
  signal: string;
  weight: number;
  description: string;
  triggered: boolean;
}

export interface FraudScore {
  score: number; // 0-100 (0=safe, 100=high risk)
  level: 'low' | 'medium' | 'high' | 'critical';
  signals: FraudSignal[];
  recommendation: 'allow' | 'review' | 'block';
}

export interface FraudCheckParams {
  // User data
  accountCreatedAt: string;
  hasKyc: boolean;
  hasProfilePhoto: boolean;
  profileCity: string | null;

  // Listing data (optional - only when checking a specific listing)
  askingPrice?: number;
  originalPrice?: number;
  listingCity?: string | null;
  description?: string | null;
  imageHashes?: string[];
  otherListingImageHashes?: string[][];

  // Behavior data
  listingsCreatedToday?: number;
  transactionsLast24h?: number;

  // Transaction data
  transactionAmount?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Risk threshold boundaries */
const RISK_THRESHOLDS = {
  low: 25,
  medium: 50,
  high: 75,
  // Anything above 75 is critical
} as const;

/** Account age threshold in days to be considered "new" */
const NEW_ACCOUNT_DAYS = 7;

/** Price anomaly threshold - asking price below this % of original is suspicious */
const PRICE_ANOMALY_PERCENT = 0.30;

/** High-value transaction threshold in BRL */
const HIGH_VALUE_THRESHOLD = 50_000;

/** Multiple listings threshold (same day) */
const MULTIPLE_LISTINGS_THRESHOLD = 3;

/** Rapid transactions threshold (24h) */
const RAPID_TRANSACTIONS_THRESHOLD = 2;

/** Minimum description length before it triggers a signal */
const MIN_DESCRIPTION_LENGTH = 100;

// ---------------------------------------------------------------------------
// Signal Definitions
// ---------------------------------------------------------------------------

interface SignalDefinition {
  signal: string;
  weight: number;
  description: string;
  check: (params: FraudCheckParams) => boolean;
}

const SIGNAL_DEFINITIONS: SignalDefinition[] = [
  {
    signal: 'new_account',
    weight: 15,
    description: 'Conta criada ha menos de 7 dias',
    check: (params) => {
      const ageDays = daysBetween(params.accountCreatedAt, new Date().toISOString());
      return ageDays < NEW_ACCOUNT_DAYS;
    },
  },
  {
    signal: 'no_kyc',
    weight: 25,
    description: 'Usuario sem verificacao KYC',
    check: (params) => !params.hasKyc,
  },
  {
    signal: 'price_anomaly',
    weight: 20,
    description: 'Preco pedido abaixo de 30% do original (bom demais para ser verdade)',
    check: (params) => {
      if (params.askingPrice == null || params.originalPrice == null) return false;
      if (params.originalPrice <= 0) return false;
      return params.askingPrice < params.originalPrice * PRICE_ANOMALY_PERCENT;
    },
  },
  {
    signal: 'high_value',
    weight: 10,
    description: `Transacao acima de R$ ${HIGH_VALUE_THRESHOLD.toLocaleString('pt-BR')}`,
    check: (params) => {
      const amount = params.transactionAmount ?? params.askingPrice ?? 0;
      return amount > HIGH_VALUE_THRESHOLD;
    },
  },
  {
    signal: 'multiple_listings_same_day',
    weight: 15,
    description: `Usuario criou ${MULTIPLE_LISTINGS_THRESHOLD}+ anuncios no mesmo dia`,
    check: (params) => {
      return (params.listingsCreatedToday ?? 0) >= MULTIPLE_LISTINGS_THRESHOLD;
    },
  },
  {
    signal: 'rapid_transactions',
    weight: 20,
    description: `Mais de ${RAPID_TRANSACTIONS_THRESHOLD} transacoes em 24 horas`,
    check: (params) => {
      return (params.transactionsLast24h ?? 0) > RAPID_TRANSACTIONS_THRESHOLD;
    },
  },
  {
    signal: 'mismatched_location',
    weight: 10,
    description: 'Cidade do perfil diferente da cidade do anuncio',
    check: (params) => {
      if (!params.profileCity || !params.listingCity) return false;
      const normalize = (s: string) => s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalize(params.profileCity) !== normalize(params.listingCity);
    },
  },
  {
    signal: 'no_profile_photo',
    weight: 5,
    description: 'Usuario sem foto de perfil',
    check: (params) => !params.hasProfilePhoto,
  },
  {
    signal: 'generic_description',
    weight: 10,
    description: `Descricao com menos de ${MIN_DESCRIPTION_LENGTH} caracteres`,
    check: (params) => {
      if (params.description == null) return true;
      return params.description.trim().length < MIN_DESCRIPTION_LENGTH;
    },
  },
  {
    signal: 'duplicate_images',
    weight: 30,
    description: 'Mesma imagem encontrada em outros anuncios',
    check: (params) => {
      if (!params.imageHashes || params.imageHashes.length === 0) return false;
      if (!params.otherListingImageHashes || params.otherListingImageHashes.length === 0) return false;

      const currentHashes = new Set(params.imageHashes);
      for (const otherHashes of params.otherListingImageHashes) {
        for (const hash of otherHashes) {
          if (currentHashes.has(hash)) {
            return true;
          }
        }
      }
      return false;
    },
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(dateA: string | Date, dateB: string | Date): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.abs(Math.ceil((a - b) / (1000 * 60 * 60 * 24)));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Determines the risk level based on a numeric score.
 *
 * - 0-25:   low
 * - 26-50:  medium
 * - 51-75:  high
 * - 76-100: critical
 */
export function getLevelFromScore(score: number): FraudScore['level'] {
  const clamped = clamp(score, 0, 100);
  if (clamped <= RISK_THRESHOLDS.low) return 'low';
  if (clamped <= RISK_THRESHOLDS.medium) return 'medium';
  if (clamped <= RISK_THRESHOLDS.high) return 'high';
  return 'critical';
}

/**
 * Maps a numeric score to an action recommendation.
 *
 * - low (0-25)            -> allow
 * - medium (26-50)        -> review
 * - high/critical (51+)   -> block
 */
export function getRecommendation(score: number): FraudScore['recommendation'] {
  const level = getLevelFromScore(score);
  switch (level) {
    case 'low':
      return 'allow';
    case 'medium':
      return 'review';
    case 'high':
    case 'critical':
      return 'block';
  }
}

/**
 * Calculates a comprehensive fraud risk score by evaluating all 10 signals
 * against the provided parameters. Each triggered signal contributes its
 * weight to the total score (clamped to 0-100).
 *
 * @param params  The user, listing, and behavior data to evaluate.
 * @returns       A FraudScore with the numeric score, level, recommendation,
 *                and the full list of signals with their triggered status.
 */
export function calculateFraudScore(params: FraudCheckParams): FraudScore {
  const signals: FraudSignal[] = SIGNAL_DEFINITIONS.map((def) => {
    const triggered = def.check(params);
    return {
      signal: def.signal,
      weight: def.weight,
      description: def.description,
      triggered,
    };
  });

  // Sum only triggered signal weights
  const rawScore = signals
    .filter((s) => s.triggered)
    .reduce((sum, s) => sum + s.weight, 0);

  const score = clamp(Math.round(rawScore), 0, 100);
  const level = getLevelFromScore(score);
  const recommendation = getRecommendation(score);

  return { score, level, signals, recommendation };
}
