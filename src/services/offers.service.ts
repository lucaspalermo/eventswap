import type { Offer, OfferStatus } from '@/types/database.types';

// ---------------------------------------------------------------------------
// Offers Service - Client-side API calls for the offers/negotiation system
// ---------------------------------------------------------------------------

export interface CreateOfferPayload {
  listing_id: number;
  amount: number;
  message?: string;
}

export interface RespondOfferPayload {
  action: 'accept' | 'reject' | 'counter';
  counter_amount?: number;
  counter_message?: string;
}

export interface GetOffersParams {
  listing_id?: number;
  status?: OfferStatus;
  role?: 'buyer' | 'seller';
  page?: number;
  per_page?: number;
}

export interface OffersResponse {
  data: Offer[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export const offersService = {
  /**
   * Fetch offers with optional filters (listing_id, status, role).
   */
  async getOffers(params?: GetOffersParams): Promise<OffersResponse> {
    const searchParams = new URLSearchParams();

    if (params?.listing_id) searchParams.set('listing_id', String(params.listing_id));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));

    const queryString = searchParams.toString();
    const url = queryString ? `/api/offers?${queryString}` : '/api/offers';

    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Falha ao buscar ofertas');
    }

    return json;
  },

  /**
   * Create a new offer on a listing.
   */
  async createOffer(data: CreateOfferPayload): Promise<Offer> {
    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Falha ao criar oferta');
    }

    return json.data;
  },

  /**
   * Respond to an offer (accept, reject, or counter).
   */
  async respondToOffer(
    offerId: number,
    action: 'accept' | 'reject' | 'counter',
    counterAmount?: number,
    counterMessage?: string
  ): Promise<Offer> {
    const body: RespondOfferPayload = { action };
    if (counterAmount !== undefined) body.counter_amount = counterAmount;
    if (counterMessage) body.counter_message = counterMessage;

    const res = await fetch(`/api/offers/${offerId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Falha ao responder oferta');
    }

    return json.data;
  },
};
