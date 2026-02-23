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
// Public API v1 - Single Listing Detail
// GET: Fetch a single listing by ID (public data only)
// ============================================================================

const PUBLIC_LISTING_FIELDS = [
  'id',
  'title',
  'slug',
  'category',
  'description',
  'event_date',
  'event_end_date',
  'venue_name',
  'venue_address',
  'venue_city',
  'venue_state',
  'venue_country',
  'original_price',
  'asking_price',
  'discount_percent',
  'is_negotiable',
  'images',
  'has_original_contract',
  'transfer_conditions',
  'status',
  'view_count',
  'favorite_count',
  'created_at',
  'updated_at',
].join(',');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const { id } = await params;

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

  // Rate limit
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

  // Validate ID
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) {
    return NextResponse.json(
      {
        error: { code: 'INVALID_PARAMETER', message: 'Listing ID must be a valid integer' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: listing, error } = await supabase
    .from('listings')
    .select(PUBLIC_LISTING_FIELDS)
    .eq('id', listingId)
    .single();

  const responseTimeMs = Date.now() - startTime;

  if (error || !listing) {
    if (auth.apiKeyId) {
      logApiRequest({
        apiKeyId: auth.apiKeyId,
        method: 'GET',
        path: `/api/v1/listings/${id}`,
        statusCode: 404,
        responseTimeMs,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      });
    }

    return NextResponse.json(
      {
        error: { code: 'NOT_FOUND', message: 'Listing not found' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 404 }
    );
  }

  // Log successful request
  if (auth.apiKeyId) {
    logApiRequest({
      apiKeyId: auth.apiKeyId,
      method: 'GET',
      path: `/api/v1/listings/${id}`,
      statusCode: 200,
      responseTimeMs,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
    });
  }

  return NextResponse.json(
    {
      data: listing,
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
      },
    }
  );
}
