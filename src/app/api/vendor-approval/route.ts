import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Vendor Approval API
// POST - Send vendor approval request (authenticated, seller only)
// GET  - Check approval status for a transaction (authenticated)
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

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido' },
      { status: 400 }
    );
  }

  const { transaction_id, vendor_name, vendor_email, vendor_phone } = body;

  // Validate required fields
  if (!transaction_id || !vendor_name || !vendor_email) {
    return NextResponse.json(
      {
        error: 'Campos obrigatorios faltando',
        missing_fields: [
          !transaction_id && 'transaction_id',
          !vendor_name && 'vendor_name',
          !vendor_email && 'vendor_email',
        ].filter(Boolean),
      },
      { status: 400 }
    );
  }

  // Verify user is the seller of this transaction
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .select('id, seller_id, buyer_id, listing_id, status')
    .eq('id', Number(transaction_id))
    .single();

  if (txError || !transaction) {
    return NextResponse.json(
      { error: 'Transacao nao encontrada' },
      { status: 404 }
    );
  }

  if (transaction.seller_id !== user.id) {
    return NextResponse.json(
      { error: 'Apenas o vendedor pode solicitar aprovacao do fornecedor' },
      { status: 403 }
    );
  }

  // Check if there's already a pending approval for this transaction
  const { data: existing } = await supabase
    .from('vendor_approvals')
    .select('id, status')
    .eq('transaction_id', Number(transaction_id))
    .in('status', ['pending', 'approved'])
    .single();

  if (existing) {
    return NextResponse.json(
      {
        error: existing.status === 'approved'
          ? 'Fornecedor ja aprovou esta transferencia'
          : 'Ja existe uma solicitacao pendente para esta transacao',
      },
      { status: 409 }
    );
  }

  // Generate a unique approval token
  const approvalToken = crypto.randomUUID();

  // Use admin client to insert (bypasses RLS for the insert)
  const adminSupabase = createAdminClient();

  const { data: approval, error: insertError } = await adminSupabase
    .from('vendor_approvals')
    .insert({
      transaction_id: Number(transaction_id),
      listing_id: transaction.listing_id,
      vendor_name: String(vendor_name),
      vendor_email: String(vendor_email),
      vendor_phone: vendor_phone ? String(vendor_phone) : null,
      approval_token: approvalToken,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError) {
    console.error('[Vendor Approval API] Insert error:', insertError);
    return NextResponse.json(
      { error: 'Falha ao criar solicitacao de aprovacao', details: insertError.message },
      { status: 500 }
    );
  }

  // In production, send email to vendor here
  // For now, return the approval link
  const approvalUrl = `${req.nextUrl.origin}/vendor-approval/${approvalToken}`;

  return NextResponse.json(
    {
      data: {
        id: approval.id,
        status: approval.status,
        approval_url: approvalUrl,
        vendor_name: approval.vendor_name,
        vendor_email: approval.vendor_email,
        expires_at: approval.expires_at,
      },
      message: 'Solicitacao de aprovacao enviada com sucesso',
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get('transaction_id');

  if (!transactionId) {
    return NextResponse.json(
      { error: 'transaction_id e obrigatorio' },
      { status: 400 }
    );
  }

  // Fetch approvals for this transaction (RLS ensures only participants can read)
  const { data: approvals, error } = await supabase
    .from('vendor_approvals')
    .select('*')
    .eq('transaction_id', Number(transactionId))
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Vendor Approval API] GET error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar aprovacoes', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: approvals || [] });
}
