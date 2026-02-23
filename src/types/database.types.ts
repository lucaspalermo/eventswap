// Types matching the Supabase schema
// These will be auto-generated with `supabase gen types typescript` once connected

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'
export type KycStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED'
export type EventCategory = 'WEDDING_VENUE' | 'BUFFET' | 'PHOTOGRAPHER' | 'VIDEOGRAPHER' | 'DJ_BAND' | 'DECORATION' | 'CATERING' | 'WEDDING_DRESS' | 'BEAUTY_MAKEUP' | 'PARTY_VENUE' | 'TRANSPORT' | 'ACCOMMODATION' | 'OTHER'
export type TransactionStatus = 'INITIATED' | 'AWAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'ESCROW_HELD' | 'TRANSFER_PENDING' | 'COMPLETED' | 'DISPUTE_OPENED' | 'DISPUTE_RESOLVED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'CARD' | 'PIX' | 'BOLETO'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER' | 'CLOSED'
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'CANCELLED'
export type KycDocumentType = 'RG' | 'CNH' | 'PASSPORT'
export type KycDocumentStatus = 'pending' | 'approved' | 'rejected' | 'resubmit'
export type VerificationLevel = 'none' | 'email' | 'document' | 'full'

export interface Profile {
  id: string
  email: string
  name: string
  display_name: string | null
  phone: string | null
  cpf: string | null
  avatar_url: string | null
  role: UserRole
  kyc_status: KycStatus
  asaas_customer_id: string | null
  address_city: string | null
  address_state: string | null
  address_country: string
  rating_avg: number
  rating_count: number
  is_verified: boolean
  bio: string | null
  verification_level: VerificationLevel
  max_transaction_amount: number
  created_at: string
  updated_at: string
}

export interface Listing {
  id: number
  seller_id: string
  title: string
  description: string | null
  category: EventCategory
  event_date: string
  event_end_date: string | null
  venue_name: string
  venue_address: string | null
  venue_city: string
  venue_state: string | null
  venue_country: string
  provider_name: string | null
  provider_phone: string | null
  provider_email: string | null
  original_price: number
  asking_price: number
  paid_amount: number | null
  remaining_amount: number | null
  is_negotiable: boolean
  images: string[]
  has_original_contract: boolean
  contract_file_url: string | null
  transfer_conditions: string | null
  vendor_approves_transfer: boolean
  status: ListingStatus
  slug: string
  view_count: number
  favorite_count: number
  published_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  // Joined
  seller?: Profile
}

export interface Transaction {
  id: number
  code: string
  buyer_id: string
  seller_id: string
  listing_id: number
  agreed_price: number
  platform_fee: number
  platform_fee_rate: number
  seller_net_amount: number
  status: TransactionStatus
  payment_deadline: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
  // Joined
  buyer?: Profile
  seller?: Profile
  listing?: Listing
}

export interface Payment {
  id: number
  transaction_id: number
  payer_id: string
  payee_id: string
  asaas_payment_id: string | null
  asaas_transfer_id: string | null
  gross_amount: number
  net_amount: number | null
  gateway_fee: number | null
  method: PaymentMethod
  status: PaymentStatus
  paid_at: string | null
  refunded_at: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  transaction_id: number | null
  participant_1: string
  participant_2: string
  last_message_at: string | null
  last_message_text: string | null
  unread_count_1: number
  unread_count_2: number
  is_active: boolean
  created_at: string
  // Joined
  participant_1_profile?: Profile
  participant_2_profile?: Profile
  messages?: Message[]
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: string
  type: MessageType
  content: string
  file_url: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  // Joined
  sender?: Profile
}

export interface Notification {
  id: number
  user_id: string
  channel: string
  title: string
  body: string
  data: Record<string, unknown> | null
  action_url: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface Review {
  id: number
  transaction_id: number
  author_id: string
  target_id: string
  rating: number
  comment: string | null
  created_at: string
  // Joined
  author?: Profile
}

export interface Offer {
  id: number
  listing_id: number
  buyer_id: string
  seller_id: string
  amount: number
  counter_amount: number | null
  message: string | null
  counter_message: string | null
  status: OfferStatus
  expires_at: string
  responded_at: string | null
  created_at: string
  updated_at: string
  // Joined
  buyer?: Profile
  seller?: Profile
  listing?: Listing
}

export interface KycDocument {
  id: number
  user_id: string
  document_type: KycDocumentType
  document_front_url: string
  document_back_url: string | null
  selfie_url: string
  cpf: string
  full_name: string
  birth_date: string | null
  status: KycDocumentStatus
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  // Joined
  user?: Profile
  reviewer?: Profile
}

export interface Dispute {
  id: number
  transaction_id: number
  opened_by: string
  reason: string
  description: string
  evidence_urls: string[]
  status: DisputeStatus
  resolution: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}
