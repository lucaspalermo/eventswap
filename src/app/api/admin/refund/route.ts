import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Admin Force Refund API
// POST - Admin forces a refund on a transaction
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Check authentication
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

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores.' },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido' },
      { status: 400 }
    );
  }

  const transactionId = body.transaction_id ? Number(body.transaction_id) : null;

  if (!transactionId) {
    return NextResponse.json(
      { error: 'transaction_id e obrigatorio' },
      { status: 400 }
    );
  }

  // Fetch the transaction
  const { data: transaction, error: txnError } = await supabase
    .from('transactions')
    .select('*, listing:listings!listing_id(id, status)')
    .eq('id', transactionId)
    .single();

  if (txnError || !transaction) {
    return NextResponse.json(
      { error: 'Transacao nao encontrada' },
      { status: 404 }
    );
  }

  // Cannot refund already refunded or cancelled transactions
  if (['REFUNDED', 'CANCELLED'].includes(transaction.status)) {
    return NextResponse.json(
      { error: 'Transacao ja foi reembolsada ou cancelada' },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Update transaction status to REFUNDED
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      status: 'REFUNDED',
      updated_at: now,
    })
    .eq('id', transactionId);

  if (updateError) {
    console.error('[Admin Refund] Update error:', updateError);
    return NextResponse.json(
      { error: 'Falha ao atualizar transacao', details: updateError.message },
      { status: 500 }
    );
  }

  // Reactivate the listing if it was sold/reserved
  const listing = transaction.listing as { id: number; status: string } | null;
  if (listing && ['SOLD', 'RESERVED'].includes(listing.status)) {
    await supabase
      .from('listings')
      .update({ status: 'ACTIVE', updated_at: now })
      .eq('id', listing.id);
  }

  return NextResponse.json({
    data: {
      transaction_id: transactionId,
      status: 'REFUNDED',
      refunded_at: now,
      admin_id: user.id,
    },
    message: 'Reembolso forcado com sucesso. Transacao marcada como reembolsada.',
  });
}
