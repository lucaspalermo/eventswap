import { describe, it, expect } from 'vitest';

// ============================================================================
// Fee Calculation Tests
// Replicates the calculateFees logic from transactions API
// ============================================================================

const PLATFORM_FEES = {
  buyerPercent: 5,
  sellerPercent: 12,
  minimumFeeReais: 2.0,
  plans: {
    gratuito: { sellerFeePercent: 12, price: 0 },
    pro: { sellerFeePercent: 8, price: 9.9 },
    business: { sellerFeePercent: 5, price: 49.9 },
  },
};

function calculateFees(agreedPrice: number, feePercent?: number) {
  const sellerFeeRate = (feePercent ?? PLATFORM_FEES.sellerPercent) / 100;
  const platformFee = Math.max(
    PLATFORM_FEES.minimumFeeReais,
    Math.round(agreedPrice * sellerFeeRate * 100) / 100
  );
  const sellerNet = Math.round((agreedPrice - platformFee) * 100) / 100;

  return { platformFee, platformFeeRate: sellerFeeRate, sellerNet };
}

function calculateBuyerTotal(agreedPrice: number) {
  const buyerFeeRate = PLATFORM_FEES.buyerPercent / 100;
  const buyerFee = Math.round(agreedPrice * buyerFeeRate * 100) / 100;
  const buyerTotal = Math.round((agreedPrice + buyerFee) * 100) / 100;
  return { buyerFee, buyerFeeRate, buyerTotal };
}

// ============================================================================
// Seller Fee Tests
// ============================================================================

describe('calculateFees (Seller Side)', () => {
  it('should calculate 12% for Gratuito plan (default)', () => {
    const { platformFee, sellerNet } = calculateFees(1000);
    expect(platformFee).toBe(120);
    expect(sellerNet).toBe(880);
  });

  it('should calculate 8% for Pro plan', () => {
    const { platformFee, sellerNet } = calculateFees(1000, 8);
    expect(platformFee).toBe(80);
    expect(sellerNet).toBe(920);
  });

  it('should calculate 5% for Business plan', () => {
    const { platformFee, sellerNet } = calculateFees(1000, 5);
    expect(platformFee).toBe(50);
    expect(sellerNet).toBe(950);
  });

  it('should enforce minimum fee of R$ 2.00', () => {
    const { platformFee } = calculateFees(10, 5); // 5% of 10 = 0.50, below minimum
    expect(platformFee).toBe(2);
  });

  it('should handle large amounts correctly', () => {
    const { platformFee, sellerNet } = calculateFees(500000, 12);
    expect(platformFee).toBe(60000);
    expect(sellerNet).toBe(440000);
  });

  it('should handle decimal prices correctly', () => {
    const { platformFee, sellerNet } = calculateFees(99.99, 12);
    expect(platformFee).toBe(12);
    expect(sellerNet).toBe(87.99);
  });

  it('should return the correct fee rate', () => {
    const { platformFeeRate } = calculateFees(1000, 8);
    expect(platformFeeRate).toBe(0.08);
  });
});

// ============================================================================
// Buyer Fee Tests
// ============================================================================

describe('calculateBuyerTotal (Buyer Side)', () => {
  it('should calculate 5% buyer fee', () => {
    const { buyerFee, buyerTotal } = calculateBuyerTotal(1000);
    expect(buyerFee).toBe(50);
    expect(buyerTotal).toBe(1050);
  });

  it('should handle large amounts', () => {
    const { buyerFee, buyerTotal } = calculateBuyerTotal(500000);
    expect(buyerFee).toBe(25000);
    expect(buyerTotal).toBe(525000);
  });

  it('should handle small amounts', () => {
    const { buyerFee, buyerTotal } = calculateBuyerTotal(50);
    expect(buyerFee).toBe(2.5);
    expect(buyerTotal).toBe(52.5);
  });

  it('should handle decimal amounts', () => {
    const { buyerFee, buyerTotal } = calculateBuyerTotal(99.99);
    expect(buyerFee).toBe(5);
    expect(buyerTotal).toBe(104.99);
  });
});

// ============================================================================
// End-to-end Fee Calculation (Full Transaction)
// ============================================================================

describe('Full Transaction Fee Calculation', () => {
  it('should correctly split a R$ 1000 transaction (Gratuito)', () => {
    const agreedPrice = 1000;
    const { buyerTotal } = calculateBuyerTotal(agreedPrice);
    const { platformFee, sellerNet } = calculateFees(agreedPrice, 12);

    expect(buyerTotal).toBe(1050); // Buyer pays R$ 1050
    expect(platformFee).toBe(120); // Platform earns R$ 120
    expect(sellerNet).toBe(880); // Seller receives R$ 880
    expect(platformFee + sellerNet).toBe(agreedPrice); // Fees + net = agreed price
  });

  it('should correctly split a R$ 5000 transaction (Pro)', () => {
    const agreedPrice = 5000;
    const { buyerTotal } = calculateBuyerTotal(agreedPrice);
    const { platformFee, sellerNet } = calculateFees(agreedPrice, 8);

    expect(buyerTotal).toBe(5250);
    expect(platformFee).toBe(400);
    expect(sellerNet).toBe(4600);
    expect(platformFee + sellerNet).toBe(agreedPrice);
  });

  it('should correctly split a R$ 50000 transaction (Business)', () => {
    const agreedPrice = 50000;
    const { buyerTotal } = calculateBuyerTotal(agreedPrice);
    const { platformFee, sellerNet } = calculateFees(agreedPrice, 5);

    expect(buyerTotal).toBe(52500);
    expect(platformFee).toBe(2500);
    expect(sellerNet).toBe(47500);
    expect(platformFee + sellerNet).toBe(agreedPrice);
  });
});
