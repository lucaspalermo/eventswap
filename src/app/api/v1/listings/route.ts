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
// Public API v1 - Listings
// GET: Search listings with filters (public data only)
// ============================================================================

// Public-safe fields to return (no sensitive seller data)
const PUBLIC_LISTING_FIELDS = [
  'id',
  'title',
  'slug',
  'category',
  'description',
  'event_date',
  'event_end_date',
  'venue_name',
  'venue_city',
  'venue_state',
  'venue_country',
  'original_price',
  'asking_price',
  'discount_percent',
  'is_negotiable',
  'images',
  'status',
  'view_count',
  'favorite_count',
  'created_at',
  'updated_at',
].join(',');

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

  // Rate limit
  const rateLimit = checkRateLimit(req.headers.get('x-api-key')!, 100);
  if (!rateLimit.allowed) {
    const headers = {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
      'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
    };
    return NextResponse.json(
      {
        error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Try again later.' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 429, headers }
    );
  }

  // Parse query parameters
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const eventDateFrom = searchParams.get('event_date_from');
  const eventDateTo = searchParams.get('event_date_to');
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));

  const offset = (page - 1) * perPage;

  const supabase = createAdminClient();

  // Build query - only active listings
  let query = supabase
    .from('listings')
    .select(PUBLIC_LISTING_FIELDS, { count: 'exact' })
    .eq('status', 'ACTIVE');

  // Apply filters
  if (category) {
    query = query.eq('category', category);
  }
  if (city) {
    query = query.ilike('venue_city', `%${city}%`);
  }
  if (state) {
    query = query.eq('venue_state', state);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue_name.ilike.%${search}%`);
  }
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) query = query.gte('asking_price', min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) query = query.lte('asking_price', max);
  }
  if (eventDateFrom) {
    query = query.gte('event_date', eventDateFrom);
  }
  if (eventDateTo) {
    query = query.lte('event_date', eventDateTo);
  }

  // Apply sorting
  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'price_asc':
      query = query.order('asking_price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('asking_price', { ascending: false });
      break;
    case 'event_date_asc':
      query = query.order('event_date', { ascending: true });
      break;
    case 'event_date_desc':
      query = query.order('event_date', { ascending: false });
      break;
    case 'discount_desc':
      query = query.order('discount_percent', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(offset, offset + perPage - 1);

  const { data: listings, error, count } = await query;

  const responseTimeMs = Date.now() - startTime;

  if (error) {
    // Log the failed request
    if (auth.apiKeyId) {
      logApiRequest({
        apiKeyId: auth.apiKeyId,
        method: 'GET',
        path: '/api/v1/listings',
        statusCode: 500,
        responseTimeMs,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      });
    }

    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch listings' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  // Log successful request
  if (auth.apiKeyId) {
    logApiRequest({
      apiKeyId: auth.apiKeyId,
      method: 'GET',
      path: '/api/v1/listings',
      statusCode: 200,
      responseTimeMs,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
    });
  }

  return NextResponse.json(
    {
      data: listings || [],
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
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
      },
    }
  );
}
