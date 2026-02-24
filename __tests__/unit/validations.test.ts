import { describe, it, expect } from 'vitest';
import {
  createListingSchema,
  createOfferSchema,
  respondOfferSchema,
  createTransactionSchema,
  createDisputeSchema,
  submitKycSchema,
  walletWithdrawSchema,
  subscribePlanSchema,
  pricingSuggestSchema,
  createApiKeySchema,
  asaasWebhookSchema,
  escrowReleaseSchema,
  sendMessageSchema,
  validateBody,
} from '@/lib/validations';

// ============================================================================
// Listing Validation
// ============================================================================

describe('createListingSchema', () => {
  const validListing = {
    title: 'Buffet Premium para Casamento',
    description: 'Buffet completo com entrada, pratos principais e sobremesas para casamento.',
    category: 'BUFFET',
    event_date: '2026-06-15',
    venue_name: 'Espaco Celebrar',
    venue_city: 'São Paulo',
    original_price: 15000,
    asking_price: 10000,
  };

  it('should accept valid listing data', () => {
    const result = createListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('should reject title shorter than 5 chars', () => {
    const result = createListingSchema.safeParse({ ...validListing, title: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('should reject title longer than 120 chars', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      title: 'A'.repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid category', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      category: 'INVALID_CATEGORY',
    });
    expect(result.success).toBe(false);
  });

  it('should reject price below 50', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      asking_price: 10,
    });
    expect(result.success).toBe(false);
  });

  it('should reject price above 500000', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      asking_price: 600000,
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional fields as null', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      provider_name: null,
      provider_phone: null,
      transfer_conditions: null,
    });
    expect(result.success).toBe(true);
  });

  it('should coerce string prices to numbers', () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      asking_price: '10000',
      original_price: '15000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.asking_price).toBe(10000);
      expect(result.data.original_price).toBe(15000);
    }
  });

  it('should default boolean fields to false', () => {
    const result = createListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_negotiable).toBe(false);
      expect(result.data.has_original_contract).toBe(false);
      expect(result.data.vendor_approves_transfer).toBe(false);
    }
  });
});

// ============================================================================
// Transaction Validation
// ============================================================================

describe('createTransactionSchema', () => {
  it('should accept valid transaction', () => {
    const result = createTransactionSchema.safeParse({
      listing_id: 42,
      payment_method: 'PIX',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing listing_id', () => {
    const result = createTransactionSchema.safeParse({
      payment_method: 'PIX',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid payment method', () => {
    const result = createTransactionSchema.safeParse({
      listing_id: 1,
      payment_method: 'BITCOIN',
    });
    expect(result.success).toBe(false);
  });

  it('should coerce string listing_id to number', () => {
    const result = createTransactionSchema.safeParse({
      listing_id: '42',
      payment_method: 'BOLETO',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.listing_id).toBe(42);
    }
  });
});

// ============================================================================
// Offer Validation
// ============================================================================

describe('createOfferSchema', () => {
  it('should accept valid offer', () => {
    const result = createOfferSchema.safeParse({
      listing_id: 1,
      amount: 5000,
      message: 'Tenho interesse!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject amount below 50', () => {
    const result = createOfferSchema.safeParse({
      listing_id: 1,
      amount: 10,
    });
    expect(result.success).toBe(false);
  });

  it('should accept offer without message', () => {
    const result = createOfferSchema.safeParse({
      listing_id: 1,
      amount: 5000,
    });
    expect(result.success).toBe(true);
  });
});

describe('respondOfferSchema', () => {
  it('should accept accept action', () => {
    const result = respondOfferSchema.safeParse({ action: 'accept' });
    expect(result.success).toBe(true);
  });

  it('should accept reject action', () => {
    const result = respondOfferSchema.safeParse({ action: 'reject' });
    expect(result.success).toBe(true);
  });

  it('should accept counter with amount', () => {
    const result = respondOfferSchema.safeParse({
      action: 'counter',
      counter_amount: 8000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject counter without amount', () => {
    const result = respondOfferSchema.safeParse({
      action: 'counter',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid action', () => {
    const result = respondOfferSchema.safeParse({ action: 'delete' });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Dispute Validation
// ============================================================================

describe('createDisputeSchema', () => {
  it('should accept valid dispute', () => {
    const result = createDisputeSchema.safeParse({
      transaction_id: 1,
      reason: 'listing_mismatch',
      description: 'O servico nao corresponde ao que foi anunciado. A descricao falava de buffet completo.',
    });
    expect(result.success).toBe(true);
  });

  it('should reject description under 50 chars', () => {
    const result = createDisputeSchema.safeParse({
      transaction_id: 1,
      reason: 'listing_mismatch',
      description: 'Muito curto.',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid reason', () => {
    const result = createDisputeSchema.safeParse({
      transaction_id: 1,
      reason: 'just_because',
      description: 'A'.repeat(60),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// KYC Validation
// ============================================================================

describe('submitKycSchema', () => {
  it('should accept valid KYC submission', () => {
    const result = submitKycSchema.safeParse({
      document_type: 'RG',
      document_front_url: 'https://example.com/front.jpg',
      selfie_url: 'https://example.com/selfie.jpg',
      cpf: '123.456.789-00',
      full_name: 'João da Silva',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // CPF should be stripped to digits
      expect(result.data.cpf).toBe('12345678900');
    }
  });

  it('should reject invalid CPF format', () => {
    const result = submitKycSchema.safeParse({
      document_type: 'RG',
      document_front_url: 'https://example.com/front.jpg',
      selfie_url: 'https://example.com/selfie.jpg',
      cpf: '12345',
      full_name: 'João',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Wallet Validation
// ============================================================================

describe('walletWithdrawSchema', () => {
  it('should accept valid amount', () => {
    const result = walletWithdrawSchema.safeParse({ amount: 500 });
    expect(result.success).toBe(true);
  });

  it('should reject amount below 10', () => {
    const result = walletWithdrawSchema.safeParse({ amount: 5 });
    expect(result.success).toBe(false);
  });

  it('should reject amount above 100000', () => {
    const result = walletWithdrawSchema.safeParse({ amount: 200000 });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Plan Subscription Validation
// ============================================================================

describe('subscribePlanSchema', () => {
  it('should accept pro plan', () => {
    const result = subscribePlanSchema.safeParse({ plan: 'pro', listing_id: 1 });
    expect(result.success).toBe(true);
  });

  it('should accept business plan', () => {
    const result = subscribePlanSchema.safeParse({ plan: 'business', listing_id: 5 });
    expect(result.success).toBe(true);
  });

  it('should reject gratuito plan (not subscribable)', () => {
    const result = subscribePlanSchema.safeParse({ plan: 'gratuito', listing_id: 1 });
    expect(result.success).toBe(false);
  });

  it('should reject missing listing_id', () => {
    const result = subscribePlanSchema.safeParse({ plan: 'pro' });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Webhook Validation
// ============================================================================

describe('asaasWebhookSchema', () => {
  it('should accept valid payment webhook', () => {
    const result = asaasWebhookSchema.safeParse({
      event: 'PAYMENT_CONFIRMED',
      payment: {
        id: 'pay_abc123',
        customer: 'cus_xyz',
        value: 1050,
        status: 'CONFIRMED',
        billingType: 'PIX',
        externalReference: '42',
      },
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid transfer webhook', () => {
    const result = asaasWebhookSchema.safeParse({
      event: 'TRANSFER_DONE',
      transfer: {
        id: 'tr_abc123',
        value: 880,
        status: 'DONE',
        externalReference: '42',
      },
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing event type', () => {
    const result = asaasWebhookSchema.safeParse({
      payment: { id: 'pay_abc123' },
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Chat Message Validation
// ============================================================================

describe('sendMessageSchema', () => {
  it('should accept valid message', () => {
    const result = sendMessageSchema.safeParse({
      conversation_id: 1,
      content: 'Olá, tenho interesse!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty message', () => {
    const result = sendMessageSchema.safeParse({
      conversation_id: 1,
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject message over 2000 chars', () => {
    const result = sendMessageSchema.safeParse({
      conversation_id: 1,
      content: 'A'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Escrow Validation
// ============================================================================

describe('escrowReleaseSchema', () => {
  it('should accept valid transaction_id', () => {
    const result = escrowReleaseSchema.safeParse({ transaction_id: 42 });
    expect(result.success).toBe(true);
  });

  it('should coerce string to number', () => {
    const result = escrowReleaseSchema.safeParse({ transaction_id: '42' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transaction_id).toBe(42);
    }
  });

  it('should reject negative id', () => {
    const result = escrowReleaseSchema.safeParse({ transaction_id: -1 });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// validateBody helper
// ============================================================================

describe('validateBody', () => {
  it('should return success with typed data on valid input', () => {
    const result = validateBody(walletWithdrawSchema, { amount: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(100);
    }
  });

  it('should return error response on invalid input', () => {
    const result = validateBody(walletWithdrawSchema, { amount: -5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
    }
  });
});
