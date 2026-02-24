import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLATFORM } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Offer Respond API
// POST - Respond to an offer (accept, reject, counter)
// ---------------------------------------------------------------------------

/**
 * Generates a unique transaction code in format TXN-YYYY-XXXX
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
 * Calculates platform fee and seller net amount.
 */
function calculateFees(agreedPrice: number, feePercent?: number) {
  const sellerFeeRate = (feePercent ?? PLATFORM.fees.sellerPercent) / 100;
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: offerId } = await params;

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

  const action = body.action as string;
  if (!['accept', 'reject', 'counter'].includes(action)) {
    return NextResponse.json(
      { error: 'Acao invalida. Use: accept, reject ou counter' },
      { status: 400 }
    );
  }

  // Fetch the offer
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select('*, listing:listings!listing_id(*)')
    .eq('id', Number(offerId))
    .single();

  if (offerError || !offer) {
    return NextResponse.json(
      { error: 'Oferta nao encontrada' },
      { status: 404 }
    );
  }

  // Only the seller can accept/reject/counter
  if (offer.seller_id !== user.id) {
    return NextResponse.json(
      { error: 'Apenas o vendedor pode responder a esta oferta' },
      { status: 403 }
    );
  }

  // Offer must be PENDING to respond
  if (offer.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Esta oferta nao esta mais pendente' },
      { status: 400 }
    );
  }

  // Check if offer has expired
  if (new Date(offer.expires_at) < new Date()) {
    // Auto-expire the offer
    await supabase
      .from('offers')
      .update({ status: 'EXPIRED', updated_at: new Date().toISOString() })
      .eq('id', offer.id);

    return NextResponse.json(
      { error: 'Esta oferta expirou' },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // -----------------------------------------------------------------------
  // ACCEPT
  // -----------------------------------------------------------------------
  if (action === 'accept') {
    const agreedPrice = Number(offer.amount);
    const listing = offer.listing as Record<string, unknown>;
    const sellerFeePercent = (listing?.seller_fee_percent as number) ?? PLATFORM.fees.sellerPercent;
    const { platformFee, platformFeeRate, sellerNet } = calculateFees(agreedPrice, sellerFeePercent);

    // Generate unique transaction code
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

    // Create transaction with offer price
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        code: transactionCode,
        buyer_id: offer.buyer_id,
        seller_id: offer.seller_id,
        listing_id: offer.listing_id,
        agreed_price: agreedPrice,
        platform_fee: platformFee,
        platform_fee_rate: platformFeeRate,
        seller_net_amount: sellerNet,
        status: 'INITIATED',
        payment_deadline: paymentDeadline.toISOString(),
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (txnError) {
      console.error('[Offers Respond API] Transaction create error:', txnError);
      return NextResponse.json(
        { error: 'Falha ao criar transacao', details: txnError.message },
        { status: 500 }
      );
    }

    // Update offer status to ACCEPTED
    const { data: updatedOffer, error: updateError } = await supabase
      .from('offers')
      .update({
        status: 'ACCEPTED',
        responded_at: now,
        updated_at: now,
      })
      .eq('id', offer.id)
      .select(
        '*, buyer:profiles!buyer_id(id, name, avatar_url, rating_avg, is_verified), seller:profiles!seller_id(id, name, avatar_url), listing:listings!listing_id(id, title, slug, asking_price, original_price, images, status)'
      )
      .single();

    if (updateError) {
      console.error('[Offers Respond API] Offer update error:', updateError);
      return NextResponse.json(
        { error: 'Falha ao atualizar oferta', details: updateError.message },
        { status: 500 }
      );
    }

    // Expire other pending offers on the same listing
    await supabase
      .from('offers')
      .update({ status: 'EXPIRED', updated_at: now })
      .eq('listing_id', offer.listing_id)
      .eq('status', 'PENDING')
      .neq('id', offer.id);

    // Notify buyer that offer was accepted
    await supabase.from('notifications').insert({
      user_id: offer.buyer_id,
      channel: 'offer',
      title: 'Oferta aceita!',
      body: 'Sua oferta de R$ ' + agreedPrice.toFixed(2) + ' foi aceita! Prossiga com o pagamento.',
      data: {
        offer_id: offer.id,
        listing_id: offer.listing_id,
        transaction_id: transaction.id,
        amount: agreedPrice,
      },
      action_url: `/transactions/${transaction.id}`,
    });

    return NextResponse.json({
      data: updatedOffer,
      transaction,
      message: 'Oferta aceita! Transacao criada com sucesso.',
    });
  }

  // -----------------------------------------------------------------------
  // REJECT
  // -----------------------------------------------------------------------
  if (action === 'reject') {
    const { data: updatedOffer, error: updateError } = await supabase
      .from('offers')
      .update({
        status: 'REJECTED',
        responded_at: now,
        updated_at: now,
      })
      .eq('id', offer.id)
      .select(
        '*, buyer:profiles!buyer_id(id, name, avatar_url, rating_avg, is_verified), seller:profiles!seller_id(id, name, avatar_url), listing:listings!listing_id(id, title, slug, asking_price, original_price, images, status)'
      )
      .single();

    if (updateError) {
      console.error('[Offers Respond API] Reject error:', updateError);
      return NextResponse.json(
        { error: 'Falha ao rejeitar oferta', details: updateError.message },
        { status: 500 }
      );
    }

    // Notify buyer that offer was rejected
    await supabase.from('notifications').insert({
      user_id: offer.buyer_id,
      channel: 'offer',
      title: 'Oferta recusada',
      body: 'Sua oferta de R$ ' + Number(offer.amount).toFixed(2) + ' foi recusada pelo vendedor.',
      data: {
        offer_id: offer.id,
        listing_id: offer.listing_id,
        amount: Number(offer.amount),
      },
      action_url: `/marketplace/${offer.listing_id}`,
    });

    return NextResponse.json({
      data: updatedOffer,
      message: 'Oferta recusada.',
    });
  }

  // -----------------------------------------------------------------------
  // COUNTER
  // -----------------------------------------------------------------------
  if (action === 'counter') {
    const counterAmount = body.counter_amount ? Number(body.counter_amount) : null;
    const counterMessage = typeof body.counter_message === 'string' ? body.counter_message.trim() : null;

    if (!counterAmount || counterAmount <= 0) {
      return NextResponse.json(
        { error: 'O valor da contra-oferta deve ser maior que zero' },
        { status: 400 }
      );
    }

    const { data: updatedOffer, error: updateError } = await supabase
      .from('offers')
      .update({
        status: 'COUNTERED',
        counter_amount: counterAmount,
        counter_message: counterMessage || null,
        responded_at: now,
        updated_at: now,
      })
      .eq('id', offer.id)
      .select(
        '*, buyer:profiles!buyer_id(id, name, avatar_url, rating_avg, is_verified), seller:profiles!seller_id(id, name, avatar_url), listing:listings!listing_id(id, title, slug, asking_price, original_price, images, status)'
      )
      .single();

    if (updateError) {
      console.error('[Offers Respond API] Counter error:', updateError);
      return NextResponse.json(
        { error: 'Falha ao enviar contra-oferta', details: updateError.message },
        { status: 500 }
      );
    }

    // Notify buyer about counter-offer
    await supabase.from('notifications').insert({
      user_id: offer.buyer_id,
      channel: 'offer',
      title: 'Contra-oferta recebida!',
      body: 'O vendedor fez uma contra-oferta de R$ ' + counterAmount.toFixed(2) + '.',
      data: {
        offer_id: offer.id,
        listing_id: offer.listing_id,
        counter_amount: counterAmount,
      },
      action_url: `/marketplace/${offer.listing_id}`,
    });

    return NextResponse.json({
      data: updatedOffer,
      message: 'Contra-oferta enviada com sucesso.',
    });
  }

  return NextResponse.json({ error: 'Acao nao processada' }, { status: 400 });
}
