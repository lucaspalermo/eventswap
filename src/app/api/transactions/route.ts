import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLATFORM } from '@/lib/constants';
import { asaasCustomers, asaasPayments, mapPaymentMethodToAsaas } from '@/lib/asaas';
import type { AsaasPixQrCode } from '@/lib/asaas';
import { emailService } from '@/lib/email';

// ---------------------------------------------------------------------------
// Transactions API
// GET  - Fetch user's transactions (purchases + sales)
// POST - Initiate a new transaction (buyer -> listing)
// ---------------------------------------------------------------------------

/**
 * Generates a unique transaction code in format TXN-YYYY-XXXX
 * YYYY = current year, XXXX = random 4-digit alphanumeric
 */
function generateTransactionCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TXN-${year}-${code}`;
}

/**
 * Calculates the platform fee and seller net amount.
 * Seller pays 8% platform fee. Buyer pays separate 5% buyer fee.
 */
function calculateFees(agreedPrice: number) {
  const sellerFeeRate = PLATFORM.fees.sellerPercent / 100; // 0.08 (8%)
  const platformFee = Math.max(
    PLATFORM.fees.minimumFeeReais,
    Math.round(agreedPrice * sellerFeeRate * 100) / 100
  );
  const sellerNet = Math.round((agreedPrice - platformFee) * 100) / 100;

  return {
    platformFee,
    platformFeeRate: sellerFeeRate,
    sellerNet,
  };
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
  const role = searchParams.get('role'); // 'buyer', 'seller', or null (both)
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '12', 10)));
  const offset = (page - 1) * perPage;

  // Build query with joined data
  let query = supabase
    .from('transactions')
    .select(
      '*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), listing:listings!listing_id(*)',
      { count: 'exact' }
    );

  // Filter by role (buyer or seller perspective)
  if (role === 'buyer') {
    query = query.eq('buyer_id', user.id);
  } else if (role === 'seller') {
    query = query.eq('seller_id', user.id);
  } else {
    // Both: where user is buyer OR seller
    query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
  }

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Order and paginate
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  const { data: transactions, error, count } = await query;

  if (error) {
    console.error('[Transactions API] GET error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar transacoes', details: error.message },
      { status: 500 }
    );
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return NextResponse.json({
    data: transactions || [],
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

  const listingId = body.listing_id ? Number(body.listing_id) : null;

  if (!listingId) {
    return NextResponse.json(
      { error: 'listing_id e obrigatorio' },
      { status: 400 }
    );
  }

  // Fetch the listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json(
      { error: 'Anuncio nao encontrado' },
      { status: 404 }
    );
  }

  // Validate listing is available for purchase
  if (listing.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Anuncio nao esta disponivel para compra' },
      { status: 400 }
    );
  }

  // Prevent self-purchase
  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: 'Voce nao pode comprar seu proprio anuncio' },
      { status: 400 }
    );
  }

  // Validate buyer has CPF before creating anything (required by Asaas)
  const { data: buyerProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!buyerProfile?.cpf) {
    return NextResponse.json(
      { error: 'CPF e obrigatorio para realizar pagamentos. Atualize seu perfil antes de comprar.', code: 'CPF_REQUIRED' },
      { status: 400 }
    );
  }

  // Check for existing active transaction on this listing by this buyer
  const { data: existingTxn } = await supabase
    .from('transactions')
    .select('id, status')
    .eq('listing_id', listingId)
    .eq('buyer_id', user.id)
    .in('status', ['INITIATED', 'AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'ESCROW_HELD', 'TRANSFER_PENDING'])
    .maybeSingle();

  if (existingTxn) {
    return NextResponse.json(
      {
        error: 'Ja existe uma transacao ativa para este anuncio',
        existing_transaction_id: existingTxn.id,
        code: 'EXISTING_TRANSACTION',
      },
      { status: 409 }
    );
  }

  // Calculate fees
  const agreedPrice = listing.asking_price;
  const { platformFee, platformFeeRate, sellerNet } = calculateFees(agreedPrice);

  // Generate unique code (with retry in case of collision)
  let transactionCode = generateTransactionCode();
  let retries = 0;

  while (retries < 5) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('code', transactionCode)
      .maybeSingle();

    if (!existing) break;
    transactionCode = generateTransactionCode();
    retries++;
  }

  // Set payment deadline (48 hours from now)
  const paymentDeadline = new Date();
  paymentDeadline.setHours(paymentDeadline.getHours() + 48);

  // Create the transaction
  const transactionData = {
    code: transactionCode,
    buyer_id: user.id,
    seller_id: listing.seller_id,
    listing_id: listingId,
    agreed_price: agreedPrice,
    platform_fee: platformFee,
    platform_fee_rate: platformFeeRate,
    seller_net_amount: sellerNet,
    status: 'INITIATED' as const,
    payment_deadline: paymentDeadline.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: transaction, error: txnError } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select('*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), listing:listings!listing_id(*)')
    .single();

  if (txnError) {
    console.error('[Transactions API] POST error:', txnError);
    return NextResponse.json(
      { error: 'Falha ao criar transacao', details: txnError.message },
      { status: 500 }
    );
  }

  // Enviar email ao vendedor informando nova proposta (fire-and-forget)
  {
    const seller = transaction.seller as unknown as { name: string; email: string } | null;
    const buyer = transaction.buyer as unknown as { name: string; email: string } | null;
    const listingData = transaction.listing as unknown as { title: string } | null;
    const amountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(agreedPrice);

    if (seller?.email) {
      Promise.resolve().then(() =>
        emailService.sendTransactionCreated(seller.email, {
          buyerName: buyer?.name ?? 'Comprador',
          sellerName: seller.name,
          listingTitle: listingData?.title ?? listing.title,
          transactionCode: transaction.code,
          amount: amountFormatted,
        })
      );
    }
  }

  // Calculate buyer fee for the response (5% buyer side)
  const buyerFeeRate = PLATFORM.fees.buyerPercent / 100; // 0.05
  const buyerFee = Math.round(agreedPrice * buyerFeeRate * 100) / 100;
  const buyerTotal = Math.round((agreedPrice + buyerFee) * 100) / 100;

  // Get payment method from request body
  const paymentMethod = (body.payment_method as string || 'PIX').toUpperCase() as 'CARD' | 'PIX' | 'BOLETO';

  // Asaas payment data to include in response
  let asaasPaymentId: string | null = null;
  let invoiceUrl: string | null = null;
  let bankSlipUrl: string | null = null;
  let pixData: AsaasPixQrCode | null = null;

  // Get or create Asaas customer and payment
  if (buyerProfile) {
    try {
      const asaasCustomer = await asaasCustomers.getOrCreate({
        name: buyerProfile.name,
        email: buyerProfile.email,
        cpfCnpj: buyerProfile.cpf,
        phone: buyerProfile.phone || undefined,
        externalReference: user.id,
      });

      // Create Asaas payment
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2); // 2 days deadline

      const asaasPayment = await asaasPayments.create({
        customer: asaasCustomer.id,
        billingType: mapPaymentMethodToAsaas(paymentMethod),
        value: buyerTotal,
        dueDate: dueDate.toISOString().split('T')[0],
        description: `EventSwap - ${listing.title}`,
        externalReference: String(transaction.id),
      });

      asaasPaymentId = asaasPayment.id;
      invoiceUrl = asaasPayment.invoiceUrl || null;
      bankSlipUrl = asaasPayment.bankSlipUrl || null;

      // Create payment record in our DB
      await supabase.from('payments').insert({
        transaction_id: transaction.id,
        payer_id: user.id,
        payee_id: listing.seller_id,
        asaas_payment_id: asaasPayment.id,
        gross_amount: buyerTotal,
        net_amount: sellerNet,
        method: paymentMethod,
        status: 'PENDING',
      });

      // Update transaction status to AWAITING_PAYMENT
      await supabase
        .from('transactions')
        .update({
          status: 'AWAITING_PAYMENT',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      // Update Asaas customer ID on profile if not set
      if (!buyerProfile.asaas_customer_id) {
        await supabase
          .from('profiles')
          .update({ asaas_customer_id: asaasCustomer.id })
          .eq('id', user.id);
      }

      // Get PIX QR code if payment method is PIX
      if (paymentMethod === 'PIX' && asaasPayment.id) {
        try {
          pixData = await asaasPayments.getPixQrCode(asaasPayment.id);
        } catch (pixError) {
          console.error('[Transactions API] Erro ao obter QR code PIX:', pixError);
        }
      }
    } catch (asaasError) {
      console.error('[Transactions API] Erro no Asaas:', asaasError);
      // Transaction was created but payment failed - still return success but flag it
    }
  }

  return NextResponse.json(
    {
      data: transaction,
      pricing: {
        listing_price: agreedPrice,
        buyer_fee: buyerFee,
        buyer_fee_rate: buyerFeeRate,
        buyer_total: buyerTotal,
        platform_fee: platformFee,
        platform_fee_rate: platformFeeRate,
        seller_net: sellerNet,
      },
      payment: {
        asaas_payment_id: asaasPaymentId,
        method: paymentMethod,
        invoice_url: invoiceUrl,
        bank_slip_url: bankSlipUrl,
        pix: pixData ? {
          qr_code_image: pixData.encodedImage,
          copy_paste: pixData.payload,
          expiration_date: pixData.expirationDate,
        } : null,
      },
      message: 'Transacao iniciada com sucesso',
    },
    { status: 201 }
  );
}
