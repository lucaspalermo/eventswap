import { describe, it, expect } from 'vitest';
import {
  calculateFraudScore,
  getLevelFromScore,
  getRecommendation,
  type FraudCheckParams,
} from '@/lib/fraud-scoring';

// ============================================================================
// Fraud Score Level Tests
// ============================================================================

describe('getLevelFromScore', () => {
  it('should return low for score 0-25', () => {
    expect(getLevelFromScore(0)).toBe('low');
    expect(getLevelFromScore(15)).toBe('low');
    expect(getLevelFromScore(25)).toBe('low');
  });

  it('should return medium for score 26-50', () => {
    expect(getLevelFromScore(26)).toBe('medium');
    expect(getLevelFromScore(40)).toBe('medium');
    expect(getLevelFromScore(50)).toBe('medium');
  });

  it('should return high for score 51-75', () => {
    expect(getLevelFromScore(51)).toBe('high');
    expect(getLevelFromScore(60)).toBe('high');
    expect(getLevelFromScore(75)).toBe('high');
  });

  it('should return critical for score 76-100', () => {
    expect(getLevelFromScore(76)).toBe('critical');
    expect(getLevelFromScore(90)).toBe('critical');
    expect(getLevelFromScore(100)).toBe('critical');
  });
});

// ============================================================================
// Fraud Recommendation Tests
// ============================================================================

describe('getRecommendation', () => {
  it('should allow for low scores', () => {
    expect(getRecommendation(10)).toBe('allow');
    expect(getRecommendation(25)).toBe('allow');
  });

  it('should review for medium scores', () => {
    expect(getRecommendation(30)).toBe('review');
    expect(getRecommendation(50)).toBe('review');
  });

  it('should block for high scores', () => {
    expect(getRecommendation(60)).toBe('block');
    expect(getRecommendation(100)).toBe('block');
  });
});

// ============================================================================
// Fraud Score Calculation Tests
// ============================================================================

describe('calculateFraudScore', () => {
  const safeUser: FraudCheckParams = {
    accountCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    hasKyc: true,
    hasProfilePhoto: true,
    profileCity: 'São Paulo',
    askingPrice: 8000,
    originalPrice: 10000,
    description: 'Buffet completo para casamento com entrada, prato principal, sobremesas e bebidas não alcoólicas. Inclui mesa de doces e decoração.',
    listingCity: 'São Paulo',
    imageHashes: ['hash1', 'hash2'],
    listingsCreatedToday: 1,
    transactionsLast24h: 0,
    transactionAmount: 8000,
  };

  it('should return low score for safe user', () => {
    const result = calculateFraudScore(safeUser);
    expect(result.level).toBe('low');
    expect(result.recommendation).toBe('allow');
    expect(result.score).toBeLessThanOrEqual(25);
  });

  it('should flag new account', () => {
    const result = calculateFraudScore({
      ...safeUser,
      accountCreatedAt: new Date().toISOString(),
    });
    const signal = result.signals.find((s) => s.signal === 'new_account');
    expect(signal?.triggered).toBe(true);
  });

  it('should flag missing KYC', () => {
    const result = calculateFraudScore({
      ...safeUser,
      hasKyc: false,
    });
    const signal = result.signals.find((s) => s.signal === 'no_kyc');
    expect(signal?.triggered).toBe(true);
  });

  it('should flag price anomaly (too cheap)', () => {
    const result = calculateFraudScore({
      ...safeUser,
      askingPrice: 1000,
      originalPrice: 10000,
    });
    const signal = result.signals.find((s) => s.signal === 'price_anomaly');
    expect(signal?.triggered).toBe(true);
  });

  it('should NOT flag reasonable discount', () => {
    const result = calculateFraudScore({
      ...safeUser,
      askingPrice: 7000,
      originalPrice: 10000,
    });
    const signal = result.signals.find((s) => s.signal === 'price_anomaly');
    expect(signal?.triggered).toBe(false);
  });

  it('should flag high value transactions', () => {
    const result = calculateFraudScore({
      ...safeUser,
      transactionAmount: 60000,
      askingPrice: 60000,
    });
    const signal = result.signals.find((s) => s.signal === 'high_value');
    expect(signal?.triggered).toBe(true);
  });

  it('should flag rapid transactions', () => {
    const result = calculateFraudScore({
      ...safeUser,
      transactionsLast24h: 5,
    });
    const signal = result.signals.find((s) => s.signal === 'rapid_transactions');
    expect(signal?.triggered).toBe(true);
  });

  it('should flag multiple listings same day', () => {
    const result = calculateFraudScore({
      ...safeUser,
      listingsCreatedToday: 5,
    });
    const signal = result.signals.find((s) => s.signal === 'multiple_listings_same_day');
    expect(signal?.triggered).toBe(true);
  });

  it('should flag generic description', () => {
    const result = calculateFraudScore({
      ...safeUser,
      description: 'Vendo reserva',
    });
    const signal = result.signals.find((s) => s.signal === 'generic_description');
    expect(signal?.triggered).toBe(true);
  });

  it('should flag missing avatar', () => {
    const result = calculateFraudScore({
      ...safeUser,
      hasProfilePhoto: false,
    });
    const signal = result.signals.find((s) => s.signal === 'no_profile_photo');
    expect(signal?.triggered).toBe(true);
  });

  it('should flag mismatched location', () => {
    const result = calculateFraudScore({
      ...safeUser,
      profileCity: 'Curitiba',
      listingCity: 'São Paulo',
    });
    const signal = result.signals.find((s) => s.signal === 'mismatched_location');
    expect(signal?.triggered).toBe(true);
  });

  it('should return high/critical score for highly suspicious user', () => {
    const result = calculateFraudScore({
      accountCreatedAt: new Date().toISOString(),
      hasKyc: false,
      hasProfilePhoto: false,
      profileCity: 'Curitiba',
      askingPrice: 500,
      originalPrice: 10000,
      description: 'Vendo',
      listingCity: 'São Paulo',
      imageHashes: [],
      listingsCreatedToday: 5,
      transactionsLast24h: 5,
      transactionAmount: 60000,
    });
    // Triggers: new_account(15) + no_kyc(25) + price_anomaly(20) + high_value(10)
    // + multiple_listings(15) + rapid_transactions(20) + mismatched(10) + no_photo(5)
    // + generic_description(10) = 130 → clamped to 100
    expect(result.score).toBeGreaterThan(50);
    expect(['high', 'critical']).toContain(result.level);
    expect(result.recommendation).toBe('block');
  });

  it('should always return score between 0 and 100', () => {
    const result = calculateFraudScore(safeUser);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should return all 10 signals', () => {
    const result = calculateFraudScore(safeUser);
    expect(result.signals).toHaveLength(10);
  });
});
