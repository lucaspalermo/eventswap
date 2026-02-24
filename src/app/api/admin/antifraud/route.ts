import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  scoreListingFraud,
  scoreTransactionFraud,
  type ListingInput,
  type UserProfile,
  type TransactionInput,
  type FraudScore,
} from '@/lib/antifraud';

// ---------------------------------------------------------------------------
// Admin Anti-Fraud API
// GET - List flagged listings/transactions with fraud scores, sorted by risk
// ---------------------------------------------------------------------------

interface ScoredListing {
  listing: ListingInput;
  seller: UserProfile;
  fraudScore: FraudScore;
}

interface ScoredTransaction {
  transaction: TransactionInput;
  fraudScore: FraudScore;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // ---------- Authentication ----------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Autenticacao necessaria' },
      { status: 401 }
    );
  }

  // ---------- Authorization (ADMIN / SUPER_ADMIN) ----------
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Acesso nao autorizado' },
      { status: 403 }
    );
  }

  // ---------- Query parameters ----------
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'listings'; // 'listings' | 'transactions'
  const minRisk = searchParams.get('min_risk') || 'low'; // filter: only show >= this risk
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));

  const adminClient = createAdminClient();

  try {
    if (type === 'transactions') {
      return await handleTransactions(adminClient, { minRisk, page, perPage });
    }

    // Default: listings
    return await handleListings(adminClient, { minRisk, page, perPage });
  } catch (err) {
    console.error('[Admin Antifraud API] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar analise de fraude' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Listings handler
// ---------------------------------------------------------------------------

async function handleListings(
  adminClient: ReturnType<typeof createAdminClient>,
  opts: { minRisk: string; page: number; perPage: number }
) {
  // Fetch recent listings with seller profiles
  const { data: listings, error: listingsError } = await adminClient
    .from('listings')
    .select('*, seller:profiles!seller_id(id, created_at, is_verified, kyc_status)')
    .in('status', ['ACTIVE', 'DRAFT', 'PENDING_REVIEW'])
    .order('created_at', { ascending: false })
    .limit(200); // Fetch a larger batch to score and filter

  if (listingsError) {
    console.error('[Admin Antifraud API] Listings fetch error:', listingsError);
    return NextResponse.json(
      { error: 'Erro ao buscar anuncios', details: listingsError.message },
      { status: 500 }
    );
  }

  if (!listings || listings.length === 0) {
    return NextResponse.json({
      data: [],
      pagination: { page: 1, per_page: opts.perPage, total: 0, total_pages: 0, has_next: false, has_prev: false },
    });
  }

  // Build listing inputs for scoring
  const listingInputs: ListingInput[] = listings.map((l: Record<string, unknown>) => ({
    id: l.id as number,
    title: (l.title as string) || '',
    description: (l.description as string) || null,
    asking_price: (l.asking_price as number) || 0,
    original_price: (l.original_price as number) || 0,
    images: (l.images as string[]) || null,
    event_date: (l.event_date as string) || '',
    created_at: (l.created_at as string) || '',
    status: (l.status as string) || '',
  }));

  // Fetch completed transaction counts per seller for trust bonus
  const sellerIds = Array.from(new Set(listings.map((l: Record<string, unknown>) => l.seller_id as string)));

  const { data: transactionCounts } = await adminClient
    .from('transactions')
    .select('seller_id')
    .in('seller_id', sellerIds)
    .eq('status', 'COMPLETED');

  const completedCountMap: Record<string, number> = {};
  if (transactionCounts) {
    for (const t of transactionCounts) {
      const sid = t.seller_id as string;
      completedCountMap[sid] = (completedCountMap[sid] || 0) + 1;
    }
  }

  // Score each listing
  const scoredListings: ScoredListing[] = listings.map((l: Record<string, unknown>, idx: number) => {
    const sellerData = l.seller as Record<string, unknown> | null;
    const sellerId = l.seller_id as string;

    const userProfile: UserProfile = {
      id: sellerData?.id as string ?? sellerId,
      created_at: sellerData?.created_at as string ?? '',
      is_verified: (sellerData?.is_verified as boolean) ?? false,
      kyc_status: (sellerData?.kyc_status as string) ?? null,
      completed_transactions_count: completedCountMap[sellerId] ?? 0,
    };

    const fraudScore = scoreListingFraud(listingInputs[idx], userProfile, listingInputs);

    return {
      listing: listingInputs[idx],
      seller: userProfile,
      fraudScore,
    };
  });

  // Filter by minimum risk level
  const riskOrder = ['low', 'medium', 'high', 'critical'];
  const minRiskIndex = riskOrder.indexOf(opts.minRisk);
  const filtered = minRiskIndex > 0
    ? scoredListings.filter((s) => riskOrder.indexOf(s.fraudScore.risk) >= minRiskIndex)
    : scoredListings;

  // Sort by score descending (highest risk first)
  filtered.sort((a, b) => b.fraudScore.score - a.fraudScore.score);

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / opts.perPage);
  const offset = (opts.page - 1) * opts.perPage;
  const pageData = filtered.slice(offset, offset + opts.perPage);

  return NextResponse.json({
    data: pageData,
    pagination: {
      page: opts.page,
      per_page: opts.perPage,
      total,
      total_pages: totalPages,
      has_next: opts.page < totalPages,
      has_prev: opts.page > 1,
    },
  });
}

// ---------------------------------------------------------------------------
// Transactions handler
// ---------------------------------------------------------------------------

async function handleTransactions(
  adminClient: ReturnType<typeof createAdminClient>,
  opts: { minRisk: string; page: number; perPage: number }
) {
  // Fetch recent transactions
  const { data: transactions, error: txError } = await adminClient
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (txError) {
    console.error('[Admin Antifraud API] Transactions fetch error:', txError);
    return NextResponse.json(
      { error: 'Erro ao buscar transacoes', details: txError.message },
      { status: 500 }
    );
  }

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({
      data: [],
      pagination: { page: 1, per_page: opts.perPage, total: 0, total_pages: 0, has_next: false, has_prev: false },
    });
  }

  // Score each transaction
  const scoredTransactions: ScoredTransaction[] = transactions.map((t: Record<string, unknown>) => {
    const transactionInput: TransactionInput = {
      id: t.id as number,
      amount: (t.amount as number) || 0,
      listing_price: (t.listing_price as number) || 0,
      created_at: (t.created_at as string) || '',
      buyer_ip: (t.buyer_ip as string) || null,
      seller_ip: (t.seller_ip as string) || null,
      failed_payment_attempts: (t.failed_payment_attempts as number) || 0,
      buyer_first_viewed_at: (t.buyer_first_viewed_at as string) || null,
    };

    const buyerProfile = {
      id: (t.buyer_id as string) || '',
      ip: transactionInput.buyer_ip,
    };

    const sellerProfile = {
      id: (t.seller_id as string) || '',
      ip: transactionInput.seller_ip,
    };

    const fraudScore = scoreTransactionFraud(transactionInput, buyerProfile, sellerProfile);

    return { transaction: transactionInput, fraudScore };
  });

  // Filter by minimum risk level
  const riskOrder = ['low', 'medium', 'high', 'critical'];
  const minRiskIndex = riskOrder.indexOf(opts.minRisk);
  const filtered = minRiskIndex > 0
    ? scoredTransactions.filter((s) => riskOrder.indexOf(s.fraudScore.risk) >= minRiskIndex)
    : scoredTransactions;

  // Sort by score descending (highest risk first)
  filtered.sort((a, b) => b.fraudScore.score - a.fraudScore.score);

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / opts.perPage);
  const offset = (opts.page - 1) * opts.perPage;
  const pageData = filtered.slice(offset, offset + opts.perPage);

  return NextResponse.json({
    data: pageData,
    pagination: {
      page: opts.page,
      per_page: opts.perPage,
      total,
      total_pages: totalPages,
      has_next: opts.page < totalPages,
      has_prev: opts.page > 1,
    },
  });
}
