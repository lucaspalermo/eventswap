import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ============================================================================
// API Key Authentication for EventSwap Public REST API
// ============================================================================

export interface ApiAuthResult {
  authenticated: boolean;
  userId?: string;
  permissions?: string[];
  apiKeyId?: number;
  error?: string;
}

/**
 * Authenticate a request using the x-api-key header.
 * Returns authentication result with user context and permissions.
 */
export async function authenticateApiKey(req: NextRequest): Promise<ApiAuthResult> {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return { authenticated: false, error: 'API key required. Include x-api-key header.' };
  }

  const supabase = createAdminClient();

  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !keyData) {
    return { authenticated: false, error: 'Invalid or inactive API key' };
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { authenticated: false, error: 'API key expired' };
  }

  // Update last_used_at (fire-and-forget, do not await to avoid latency)
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id)
    .then(() => {});

  return {
    authenticated: true,
    userId: keyData.user_id,
    permissions: keyData.permissions as string[],
    apiKeyId: keyData.id,
  };
}

/**
 * Check if the authenticated key has a specific permission.
 */
export function hasPermission(auth: ApiAuthResult, permission: string): boolean {
  return auth.permissions?.includes(permission) ?? false;
}

/**
 * Generate a new API key with the evtswap_ prefix.
 */
export function generateApiKey(): string {
  return 'evtswap_' + crypto.randomUUID().replace(/-/g, '');
}

/**
 * Generate a new API secret with the secret_ prefix.
 */
export function generateApiSecret(): string {
  return 'secret_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

/**
 * Log an API request to the api_logs table.
 */
export async function logApiRequest(params: {
  apiKeyId: number;
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string | null;
}) {
  const supabase = createAdminClient();
  await supabase.from('api_logs').insert({
    api_key_id: params.apiKeyId,
    method: params.method,
    path: params.path,
    status_code: params.statusCode,
    response_time_ms: params.responseTimeMs,
    ip_address: params.ipAddress,
  });
}

/**
 * Simple in-memory rate limiter.
 * In production, use Redis for distributed rate limiting.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(apiKey: string, limit: number = 100): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const key = `rate:${apiKey}`;

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  existing.count++;
  const remaining = Math.max(0, limit - existing.count);

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  return { allowed: true, remaining, resetAt: existing.resetAt };
}

/**
 * Generate a unique request ID for debugging.
 */
export function generateRequestId(): string {
  return 'req_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}
