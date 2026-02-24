import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDisputeSchema, validateBody } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Disputes API
// GET  - Fetch disputes opened by the authenticated user
// POST - Open a new dispute on a transaction
// ---------------------------------------------------------------------------

const DISPUTE_ELIGIBLE_STATUSES = ['ESCROW_HELD', 'TRANSFER_PENDING'];

// Zod schema handles reason validation now (see @/lib/validations)

function generateProtocolNumber(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DSP-${year}-${code}`;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();

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

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '12', 10)));
  const offset = (page - 1) * perPage;

  const { data: disputes, error, count } = await supabase
    .from('disputes')
    .select(
      '*, transaction:transactions!transaction_id(*, listing:listings!listing_id(*)), opener:profiles!opened_by(*)',
      { count: 'exact' }
    )
    .eq('opened_by', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    console.error('[Disputes API] GET error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar disputas', details: error.message },
      { status: 500 }
    );
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return NextResponse.json({
    data: disputes || [],
    pagination: {
      page,
      per_page: perPage,
      total: count || 0,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

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

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 });
  }

  const validation = validateBody(createDisputeSchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const body = validation.data;

  const transactionId = body.transaction_id;
  const reason = body.reason;
  const description = body.description;
  const evidenceUrls = body.evidence_urls ?? [];

  // Fetch the transaction
  const { data: transaction, error: txnError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (txnError || !transaction) {
    return NextResponse.json(
      { error: 'Transacao nao encontrada' },
      { status: 404 }
    );
  }

  // Verify user is buyer or seller on this transaction
  if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
    return NextResponse.json(
      { error: 'Voce nao tem permissao para abrir uma disputa nesta transacao' },
      { status: 403 }
    );
  }

  // Verify transaction status allows dispute
  if (!DISPUTE_ELIGIBLE_STATUSES.includes(transaction.status)) {
    return NextResponse.json(
      {
        error: `Nao e possivel abrir disputa para transacoes com status "${transaction.status}". Disputas so podem ser abertas em transacoes com status Em Garantia ou Transferencia Pendente.`,
      },
      { status: 400 }
    );
  }

  // Check for existing open dispute on this transaction by this user
  const { data: existingDispute } = await supabase
    .from('disputes')
    .select('id, status')
    .eq('transaction_id', transactionId)
    .eq('opened_by', user.id)
    .in('status', ['OPEN', 'UNDER_REVIEW'])
    .maybeSingle();

  if (existingDispute) {
    return NextResponse.json(
      { error: 'Ja existe uma disputa aberta para esta transacao' },
      { status: 409 }
    );
  }

  // Generate unique protocol number
  let protocol = generateProtocolNumber();
  let retries = 0;

  while (retries < 5) {
    const { data: existing } = await supabase
      .from('disputes')
      .select('id')
      .eq('protocol', protocol)
      .maybeSingle();

    if (!existing) break;
    protocol = generateProtocolNumber();
    retries++;
  }

  // Insert the dispute
  const { data: dispute, error: disputeError } = await supabase
    .from('disputes')
    .insert({
      protocol,
      transaction_id: transactionId,
      opened_by: user.id,
      reason,
      description: description.trim(),
      evidence_urls: evidenceUrls,
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (disputeError) {
    console.error('[Disputes API] POST insert error:', disputeError);
    return NextResponse.json(
      { error: 'Falha ao abrir disputa', details: disputeError.message },
      { status: 500 }
    );
  }

  // Update transaction status to DISPUTE_OPENED
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      status: 'DISPUTE_OPENED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (updateError) {
    console.error('[Disputes API] POST update transaction error:', updateError);
    // Dispute was created but status update failed - non-fatal, still return success
  }

  return NextResponse.json(
    {
      data: dispute,
      message: 'Disputa aberta com sucesso',
    },
    { status: 201 }
  );
}
