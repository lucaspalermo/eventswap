// Asaas API client for EventSwap
// Docs: https://docs.asaas.com

const ASAAS_API_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export const COMMISSION_RATE = 0.08; // 8% platform commission

// Types for Asaas API
export type AsaasBillingType = 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
export type AsaasPaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'REFUND_IN_PROGRESS'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS';

export type AsaasTransferStatus = 'PENDING' | 'BANK_PROCESSING' | 'DONE' | 'CANCELLED' | 'FAILED';

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  externalReference?: string;
}

export interface AsaasPayment {
  id?: string;
  customer: string; // customer ID
  billingType: AsaasBillingType;
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string; // our transaction ID
  postalService?: boolean;
  // PIX
  pixQrCode?: { payload: string; expirationDate: string };
  // Boleto
  bankSlipUrl?: string;
  invoiceUrl?: string;
  // Credit Card
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  // Response fields
  status?: AsaasPaymentStatus;
  invoiceNumber?: string;
  confirmedDate?: string;
  paymentDate?: string;
  netValue?: number;
}

export interface AsaasTransfer {
  id?: string;
  value: number;
  bankAccount?: {
    bank: { code: string };
    accountName: string;
    ownerName: string;
    cpfCnpj: string;
    agency: string;
    account: string;
    accountDigit: string;
    bankAccountType: 'CONTA_CORRENTE' | 'CONTA_POUPANCA';
  };
  operationType: 'PIX' | 'TED' | 'INTERNAL';
  pixAddressKey?: string;
  pixAddressKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  description?: string;
  externalReference?: string;
  status?: AsaasTransferStatus;
}

export interface AsaasPixQrCode {
  encodedImage: string; // base64 encoded QR code image
  payload: string; // PIX copy-paste code
  expirationDate: string;
}

export interface AsaasWebhookEvent {
  event: string;
  payment?: {
    id: string;
    customer: string;
    billingType: AsaasBillingType;
    value: number;
    netValue: number;
    status: AsaasPaymentStatus;
    externalReference: string;
    confirmedDate?: string;
    paymentDate?: string;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    description?: string;
  };
  transfer?: {
    id: string;
    value: number;
    netValue: number;
    status: AsaasTransferStatus;
    externalReference: string;
    transferDate?: string;
  };
}

// API helper
async function asaasRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ASAAS_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      'User-Agent': 'EventSwap/1.0',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Asaas] ${options.method || 'GET'} ${endpoint} failed:`, response.status, errorBody);
    throw new Error(`Asaas API error: ${response.status} - ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

// ============================================================================
// Customer API
// ============================================================================

export const asaasCustomers = {
  async create(data: AsaasCustomer): Promise<AsaasCustomer & { id: string }> {
    return asaasRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async findByExternalReference(ref: string): Promise<{ data: (AsaasCustomer & { id: string })[] }> {
    return asaasRequest(`/customers?externalReference=${encodeURIComponent(ref)}`);
  },

  async getOrCreate(data: AsaasCustomer): Promise<AsaasCustomer & { id: string }> {
    // Try to find existing customer by CPF
    if (data.cpfCnpj) {
      const existing = await asaasRequest<{ data: (AsaasCustomer & { id: string })[] }>(
        `/customers?cpfCnpj=${data.cpfCnpj}`
      );
      if (existing.data && existing.data.length > 0) {
        return existing.data[0];
      }
    }
    return this.create(data);
  },
};

// ============================================================================
// Payment API
// ============================================================================

export const asaasPayments = {
  async create(data: Omit<AsaasPayment, 'id' | 'status'>): Promise<AsaasPayment & { id: string }> {
    return asaasRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getById(paymentId: string): Promise<AsaasPayment & { id: string }> {
    return asaasRequest(`/payments/${paymentId}`);
  },

  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return asaasRequest(`/payments/${paymentId}/pixQrCode`);
  },

  async refund(paymentId: string, value?: number): Promise<AsaasPayment> {
    return asaasRequest(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(value ? { value } : {}),
    });
  },

  async cancel(paymentId: string): Promise<AsaasPayment> {
    return asaasRequest(`/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Transfer API (payout to seller)
// ============================================================================

export const asaasTransfers = {
  async create(data: Omit<AsaasTransfer, 'id' | 'status'>): Promise<AsaasTransfer & { id: string }> {
    return asaasRequest('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getById(transferId: string): Promise<AsaasTransfer & { id: string }> {
    return asaasRequest(`/transfers/${transferId}`);
  },
};

// ============================================================================
// Utility functions
// ============================================================================

export function calculateCommission(amount: number) {
  const platformFee = Math.round(amount * COMMISSION_RATE * 100) / 100;
  const sellerNet = Math.round((amount - platformFee) * 100) / 100;
  return {
    grossAmount: amount,
    platformFee,
    platformFeeRate: COMMISSION_RATE,
    sellerNetAmount: sellerNet,
  };
}

export function formatAsaasAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Maps Asaas payment status to our internal PaymentStatus
 */
export function mapAsaasPaymentStatus(asaasStatus: AsaasPaymentStatus): 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' {
  switch (asaasStatus) {
    case 'PENDING':
    case 'AWAITING_RISK_ANALYSIS':
      return 'PENDING';
    case 'RECEIVED':
    case 'CONFIRMED':
    case 'RECEIVED_IN_CASH':
      return 'SUCCEEDED';
    case 'REFUNDED':
    case 'REFUND_REQUESTED':
    case 'REFUND_IN_PROGRESS':
      return 'REFUNDED';
    case 'OVERDUE':
    case 'CHARGEBACK_REQUESTED':
    case 'CHARGEBACK_DISPUTE':
    case 'AWAITING_CHARGEBACK_REVERSAL':
    case 'DUNNING_REQUESTED':
    case 'DUNNING_RECEIVED':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

/**
 * Maps our billingType to Asaas format
 */
export function mapPaymentMethodToAsaas(method: 'CARD' | 'PIX' | 'BOLETO'): AsaasBillingType {
  switch (method) {
    case 'CARD': return 'CREDIT_CARD';
    case 'PIX': return 'PIX';
    case 'BOLETO': return 'BOLETO';
    default: return 'UNDEFINED';
  }
}
