import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  authenticateApiKey,
  hasPermission,
  checkRateLimit,
  logApiRequest,
  generateRequestId,
} from '@/lib/api-auth';

// ============================================================================
// Public API v1 - Platform Stats
// GET: Platform public statistics (total listings, transactions, avg prices)
// ============================================================================

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Authenticate
  const auth = await authenticateApiKey(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      {
        error: { code: 'UNAUTHORIZED', message: auth.error },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 401 }
    );
  }

  // Check permission
  if (!hasPermission(auth, 'read')) {
    return NextResponse.json(
      {
        error: { code: 'FORBIDDEN', message: 'API key does not have read permission' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 403 }
    );
  }

  // Rate limit (stricter for stats endpoint)
  const rateLimit = checkRateLimit(req.headers.get('x-api-key')!, 100);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Try again later.' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const supabase = createAdminClient();

  // Fetch stats in parallel
  const [
    activeListingsResult,
    allListingsResult,
    completedTransactionsResult,
  ] = await Promise.all([
    // Active listings count
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
    // All listings for category stats
    supabase
      .from('listings')
      .select('category, asking_price')
      .eq('status', 'ACTIVE'),
    // Completed transactions count
    supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'released'),
  ]);

  const responseTimeMs = Date.now() - startTime;

  // Check for errors
  if (activeListingsResult.error || allListingsResult.error) {
    if (auth.apiKeyId) {
      logApiRequest({
        apiKeyId: auth.apiKeyId,
        method: 'GET',
        path: '/api/v1/stats',
        statusCode: 500,
        responseTimeMs,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      });
    }

    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch platform stats' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }

  // Calculate average price by category
  const categoryStats: Record<string, { count: number; total: number }> = {};
  (allListingsResult.data || []).forEach((listing) => {
    if (!categoryStats[listing.category]) {
      categoryStats[listing.category] = { count: 0, total: 0 };
    }
    categoryStats[listing.category].count++;
    categoryStats[listing.category].total += listing.asking_price || 0;
  });

  const avgPriceByCategory: Record<string, { count: number; avg_price: number }> = {};
  for (const [category, stats] of Object.entries(categoryStats)) {
    avgPriceByCategory[category] = {
      count: stats.count,
      avg_price: stats.count > 0 ? Math.round((stats.total / stats.count) * 100) / 100 : 0,
    };
  }

  // Calculate total average price
  const totalListings = allListingsResult.data?.length || 0;
  const totalPriceSum = (allListingsResult.data || []).reduce(
    (sum, l) => sum + (l.asking_price || 0),
    0
  );
  const avgPrice = totalListings > 0 ? Math.round((totalPriceSum / totalListings) * 100) / 100 : 0;

  // Log successful request
  if (auth.apiKeyId) {
    logApiRequest({
      apiKeyId: auth.apiKeyId,
      method: 'GET',
      path: '/api/v1/stats',
      statusCode: 200,
      responseTimeMs,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
    });
  }

  return NextResponse.json(
    {
      data: {
        total_active_listings: activeListingsResult.count || 0,
        total_completed_transactions: completedTransactionsResult.count || 0,
        average_price: avgPrice,
        currency: 'BRL',
        avg_price_by_category: avgPriceByCategory,
      },
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        response_time_ms: responseTimeMs,
      },
    },
    {
      status: 200,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        'X-Request-Id': requestId,
        'Cache-Control': 'public, s-maxage=300', // Cache stats for 5 minutes
      },
    }
  );
}
