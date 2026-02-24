import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLATFORM } from '@/lib/constants';
import { asaasCustomers, asaasPayments, mapPaymentMethodToAsaas } from '@/lib/asaas';
import type { AsaasPixQrCode } from '@/lib/asaas';

// ---------------------------------------------------------------------------
// GET  - Fetch payment info (PIX QR code, invoice URL, etc.)
// POST - Create/retry payment for an existing INITIATED transaction
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const { id } = await context.params;
  const transactionId = Number(id);

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Autenticacao necessaria' }, { status: 401 });
  }

  // Fetch payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('transaction_id', transactionId)
    .eq('payer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    console.error('[Payment API] GET error:', paymentError);
    return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 500 });
  }

  if (!payment) {
    return NextResponse.json({ data: null, message: 'Nenhum pagamento encontrado' });
  }

  // Get PIX QR code from Asaas if payment method is PIX
  let pixData: AsaasPixQrCode | null = null;
  let asaasStatus: string | null = null;

  if (payment.asaas_payment_id) {
    try {
      const asaasPayment = await asaasPayments.getById(payment.asaas_payment_id);
      asaasStatus = asaasPayment.status || null;

      if (payment.method === 'PIX' && asaasPayment.status === 'PENDING') {
        pixData = await asaasPayments.getPixQrCode(payment.asaas_payment_id);
      }
    } catch (err) {
      console.error('[Payment API] Asaas fetch error:', err);
    }
  }

  return NextResponse.json({
    data: {
      id: payment.id,
      method: payment.method,
      status: payment.status,
      asaas_status: asaasStatus,
      gross_amount: payment.gross_amount,
      invoice_url: payment.invoice_url || null,
      bank_slip_url: payment.bank_slip_url || null,
      pix: pixData ? {
        qr_code_image: pixData.encodedImage,
        copy_paste: pixData.payload,
        expiration_date: pixData.expirationDate,
      } : null,
    },
  });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const { id } = await context.params;
  const transactionId = Number(id);

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Autenticacao necessaria' }, { status: 401 });
  }

  // Fetch the transaction
  const { data: transaction, error: txnError } = await supabase
    .from('transactions')
    .select('*, listing:listings!listing_id(*)')
    .eq('id', transactionId)
    .eq('buyer_id', user.id)
    .single();

  if (txnError || !transaction) {
    return NextResponse.json({ error: 'Transacao nao encontrada' }, { status: 404 });
  }

  // Only allow payment creation for INITIATED transactions
  if (transaction.status !== 'INITIATED') {
    return NextResponse.json(
      { error: 'Transacao nao esta no status correto para pagamento' },
      { status: 400 }
    );
  }

  // Check for existing payment
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, asaas_payment_id')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (existingPayment?.asaas_payment_id) {
    return NextResponse.json(
      { error: 'Pagamento ja foi criado para esta transacao' },
      { status: 409 }
    );
  }

  // Get buyer profile (with CPF)
  const { data: buyerProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!buyerProfile?.cpf) {
    return NextResponse.json(
      { error: 'CPF e obrigatorio para realizar pagamentos.', code: 'CPF_REQUIRED' },
      { status: 400 }
    );
  }

  // Parse payment method from request
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // default to PIX
  }
  const paymentMethod = ((body.payment_method as string) || 'PIX').toUpperCase() as 'CARD' | 'PIX' | 'BOLETO';

  // Calculate buyer total
  const buyerFeeRate = PLATFORM.fees.buyerPercent / 100;
  const buyerFee = Math.round(transaction.agreed_price * buyerFeeRate * 100) / 100;
  const buyerTotal = Math.round((transaction.agreed_price + buyerFee) * 100) / 100;

  const listing = transaction.listing as Record<string, unknown>;

  try {
    // Get or create Asaas customer
    const asaasCustomer = await asaasCustomers.getOrCreate({
      name: buyerProfile.name,
      email: buyerProfile.email,
      cpfCnpj: buyerProfile.cpf,
      phone: buyerProfile.phone || undefined,
      externalReference: user.id,
    });

    // Create Asaas payment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    const asaasPayment = await asaasPayments.create({
      customer: asaasCustomer.id,
      billingType: mapPaymentMethodToAsaas(paymentMethod),
      value: buyerTotal,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `EventSwap - ${listing?.title || 'Reserva'}`,
      externalReference: String(transaction.id),
    });

    // Create payment record
    await supabase.from('payments').insert({
      transaction_id: transactionId,
      payer_id: user.id,
      payee_id: transaction.seller_id,
      asaas_payment_id: asaasPayment.id,
      gross_amount: buyerTotal,
      net_amount: transaction.seller_net_amount,
      method: paymentMethod,
      status: 'PENDING',
    });

    // Update transaction status
    await supabase
      .from('transactions')
      .update({ status: 'AWAITING_PAYMENT', updated_at: new Date().toISOString() })
      .eq('id', transactionId);

    // Update Asaas customer ID on profile if not set
    if (!buyerProfile.asaas_customer_id) {
      await supabase
        .from('profiles')
        .update({ asaas_customer_id: asaasCustomer.id })
        .eq('id', user.id);
    }

    // Get PIX QR code if applicable
    let pixData: AsaasPixQrCode | null = null;
    if (paymentMethod === 'PIX' && asaasPayment.id) {
      try {
        pixData = await asaasPayments.getPixQrCode(asaasPayment.id);
      } catch (pixErr) {
        console.error('[Payment API] PIX QR code error:', pixErr);
      }
    }

    return NextResponse.json({
      data: {
        method: paymentMethod,
        status: 'PENDING',
        gross_amount: buyerTotal,
        invoice_url: asaasPayment.invoiceUrl || null,
        bank_slip_url: asaasPayment.bankSlipUrl || null,
        pix: pixData ? {
          qr_code_image: pixData.encodedImage,
          copy_paste: pixData.payload,
          expiration_date: pixData.expirationDate,
        } : null,
      },
      message: 'Pagamento criado com sucesso',
    }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Payment API] Asaas error:', msg);
    return NextResponse.json(
      { error: `Erro ao processar pagamento: ${msg}` },
      { status: 500 }
    );
  }
}
