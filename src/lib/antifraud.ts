// ============================================================================
// EventSwap - Anti-Fraud Scoring Engine
// Evaluates listings and transactions for fraudulent activity using
// weighted signals across price, user, listing, behavior, and document categories.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FraudSignal {
  signal: string;
  weight: number; // -100 to +100
  category: 'price' | 'user' | 'listing' | 'behavior' | 'document';
  description: string;
}

export interface FraudScore {
  score: number; // 0-100 (0 = safe, 100 = definite fraud)
  risk: 'low' | 'medium' | 'high' | 'critical';
  signals: FraudSignal[];
  recommendation: 'allow' | 'review' | 'block';
}

export interface ListingInput {
  id: number | string;
  title: string;
  description: string | null;
  asking_price: number;
  original_price: number;
  images: string[] | null;
  event_date: string;
  created_at: string;
  status: string;
}

export interface UserProfile {
  id: string;
  created_at: string;
  is_verified: boolean;
  kyc_status: string | null;
  completed_transactions_count?: number;
}

export interface TransactionInput {
  id: number | string;
  amount: number;
  listing_price: number;
  created_at: string;
  buyer_ip?: string | null;
  seller_ip?: string | null;
  failed_payment_attempts?: number;
  buyer_first_viewed_at?: string | null;
}

export interface BuyerProfile {
  id: string;
  ip?: string | null;
}

export interface SellerProfile {
  id: string;
  ip?: string | null;
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
const NEW_USER_DAYS = 7;

/** High-value listing threshold in cents (R$10.000) */
const HIGH_VALUE_THRESHOLD = 10000;

/** Minimum description length before it triggers a signal */
const MIN_DESCRIPTION_LENGTH = 50;

/** Minimum time in seconds that a purchase should take (below = suspicious) */
const FAST_PURCHASE_SECONDS = 30;

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

function isDateInPast(dateStr: string): boolean {
  const eventDate = new Date(dateStr);
  const now = new Date();
  // Zero out time components for date-only comparison
  eventDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return eventDate.getTime() < now.getTime();
}

function discountPercentage(original: number, asking: number): number {
  if (original <= 0) return 0;
  return ((original - asking) / original) * 100;
}

function accountAgeDays(createdAt: string): number {
  return daysBetween(createdAt, new Date().toISOString());
}

// ---------------------------------------------------------------------------
// Risk Calculation
// ---------------------------------------------------------------------------

/**
 * Determines the risk level based on a numeric score.
 *
 * - 0-25:   low
 * - 26-50:  medium
 * - 51-75:  high
 * - 76-100: critical
 */
export function calculateRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
  const clamped = clamp(score, 0, 100);
  if (clamped <= RISK_THRESHOLDS.low) return 'low';
  if (clamped <= RISK_THRESHOLDS.medium) return 'medium';
  if (clamped <= RISK_THRESHOLDS.high) return 'high';
  return 'critical';
}

/**
 * Maps a risk level to a recommendation action.
 *
 * - low      -> allow
 * - medium   -> review
 * - high     -> block
 * - critical -> block
 */
function riskToRecommendation(risk: 'low' | 'medium' | 'high' | 'critical'): 'allow' | 'review' | 'block' {
  switch (risk) {
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
 * Aggregates an array of fraud signals into a single FraudScore.
 * The raw sum of signal weights is clamped to the 0-100 range.
 */
function buildFraudScore(signals: FraudSignal[]): FraudScore {
  const rawScore = signals.reduce((sum, s) => sum + s.weight, 0);
  const score = clamp(Math.round(rawScore), 0, 100);
  const risk = calculateRisk(score);
  const recommendation = riskToRecommendation(risk);

  return { score, risk, signals, recommendation };
}

// ---------------------------------------------------------------------------
// Listing Fraud Scoring
// ---------------------------------------------------------------------------

/**
 * Scores a listing for potential fraud based on pricing anomalies, listing
 * quality indicators, user trustworthiness, and optional duplicate detection.
 *
 * @param listing      The listing to evaluate.
 * @param user         The seller's profile.
 * @param recentListings Optional array of recent listings to check for duplicates.
 * @returns            A FraudScore with all detected signals.
 */
export function scoreListingFraud(
  listing: ListingInput,
  user: UserProfile,
  recentListings?: ListingInput[]
): FraudScore {
  const signals: FraudSignal[] = [];

  // -------------------------------------------------------------------------
  // Price signals
  // -------------------------------------------------------------------------
  const discount = discountPercentage(listing.original_price, listing.asking_price);

  if (discount > 80) {
    signals.push({
      signal: 'extreme_discount',
      weight: 50,
      category: 'price',
      description: `Preco ${Math.round(discount)}% abaixo do original - provavel fraude`,
    });
  } else if (discount > 60) {
    signals.push({
      signal: 'suspicious_discount',
      weight: 30,
      category: 'price',
      description: `Preco ${Math.round(discount)}% abaixo do original - desconto suspeito`,
    });
  }

  // -------------------------------------------------------------------------
  // Listing quality signals
  // -------------------------------------------------------------------------
  const images = listing.images ?? [];
  if (images.length === 0) {
    signals.push({
      signal: 'no_images',
      weight: 15,
      category: 'listing',
      description: 'Anuncio sem imagens',
    });
  }

  const descriptionLength = (listing.description ?? '').trim().length;
  if (descriptionLength < MIN_DESCRIPTION_LENGTH) {
    signals.push({
      signal: 'short_description',
      weight: 10,
      category: 'listing',
      description: `Descricao muito curta (${descriptionLength} caracteres)`,
    });
  }

  // -------------------------------------------------------------------------
  // Event date signal
  // -------------------------------------------------------------------------
  if (isDateInPast(listing.event_date)) {
    signals.push({
      signal: 'past_event_date',
      weight: 40,
      category: 'listing',
      description: 'Data do evento ja passou',
    });
  }

  // -------------------------------------------------------------------------
  // User trust signals
  // -------------------------------------------------------------------------
  const ageDays = accountAgeDays(user.created_at);

  if (ageDays < NEW_USER_DAYS && listing.asking_price > HIGH_VALUE_THRESHOLD) {
    signals.push({
      signal: 'new_user_high_value',
      weight: 25,
      category: 'user',
      description: `Conta com ${ageDays} dia(s) anunciando item acima de R$ ${HIGH_VALUE_THRESHOLD.toLocaleString('pt-BR')}`,
    });
  }

  if (user.kyc_status === 'APPROVED' || user.is_verified) {
    signals.push({
      signal: 'kyc_verified',
      weight: -20,
      category: 'document',
      description: 'Usuario com KYC verificado',
    });
  }

  if ((user.completed_transactions_count ?? 0) > 0) {
    signals.push({
      signal: 'has_completed_transactions',
      weight: -15,
      category: 'user',
      description: `Usuario com ${user.completed_transactions_count} transacao(oes) concluida(s)`,
    });
  }

  // -------------------------------------------------------------------------
  // Duplicate title detection
  // -------------------------------------------------------------------------
  if (recentListings && recentListings.length > 0) {
    const normalizedTitle = listing.title.toLowerCase().trim();
    const isDuplicate = recentListings.some((other) => {
      // Skip comparing against itself
      if (String(other.id) === String(listing.id)) return false;
      return other.title.toLowerCase().trim() === normalizedTitle;
    });

    if (isDuplicate) {
      signals.push({
        signal: 'duplicate_title',
        weight: 35,
        category: 'listing',
        description: 'Titulo duplicado encontrado em anuncios recentes',
      });
    }
  }

  return buildFraudScore(signals);
}

// ---------------------------------------------------------------------------
// Transaction Fraud Scoring
// ---------------------------------------------------------------------------

/**
 * Scores a transaction for potential fraud based on IP matching, payment
 * behavior, price consistency, and purchase timing.
 *
 * @param transaction   The transaction to evaluate.
 * @param buyerProfile  The buyer's basic profile.
 * @param sellerProfile The seller's basic profile.
 * @returns             A FraudScore with all detected signals.
 */
export function scoreTransactionFraud(
  transaction: TransactionInput,
  buyerProfile: BuyerProfile,
  sellerProfile: SellerProfile
): FraudScore {
  const signals: FraudSignal[] = [];

  // -------------------------------------------------------------------------
  // Same IP signal
  // -------------------------------------------------------------------------
  if (
    buyerProfile.ip &&
    sellerProfile.ip &&
    buyerProfile.ip === sellerProfile.ip
  ) {
    signals.push({
      signal: 'same_ip',
      weight: 50,
      category: 'behavior',
      description: 'Comprador e vendedor usando o mesmo IP',
    });
  }

  // -------------------------------------------------------------------------
  // Failed payment attempts
  // -------------------------------------------------------------------------
  const failedAttempts = transaction.failed_payment_attempts ?? 0;
  if (failedAttempts > 0) {
    signals.push({
      signal: 'multiple_failed_payments',
      weight: 20,
      category: 'behavior',
      description: `${failedAttempts} tentativa(s) de pagamento falhada(s)`,
    });
  }

  // -------------------------------------------------------------------------
  // Amount mismatch
  // -------------------------------------------------------------------------
  if (
    transaction.listing_price > 0 &&
    Math.abs(transaction.amount - transaction.listing_price) > 0.01
  ) {
    signals.push({
      signal: 'amount_mismatch',
      weight: 30,
      category: 'price',
      description: `Valor da transacao (R$ ${transaction.amount.toLocaleString('pt-BR')}) diferente do anuncio (R$ ${transaction.listing_price.toLocaleString('pt-BR')})`,
    });
  }

  // -------------------------------------------------------------------------
  // Very fast purchase
  // -------------------------------------------------------------------------
  if (transaction.buyer_first_viewed_at) {
    const viewedAt = new Date(transaction.buyer_first_viewed_at).getTime();
    const purchasedAt = new Date(transaction.created_at).getTime();
    const secondsElapsed = (purchasedAt - viewedAt) / 1000;

    if (secondsElapsed >= 0 && secondsElapsed < FAST_PURCHASE_SECONDS) {
      signals.push({
        signal: 'fast_purchase',
        weight: 15,
        category: 'behavior',
        description: `Compra realizada ${Math.round(secondsElapsed)}s apos visualizacao`,
      });
    }
  }

  return buildFraudScore(signals);
}
