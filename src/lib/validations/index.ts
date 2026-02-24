// ============================================================================
// EventSwap - Zod Validation Schemas
// Centralized validation for all API routes
// ============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** CPF validation (11 digits, basic format check) */
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

export const cpfSchema = z
  .string()
  .regex(cpfRegex, 'CPF inválido')
  .transform((val) => val.replace(/\D/g, ''));

/** Positive number with min/max */
const positiveNumber = (min = 0, max = Infinity) =>
  z.coerce.number().min(min).max(max);

/** ISO date string */
const isoDateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Data inválida' }
);

/** Pagination params */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(12),
});

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const eventCategoryEnum = z.enum([
  'WEDDING_VENUE', 'BUFFET', 'PARTY_VENUE', 'PHOTOGRAPHER', 'DJ_BAND',
  'DECORATION', 'VIDEOGRAPHER', 'WEDDING_DRESS', 'SWEET_TABLE',
  'INVITATION', 'LIGHTING', 'CATERING', 'OTHER',
]);

export const uiCategoryEnum = z.enum([
  'casamento', 'buffet', 'espaco', 'fotografia', 'musica', 'decoracao',
  'video', 'convite', 'vestido-noiva', 'festa-infantil', 'corporativo', 'outro',
]);

export const listingStatusEnum = z.enum([
  'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'RESERVED', 'SOLD',
  'EXPIRED', 'CANCELLED', 'SUSPENDED',
]);

export const transactionStatusEnum = z.enum([
  'INITIATED', 'AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'ESCROW_HELD',
  'TRANSFER_PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED',
  'DISPUTE_OPENED', 'FAILED',
]);

export const paymentMethodEnum = z.enum(['PIX', 'BOLETO', 'CARD']);

export const offerStatusEnum = z.enum([
  'PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED', 'CANCELLED',
]);

export const kycDocTypeEnum = z.enum(['RG', 'CNH', 'PASSPORT']);

export const kycStatusEnum = z.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']);

export const disputeReasonEnum = z.enum([
  'listing_mismatch', 'transfer_rejected', 'missing_documentation',
  'payment_issues', 'other',
]);

export const planIdEnum = z.enum(['pro', 'business']);

export const sponsorPlanEnum = z.enum(['weekly', 'monthly']);

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export const createListingSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(120, 'Título deve ter no máximo 120 caracteres'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres').max(5000, 'Descrição deve ter no máximo 5000 caracteres').optional().nullable(),
  category: eventCategoryEnum,
  event_date: isoDateString,
  event_end_date: isoDateString.optional().nullable(),
  venue_name: z.string().min(2).max(200),
  venue_address: z.string().max(500).optional().nullable(),
  venue_city: z.string().min(2).max(100),
  venue_state: z.string().max(2).optional().nullable(),
  original_price: positiveNumber(50, 500000),
  asking_price: positiveNumber(50, 500000),
  paid_amount: z.coerce.number().optional().nullable(),
  remaining_amount: z.coerce.number().optional().nullable(),
  is_negotiable: z.boolean().default(false),
  has_original_contract: z.boolean().default(false),
  contract_file_url: z.string().url().optional().nullable(),
  provider_name: z.string().max(200).optional().nullable(),
  provider_phone: z.string().max(50).optional().nullable(),
  provider_email: z.string().email().optional().nullable(),
  provider_contact: z.string().max(200).optional().nullable(),
  transfer_conditions: z.string().max(2000).optional().nullable(),
  vendor_approves_transfer: z.boolean().default(false),
  images: z.array(z.string().url()).max(10).optional(),
});

export const searchListingsSchema = z.object({
  search: z.string().max(200).optional(),
  category: eventCategoryEnum.optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().max(500000).optional(),
  date_from: isoDateString.optional(),
  date_to: isoDateString.optional(),
  sort: z.string().optional(),
  status: listingStatusEnum.optional(),
  seller_id: z.string().uuid().optional(),
  ...paginationSchema.shape,
});

export const sponsorListingSchema = z.object({
  listing_id: z.coerce.number().int().positive(),
  plan: sponsorPlanEnum,
});

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export const createTransactionSchema = z.object({
  listing_id: z.coerce.number().int().positive(),
  payment_method: paymentMethodEnum,
  agreed_price: positiveNumber(50, 500000).optional(),
});

export const transactionPaymentSchema = z.object({
  payment_method: paymentMethodEnum,
});

// ---------------------------------------------------------------------------
// Offers
// ---------------------------------------------------------------------------

export const createOfferSchema = z.object({
  listing_id: z.coerce.number().int().positive(),
  amount: positiveNumber(50, 500000),
  message: z.string().max(500).optional(),
});

export const respondOfferSchema = z.object({
  action: z.enum(['accept', 'reject', 'counter']),
  counter_amount: positiveNumber(50, 500000).optional(),
  message: z.string().max(500).optional(),
}).refine(
  (data) => data.action !== 'counter' || (data.counter_amount !== undefined && data.counter_amount > 0),
  { message: 'Valor da contraproposta é obrigatório', path: ['counter_amount'] }
);

// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

export const submitKycSchema = z.object({
  document_type: kycDocTypeEnum,
  document_front_url: z.string().url('URL do documento frontal inválida'),
  document_back_url: z.string().url('URL do documento traseiro inválida').optional(),
  selfie_url: z.string().url('URL da selfie inválida'),
  cpf: cpfSchema,
  full_name: z.string().min(3).max(200),
});

export const reviewKycSchema = z.object({
  kyc_id: z.coerce.number().int().positive(),
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().max(500).optional(),
}).refine(
  (data) => data.action !== 'reject' || (data.rejection_reason && data.rejection_reason.length >= 10),
  { message: 'Motivo da rejeição é obrigatório (mínimo 10 caracteres)', path: ['rejection_reason'] }
);

// ---------------------------------------------------------------------------
// Disputes
// ---------------------------------------------------------------------------

export const createDisputeSchema = z.object({
  transaction_id: z.coerce.number().int().positive(),
  reason: disputeReasonEnum,
  description: z.string().min(50, 'Descrição deve ter pelo menos 50 caracteres').max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  evidence_urls: z.array(z.string().url()).max(5).optional(),
});

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export const sendMessageSchema = z.object({
  conversation_id: z.coerce.number().int().positive(),
  content: z.string().min(1, 'Mensagem não pode ser vazia').max(2000, 'Mensagem muito longa'),
  message_type: z.enum(['text', 'image', 'file']).default('text'),
});

export const getMessagesSchema = z.object({
  conversation_id: z.coerce.number().int().positive(),
  ...paginationSchema.shape,
});

// ---------------------------------------------------------------------------
// Escrow
// ---------------------------------------------------------------------------

export const escrowReleaseSchema = z.object({
  transaction_id: z.coerce.number().int().positive(),
});

export const escrowTransferSchema = z.object({
  transaction_id: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Payouts
// ---------------------------------------------------------------------------

export const createPayoutSchema = z.object({
  transaction_id: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export const walletWithdrawSchema = z.object({
  amount: positiveNumber(10, 100000),
});

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export const subscribePlanSchema = z.object({
  plan: planIdEnum,
  listing_id: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Pricing AI
// ---------------------------------------------------------------------------

export const pricingSuggestSchema = z.object({
  category: z.string().min(1),
  event_date: isoDateString,
  venue_city: z.string().min(2),
  original_price: positiveNumber(1),
  has_original_contract: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------

export const createApiKeySchema = z.object({
  key_name: z.string().min(1, 'Nome da chave é obrigatório').max(100, 'Máximo 100 caracteres'),
});

// ---------------------------------------------------------------------------
// Vendor Approval
// ---------------------------------------------------------------------------

export const vendorApprovalSchema = z.object({
  transaction_id: z.coerce.number().int().positive(),
  vendor_name: z.string().min(2).max(200),
  vendor_email: z.string().email('Email do fornecedor inválido'),
  vendor_phone: z.string().max(20).optional(),
});

// ---------------------------------------------------------------------------
// Admin Refund
// ---------------------------------------------------------------------------

export const adminRefundSchema = z.object({
  transaction_id: z.coerce.number().int().positive(),
  reason: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres').max(500),
});

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export const asaasWebhookSchema = z.object({
  event: z.string().min(1),
  payment: z.object({
    id: z.string(),
    customer: z.string().optional(),
    value: z.number().optional(),
    status: z.string().optional(),
    billingType: z.string().optional(),
    externalReference: z.string().nullable().optional(),
  }).optional(),
  transfer: z.object({
    id: z.string(),
    value: z.number().optional(),
    status: z.string().optional(),
    externalReference: z.string().nullable().optional(),
  }).optional(),
});

// ---------------------------------------------------------------------------
// Utility: Parse and return typed result or error response
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten();
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Dados inválidos',
          field_errors: errors.fieldErrors,
          form_errors: errors.formErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  params: URLSearchParams
): ValidationResult<T> {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });

  return validateBody(schema, obj);
}
