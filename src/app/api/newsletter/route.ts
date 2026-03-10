import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Newsletter Subscription API
// POST - Subscribe an email to the newsletter
// ---------------------------------------------------------------------------

// Simple in-memory rate limit store (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

function isValidEmail(email: string): boolean {
  // RFC 5322 simplified check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    // Parse body
    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Corpo da requisicao invalido' },
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email e obrigatorio' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Formato de email invalido' },
        { status: 400 }
      );
    }

    // Upsert into newsletter_subscribers
    const adminClient = createAdminClient();

    const { error: upsertError } = await adminClient
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          source: 'website',
          subscribed_at: new Date().toISOString(),
          is_active: true,
          unsubscribed_at: null,
        },
        { onConflict: 'email' }
      );

    if (upsertError) {
      console.error('[Newsletter API] Upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Falha ao registrar inscricao' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Inscricao realizada com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Newsletter API] Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
