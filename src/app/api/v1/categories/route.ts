import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EVENT_CATEGORIES } from '@/lib/constants';
import {
  authenticateApiKey,
  hasPermission,
  checkRateLimit,
  logApiRequest,
  generateRequestId,
} from '@/lib/api-auth';

// ============================================================================
// Public API v1 - Categories
// GET: List all event categories with active listing counts
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

  const supabase = createAdminClient();

  // Get active listing counts per category
  const { data: listings, error } = await supabase
    .from('listings')
    .select('category')
    .eq('status', 'ACTIVE');

  const responseTimeMs = Date.now() - startTime;

  if (error) {
    if (auth.apiKeyId) {
      logApiRequest({
        apiKeyId: auth.apiKeyId,
        method: 'GET',
        path: '/api/v1/categories',
        statusCode: 500,
        responseTimeMs,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      });
    }

    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' },
        meta: { request_id: requestId, timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }

  // Count listings per category
  const countMap: Record<string, number> = {};
  (listings || []).forEach((l) => {
    countMap[l.category] = (countMap[l.category] || 0) + 1;
  });

  // Build response with all categories
  const categories = EVENT_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    label_plural: cat.labelPlural,
    description: cat.description,
    active_listings_count: countMap[cat.id] || 0,
  }));

  // Log successful request
  if (auth.apiKeyId) {
    logApiRequest({
      apiKeyId: auth.apiKeyId,
      method: 'GET',
      path: '/api/v1/categories',
      statusCode: 200,
      responseTimeMs,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
    });
  }

  return NextResponse.json(
    {
      data: categories,
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
