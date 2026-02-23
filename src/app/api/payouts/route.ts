import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asaasTransfers, asaasCustomers } from '@/lib/asaas';

// ---------------------------------------------------------------------------
// Payouts API
// GET  - Returns all payouts (payments) where the authenticated user is payee
// POST - Initiates an Asaas transfer to the seller for a given transaction
// ---------------------------------------------------------------------------

/**
 * GET /api/payouts
 * Returns all payout records for the authenticated seller.
 * Fetches from the `payments` table where payee_id = current user.
 */
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
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));
  const offset = (page - 1) * perPage;

  const { data: payouts, error, count } = await supabase
    .from('payments')
    .select(
      '*, transaction:transactions!transaction_id(code, agreed_price, status, listing:listings!listing_id(title, category))',
      { count: 'exact' }
    )
    .eq('payee_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    console.error('[Payouts API] GET error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar pagamentos', details: error.message },
      { status: 500 }
    );
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return NextResponse.json({
    data: payouts || [],
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

/**
 * POST /api/payouts
 * Initiates an Asaas transfer (payout) to the seller for a given transaction.
 *
 * Body: { transaction_id: number }
 *
 * Flow:
 * 1. Validates the transaction belongs to the authenticated seller
 * 2. Validates transaction status is ESCROW_HELD or TRANSFER_PENDING
 * 3. Ensures seller has an Asaas customer record (creates one if needed)
 * 4. Calls asaasTransfers.create() to transfer seller_net_amount
 * 5. Updates transaction status to TRANSFER_PENDING
 * 6. Updates the payment record with the transfer ID
 */
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

  const transactionId = body.transaction_id ? Number(body.transaction_id) : null;

  if (!transactionId || isNaN(transactionId)) {
    return NextResponse.json(
      { error: 'transaction_id e obrigatorio e deve ser um numero' },
      { status: 400 }
    );
  }

  // Fetch the transaction and validate it belongs to this seller
  const { data: transaction, error: txnError } = await supabase
    .from('transactions')
    .select('*, seller:profiles!seller_id(*)')
    .eq('id', transactionId)
    .single();

  if (txnError || !transaction) {
    return NextResponse.json(
      { error: 'Transacao nao encontrada' },
      { status: 404 }
    );
  }

  // Verify the authenticated user is the seller
  if (transaction.seller_id !== user.id) {
    return NextResponse.json(
      { error: 'Voce nao tem permissao para liberar o pagamento desta transacao' },
      { status: 403 }
    );
  }

  // Validate transaction status allows payout
  const allowedStatuses = ['ESCROW_HELD', 'TRANSFER_PENDING'];
  if (!allowedStatuses.includes(transaction.status)) {
    return NextResponse.json(
      {
        error: `Pagamento nao pode ser liberado no status atual: ${transaction.status}. Status permitidos: ESCROW_HELD, TRANSFER_PENDING`,
      },
      { status: 400 }
    );
  }

  // Check if a transfer was already completed for this transaction
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('asaas_transfer_id, status')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (existingPayment?.asaas_transfer_id) {
    return NextResponse.json(
      {
        error: 'Uma transferencia ja foi iniciada para esta transacao',
        transfer_id: existingPayment.asaas_transfer_id,
      },
      { status: 409 }
    );
  }

  // Fetch seller profile for Asaas data
  const sellerProfile = transaction.seller as {
    id: string;
    name: string;
    email: string;
    cpf: string | null;
    phone: string | null;
    asaas_customer_id: string | null;
  } | null;

  if (!sellerProfile) {
    return NextResponse.json(
      { error: 'Perfil do vendedor nao encontrado' },
      { status: 404 }
    );
  }

  if (!sellerProfile.cpf) {
    return NextResponse.json(
      { error: 'CPF do vendedor nao cadastrado. Atualize seu perfil antes de receber pagamentos.' },
      { status: 400 }
    );
  }

  const transferAmount = transaction.seller_net_amount;

  if (!transferAmount || transferAmount <= 0) {
    return NextResponse.json(
      { error: 'Valor liquido da transacao e invalido' },
      { status: 400 }
    );
  }

  // Ensure seller has an Asaas customer record
  let asaasCustomerId = sellerProfile.asaas_customer_id;

  if (!asaasCustomerId) {
    try {
      const asaasCustomer = await asaasCustomers.getOrCreate({
        name: sellerProfile.name,
        email: sellerProfile.email,
        cpfCnpj: sellerProfile.cpf,
        phone: sellerProfile.phone || undefined,
        externalReference: sellerProfile.id,
      });

      asaasCustomerId = asaasCustomer.id;

      // Persist the Asaas customer ID on the profile
      await supabase
        .from('profiles')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', user.id);
    } catch (asaasCustomerError) {
      console.error('[Payouts API] Erro ao criar/obter cliente Asaas:', asaasCustomerError);
      return NextResponse.json(
        { error: 'Falha ao configurar conta de recebimento no Asaas. Tente novamente mais tarde.' },
        { status: 502 }
      );
    }
  }

  // Initiate the Asaas transfer
  let asaasTransfer: { id: string; value: number; status?: string } | null = null;

  try {
    asaasTransfer = await asaasTransfers.create({
      value: transferAmount,
      operationType: 'PIX',
      pixAddressKey: sellerProfile.cpf.replace(/\D/g, ''), // CPF digits only as PIX key
      pixAddressKeyType: 'CPF',
      description: `EventSwap - Pagamento transacao #${transactionId}`,
      externalReference: String(transactionId),
    });
  } catch (transferError) {
    console.error('[Payouts API] Erro ao criar transferencia Asaas:', transferError);
    return NextResponse.json(
      { error: 'Falha ao iniciar transferencia no Asaas. Verifique os dados bancarios e tente novamente.' },
      { status: 502 }
    );
  }

  // Update payment record with the transfer ID
  if (existingPayment) {
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        asaas_transfer_id: asaasTransfer.id,
        status: 'PROCESSING',
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId);

    if (paymentUpdateError) {
      console.error('[Payouts API] Erro ao atualizar pagamento com transfer ID:', paymentUpdateError);
    }
  } else {
    // Create a payment record if one doesn't exist (edge case)
    const { error: paymentInsertError } = await supabase
      .from('payments')
      .insert({
        transaction_id: transactionId,
        payer_id: transaction.buyer_id,
        payee_id: user.id,
        asaas_transfer_id: asaasTransfer.id,
        gross_amount: transaction.agreed_price,
        net_amount: transferAmount,
        method: 'PIX',
        status: 'PROCESSING',
      });

    if (paymentInsertError) {
      console.error('[Payouts API] Erro ao criar registro de pagamento:', paymentInsertError);
    }
  }

  // Update transaction status to TRANSFER_PENDING
  const { error: txnUpdateError } = await supabase
    .from('transactions')
    .update({
      status: 'TRANSFER_PENDING',
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .in('status', ['ESCROW_HELD', 'TRANSFER_PENDING']);

  if (txnUpdateError) {
    console.error('[Payouts API] Erro ao atualizar status da transacao:', txnUpdateError);
    // Non-fatal: transfer was already initiated
  }

  console.log(
    `[Payouts API] Transferencia iniciada: transacao=${transactionId} transfer_id=${asaasTransfer.id} valor=R$${transferAmount}`
  );

  return NextResponse.json(
    {
      data: {
        transfer_id: asaasTransfer.id,
        amount: transferAmount,
        status: asaasTransfer.status || 'PENDING',
      },
      message: 'Transferencia iniciada com sucesso',
    },
    { status: 201 }
  );
}
