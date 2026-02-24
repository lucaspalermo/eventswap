import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Health Check API
// GET - Returns system health status with dependency checks
// ---------------------------------------------------------------------------

const log = createLogger('api:health');

// Application start time for uptime calculation
const startTime = Date.now();

// Version from package.json (resolved at build time by Next.js bundler)
const APP_VERSION = process.env.npm_package_version || '0.1.0';

const CHECK_TIMEOUT_MS = 3_000;

type CheckStatus = 'ok' | 'degraded' | 'down';

interface HealthCheckResult {
  status: CheckStatus;
  timestamp: string;
  version: string;
  uptime_seconds: number;
  response_time_ms: number;
  checks: {
    database: boolean;
    auth: boolean;
  };
}

/**
 * Run an async check with a timeout. Returns true if the check succeeds
 * within the allotted time, false otherwise.
 */
async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
): Promise<{ ok: boolean; result?: T }> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Check timed out')), timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeout]);
    return { ok: true, result };
  } catch {
    return { ok: false };
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Check database connectivity by running a lightweight query.
 */
async function checkDatabase(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { ok } = await withTimeout(
    supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1),
    CHECK_TIMEOUT_MS,
  );
  return ok;
}

/**
 * Check that the Supabase Auth service is reachable.
 */
async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { ok } = await withTimeout(
    supabase.auth.getSession(),
    CHECK_TIMEOUT_MS,
  );
  return ok;
}

/**
 * Derive overall status from individual check results.
 */
function deriveStatus(checks: { database: boolean; auth: boolean }): CheckStatus {
  if (checks.database && checks.auth) return 'ok';
  if (!checks.database) return 'down';
  // Database up but auth degraded
  return 'degraded';
}

export async function GET() {
  const requestStart = Date.now();

  try {
    const supabase = await createClient();

    // Run checks in parallel for speed
    const [database, auth] = await Promise.all([
      checkDatabase(supabase),
      checkAuth(supabase),
    ]);

    const checks = { database, auth };
    const status = deriveStatus(checks);
    const responseTimeMs = Date.now() - requestStart;

    const result: HealthCheckResult = {
      status,
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      response_time_ms: responseTimeMs,
      checks,
    };

    if (status !== 'ok') {
      log.warn('Health check degraded or down', { status, checks, response_time_ms: responseTimeMs });
    } else {
      log.debug('Health check passed', { response_time_ms: responseTimeMs });
    }

    const httpStatus = status === 'down' ? 503 : 200;

    return NextResponse.json(result, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    const responseTimeMs = Date.now() - requestStart;
    log.error('Health check failed with exception', {
      error: err instanceof Error ? err.message : String(err),
      response_time_ms: responseTimeMs,
    });

    const result: HealthCheckResult = {
      status: 'down',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      response_time_ms: responseTimeMs,
      checks: {
        database: false,
        auth: false,
      },
    };

    return NextResponse.json(result, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}
