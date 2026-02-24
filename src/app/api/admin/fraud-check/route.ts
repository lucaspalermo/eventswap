import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateFraudScore, type FraudCheckParams } from '@/lib/fraud-scoring';
import { createLogger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Admin Fraud Check API
// GET - Score a specific user or listing for fraud risk
//   ?user_id=xxx   - Check a user's fraud risk across all their activity
//   ?listing_id=xxx - Check a specific listing's fraud risk
// ---------------------------------------------------------------------------

const logger = createLogger('admin:fraud-check');

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // ---------- Authentication ----------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn('Unauthenticated fraud check attempt');
    return NextResponse.json(
      { error: 'Autenticacao necessaria' },
      { status: 401 }
    );
  }

  // ---------- Authorization (ADMIN / SUPER_ADMIN) ----------
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminProfile || !['ADMIN', 'SUPER_ADMIN'].includes(adminProfile.role)) {
    logger.warn('Unauthorized fraud check attempt', { userId: user.id, role: adminProfile?.role });
    return NextResponse.json(
      { error: 'Acesso nao autorizado' },
      { status: 403 }
    );
  }

  // ---------- Query parameters ----------
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  const listingId = searchParams.get('listing_id');

  if (!userId && !listingId) {
    return NextResponse.json(
      { error: 'Parametro obrigatorio: user_id ou listing_id' },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  try {
    if (listingId) {
      return await handleListingCheck(adminClient, listingId);
    }
    return await handleUserCheck(adminClient, userId!);
  } catch (err) {
    logger.error('Unexpected error during fraud check', {
      error: err instanceof Error ? err.message : String(err),
      userId,
      listingId,
    });
    return NextResponse.json(
      { error: 'Erro interno ao processar verificacao de fraude' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Check by listing_id
// ---------------------------------------------------------------------------

async function handleListingCheck(
  adminClient: ReturnType<typeof createAdminClient>,
  listingId: string
) {
  // Fetch the listing
  const { data: listing, error: listingError } = await adminClient
    .from('listings')
    .select('*')
    .eq('id', parseInt(listingId, 10))
    .single();

  if (listingError || !listing) {
    logger.warn('Listing not found for fraud check', { listingId });
    return NextResponse.json(
      { error: 'Anuncio nao encontrado' },
      { status: 404 }
    );
  }

  const sellerId = listing.seller_id as string;

  // Fetch the seller profile
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', sellerId)
    .single();

  if (profileError || !profile) {
    logger.warn('Seller profile not found for fraud check', { sellerId, listingId });
    return NextResponse.json(
      { error: 'Perfil do vendedor nao encontrado' },
      { status: 404 }
    );
  }

  // Count listings created today by this seller
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: listingsToday } = await adminClient
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', sellerId)
    .gte('created_at', todayStart.toISOString());

  // Count transactions in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count: recentTransactions } = await adminClient
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .or(`buyer_id.eq.${sellerId},seller_id.eq.${sellerId}`)
    .gte('created_at', twentyFourHoursAgo);

  // Fetch image URLs from other active listings by different sellers
  // to check for potential duplicate images
  const images = (listing.images as string[]) ?? [];
  const imageHashes = images.map((url: string) => normalizeImageUrl(url));

  let otherListingImageHashes: string[][] = [];
  if (imageHashes.length > 0) {
    const { data: otherListings } = await adminClient
      .from('listings')
      .select('images')
      .neq('id', listing.id)
      .neq('seller_id', sellerId)
      .in('status', ['ACTIVE', 'PENDING_REVIEW', 'RESERVED'])
      .not('images', 'is', null)
      .limit(200);

    if (otherListings) {
      otherListingImageHashes = otherListings
        .map((l: Record<string, unknown>) => {
          const imgs = (l.images as string[]) ?? [];
          return imgs.map((url: string) => normalizeImageUrl(url));
        })
        .filter((hashes: string[]) => hashes.length > 0);
    }
  }

  // Build fraud check params
  const params: FraudCheckParams = {
    accountCreatedAt: profile.created_at as string,
    hasKyc: profile.kyc_status === 'APPROVED',
    hasProfilePhoto: !!(profile.avatar_url as string | null),
    profileCity: (profile.address_city as string | null) ?? null,
    askingPrice: (listing.asking_price as number) ?? 0,
    originalPrice: (listing.original_price as number) ?? 0,
    listingCity: (listing.venue_city as string | null) ?? null,
    description: (listing.description as string | null) ?? null,
    imageHashes,
    otherListingImageHashes,
    listingsCreatedToday: listingsToday ?? 0,
    transactionsLast24h: recentTransactions ?? 0,
    transactionAmount: (listing.asking_price as number) ?? 0,
  };

  const fraudScore = calculateFraudScore(params);

  logger.info('Fraud check completed for listing', {
    listingId,
    sellerId,
    score: fraudScore.score,
    level: fraudScore.level,
    recommendation: fraudScore.recommendation,
  });

  return NextResponse.json({
    target: 'listing',
    listing_id: listing.id,
    seller_id: sellerId,
    seller_name: (profile.name as string) ?? null,
    fraud_score: fraudScore,
  });
}

// ---------------------------------------------------------------------------
// Check by user_id
// ---------------------------------------------------------------------------

async function handleUserCheck(
  adminClient: ReturnType<typeof createAdminClient>,
  userId: string
) {
  // Fetch the user profile
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    logger.warn('User not found for fraud check', { userId });
    return NextResponse.json(
      { error: 'Usuario nao encontrado' },
      { status: 404 }
    );
  }

  // Count listings created today by this user
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: listingsToday } = await adminClient
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .gte('created_at', todayStart.toISOString());

  // Count transactions in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count: recentTransactions } = await adminClient
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .gte('created_at', twentyFourHoursAgo);

  // Fetch the user's most recent active listing to use for listing-specific signals
  const { data: recentListing } = await adminClient
    .from('listings')
    .select('*')
    .eq('seller_id', userId)
    .in('status', ['ACTIVE', 'PENDING_REVIEW', 'DRAFT'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Build listing-specific params if a listing exists
  let listingCity: string | null = null;
  let askingPrice: number | undefined;
  let originalPrice: number | undefined;
  let description: string | null = null;
  let imageHashes: string[] = [];
  let otherListingImageHashes: string[][] = [];

  if (recentListing) {
    listingCity = (recentListing.venue_city as string | null) ?? null;
    askingPrice = (recentListing.asking_price as number) ?? undefined;
    originalPrice = (recentListing.original_price as number) ?? undefined;
    description = (recentListing.description as string | null) ?? null;

    const images = (recentListing.images as string[]) ?? [];
    imageHashes = images.map((url: string) => normalizeImageUrl(url));

    if (imageHashes.length > 0) {
      const { data: otherListings } = await adminClient
        .from('listings')
        .select('images')
        .neq('id', recentListing.id)
        .neq('seller_id', userId)
        .in('status', ['ACTIVE', 'PENDING_REVIEW', 'RESERVED'])
        .not('images', 'is', null)
        .limit(200);

      if (otherListings) {
        otherListingImageHashes = otherListings
          .map((l: Record<string, unknown>) => {
            const imgs = (l.images as string[]) ?? [];
            return imgs.map((url: string) => normalizeImageUrl(url));
          })
          .filter((hashes: string[]) => hashes.length > 0);
      }
    }
  }

  // Fetch the user's highest-value transaction for high_value signal
  const { data: largestTransaction } = await adminClient
    .from('transactions')
    .select('agreed_price')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('agreed_price', { ascending: false })
    .limit(1)
    .single();

  const transactionAmount = (largestTransaction?.agreed_price as number) ?? askingPrice ?? 0;

  // Build fraud check params
  const params: FraudCheckParams = {
    accountCreatedAt: profile.created_at as string,
    hasKyc: profile.kyc_status === 'APPROVED',
    hasProfilePhoto: !!(profile.avatar_url as string | null),
    profileCity: (profile.address_city as string | null) ?? null,
    askingPrice,
    originalPrice,
    listingCity,
    description,
    imageHashes,
    otherListingImageHashes,
    listingsCreatedToday: listingsToday ?? 0,
    transactionsLast24h: recentTransactions ?? 0,
    transactionAmount,
  };

  const fraudScore = calculateFraudScore(params);

  logger.info('Fraud check completed for user', {
    userId,
    score: fraudScore.score,
    level: fraudScore.level,
    recommendation: fraudScore.recommendation,
  });

  return NextResponse.json({
    target: 'user',
    user_id: userId,
    user_name: (profile.name as string) ?? null,
    user_email: (profile.email as string) ?? null,
    listing_evaluated: recentListing ? (recentListing.id as number) : null,
    fraud_score: fraudScore,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a Supabase storage URL to a comparable "hash" by stripping
 * query parameters and protocol. This provides a simple duplicate-image
 * check based on URL identity. For true perceptual hashing, integrate an
 * image-hashing service.
 */
function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove query params (signed URL tokens) and use path only
    return parsed.hostname + parsed.pathname;
  } catch {
    // If URL parsing fails, use the raw string trimmed
    return url.trim().toLowerCase();
  }
}
