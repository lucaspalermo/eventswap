import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Vendor Approval Token API (PUBLIC - no auth required)
// GET  - Get approval details by token (for vendor approval page)
// POST - Vendor approves or rejects the transfer
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Token invalido' },
      { status: 400 }
    );
  }

  // Use admin client since this is a public endpoint (no user auth)
  const supabase = createAdminClient();

  // Fetch approval with transaction and listing details
  const { data: approval, error } = await supabase
    .from('vendor_approvals')
    .select('*')
    .eq('approval_token', token)
    .single();

  if (error || !approval) {
    return NextResponse.json(
      { error: 'Solicitacao de aprovacao nao encontrada' },
      { status: 404 }
    );
  }

  // Check if expired
  if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
    // Mark as expired if not already
    if (approval.status === 'pending') {
      await supabase
        .from('vendor_approvals')
        .update({ status: 'expired' })
        .eq('id', approval.id);
    }

    return NextResponse.json(
      { error: 'Solicitacao de aprovacao expirada', data: { status: 'expired' } },
      { status: 410 }
    );
  }

  // Fetch transaction details
  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, code, agreed_price, status, buyer_id, seller_id')
    .eq('id', approval.transaction_id)
    .single();

  // Fetch listing details
  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, category, event_date, venue_name, venue_city, venue_state')
    .eq('id', approval.listing_id)
    .single();

  // Fetch buyer name
  let buyerName = 'Comprador';
  if (transaction?.buyer_id) {
    const { data: buyer } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', transaction.buyer_id)
      .single();

    if (buyer) buyerName = buyer.name;
  }

  // Fetch seller name
  let sellerName = 'Vendedor';
  if (transaction?.seller_id) {
    const { data: seller } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', transaction.seller_id)
      .single();

    if (seller) sellerName = seller.name;
  }

  return NextResponse.json({
    data: {
      id: approval.id,
      status: approval.status,
      vendor_name: approval.vendor_name,
      approved_at: approval.approved_at,
      rejected_reason: approval.rejected_reason,
      created_at: approval.created_at,
      expires_at: approval.expires_at,
      transaction: transaction
        ? {
            code: transaction.code,
            agreed_price: transaction.agreed_price,
            status: transaction.status,
          }
        : null,
      listing: listing
        ? {
            title: listing.title,
            category: listing.category,
            event_date: listing.event_date,
            venue_name: listing.venue_name,
            venue_city: listing.venue_city,
            venue_state: listing.venue_state,
          }
        : null,
      buyer_name: buyerName,
      seller_name: sellerName,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Token invalido' },
      { status: 400 }
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

  const { action, rejected_reason } = body;

  if (!action || !['approve', 'reject'].includes(String(action))) {
    return NextResponse.json(
      { error: 'Acao invalida. Use "approve" ou "reject"' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Fetch approval
  const { data: approval, error: fetchError } = await supabase
    .from('vendor_approvals')
    .select('*')
    .eq('approval_token', token)
    .single();

  if (fetchError || !approval) {
    return NextResponse.json(
      { error: 'Solicitacao de aprovacao nao encontrada' },
      { status: 404 }
    );
  }

  // Check if already processed
  if (approval.status !== 'pending') {
    return NextResponse.json(
      {
        error: `Solicitacao ja foi processada (status: ${approval.status})`,
        data: { status: approval.status },
      },
      { status: 409 }
    );
  }

  // Check if expired
  if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
    await supabase
      .from('vendor_approvals')
      .update({ status: 'expired' })
      .eq('id', approval.id);

    return NextResponse.json(
      { error: 'Solicitacao de aprovacao expirada' },
      { status: 410 }
    );
  }

  // Get client IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (String(action) === 'approve') {
    const { error: updateError } = await supabase
      .from('vendor_approvals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        ip_address: ip,
      })
      .eq('id', approval.id);

    if (updateError) {
      console.error('[Vendor Approval] Update error:', updateError);
      return NextResponse.json(
        { error: 'Falha ao aprovar transferencia' },
        { status: 500 }
      );
    }

    // Notify transaction participants (create notification)
    const { data: transaction } = await supabase
      .from('transactions')
      .select('buyer_id, seller_id, code')
      .eq('id', approval.transaction_id)
      .single();

    if (transaction) {
      const notifications = [
        {
          user_id: transaction.buyer_id,
          channel: 'vendor_approval',
          title: 'Fornecedor aprovou a transferencia!',
          body: `O fornecedor ${approval.vendor_name} aprovou a transferencia da reserva. Transacao: ${transaction.code}`,
          data: { transaction_id: approval.transaction_id, approval_id: approval.id },
          action_url: `/purchases/${approval.transaction_id}`,
        },
        {
          user_id: transaction.seller_id,
          channel: 'vendor_approval',
          title: 'Fornecedor aprovou a transferencia!',
          body: `O fornecedor ${approval.vendor_name} aprovou a transferencia da reserva. Transacao: ${transaction.code}`,
          data: { transaction_id: approval.transaction_id, approval_id: approval.id },
          action_url: `/sales/${approval.transaction_id}`,
        },
      ];

      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({
      data: { status: 'approved' },
      message: 'Transferencia aprovada com sucesso!',
    });
  } else {
    // Reject
    if (!rejected_reason) {
      return NextResponse.json(
        { error: 'Motivo da rejeicao e obrigatorio' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('vendor_approvals')
      .update({
        status: 'rejected',
        rejected_reason: String(rejected_reason),
        ip_address: ip,
      })
      .eq('id', approval.id);

    if (updateError) {
      console.error('[Vendor Approval] Update error:', updateError);
      return NextResponse.json(
        { error: 'Falha ao rejeitar transferencia' },
        { status: 500 }
      );
    }

    // Notify transaction participants
    const { data: transaction } = await supabase
      .from('transactions')
      .select('buyer_id, seller_id, code')
      .eq('id', approval.transaction_id)
      .single();

    if (transaction) {
      const notifications = [
        {
          user_id: transaction.buyer_id,
          channel: 'vendor_approval',
          title: 'Fornecedor rejeitou a transferencia',
          body: `O fornecedor ${approval.vendor_name} rejeitou a transferencia. Motivo: ${rejected_reason}`,
          data: { transaction_id: approval.transaction_id, approval_id: approval.id },
          action_url: `/purchases/${approval.transaction_id}`,
        },
        {
          user_id: transaction.seller_id,
          channel: 'vendor_approval',
          title: 'Fornecedor rejeitou a transferencia',
          body: `O fornecedor ${approval.vendor_name} rejeitou a transferencia. Motivo: ${rejected_reason}`,
          data: { transaction_id: approval.transaction_id, approval_id: approval.id },
          action_url: `/sales/${approval.transaction_id}`,
        },
      ];

      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({
      data: { status: 'rejected' },
      message: 'Transferencia rejeitada',
    });
  }
}
