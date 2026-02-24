import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailService } from '@/lib/email';
import { escrowReleaseSchema, validateBody } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Escrow Release API
// POST - Buyer confirms receipt of transferred reservation
//        OR auto-release after 7 days if buyer doesn't confirm
// ---------------------------------------------------------------------------

const ESCROW_TIMEOUT_DAYS = 7;

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

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 });
  }

  const validation = validateBody(escrowReleaseSchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const transactionId = validation.data.transaction_id;
  const isAutoRelease = (rawBody as Record<string, unknown>).auto_release === true;

  // Fetch the transaction with related data
  const { data: transaction, error: txnError } = await supabase
    .from('transactions')
    .select('*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), listing:listings!listing_id(*)')
    .eq('id', transactionId)
    .single();

  if (txnError || !transaction) {
    return NextResponse.json(
      { error: 'Transacao nao encontrada' },
      { status: 404 }
    );
  }

  // Only transaction participants can release escrow
  if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
    return NextResponse.json(
      { error: 'Voce nao tem permissao para esta transacao' },
      { status: 403 }
    );
  }

  // Only buyer can manually confirm
  if (!isAutoRelease && transaction.buyer_id !== user.id) {
    return NextResponse.json(
      { error: 'Apenas o comprador pode confirmar o recebimento' },
      { status: 403 }
    );
  }

  // Transaction must be in TRANSFER_PENDING status
  if (transaction.status !== 'TRANSFER_PENDING') {
    return NextResponse.json(
      { error: 'Transacao nao esta aguardando confirmacao de transferencia' },
      { status: 400 }
    );
  }

  // For auto-release, verify the timeout period has elapsed
  if (isAutoRelease && transaction.escrow_release_date) {
    const releaseDate = new Date(transaction.escrow_release_date);
    if (new Date() < releaseDate) {
      return NextResponse.json(
        { error: 'Periodo de escrow ainda nao expirou' },
        { status: 400 }
      );
    }
  }

  const now = new Date().toISOString();

  // Update transaction to COMPLETED
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      status: 'COMPLETED',
      buyer_confirmed_at: now,
      auto_release: isAutoRelease,
      updated_at: now,
    })
    .eq('id', transactionId);

  if (updateError) {
    console.error('[Escrow Release] Update error:', updateError);
    return NextResponse.json(
      { error: 'Falha ao liberar escrow', details: updateError.message },
      { status: 500 }
    );
  }

  // Update listing status to SOLD
  if (transaction.listing_id) {
    await supabase
      .from('listings')
      .update({ status: 'SOLD', updated_at: now })
      .eq('id', transaction.listing_id);
  }

  // Send notifications to both parties (fire-and-forget)
  const buyer = transaction.buyer as unknown as { name: string; email: string } | null;
  const seller = transaction.seller as unknown as { name: string; email: string } | null;
  const listing = transaction.listing as unknown as { title: string } | null;

  const amountFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(transaction.seller_net_amount || transaction.agreed_price);

  // Notify seller that payment will be released
  if (seller?.email) {
    Promise.resolve().then(() =>
      emailService.sendGenericNotification(seller.email, {
        recipientName: seller.name,
        subject: isAutoRelease
          ? 'Valor liberado automaticamente - EventSwap'
          : 'Comprador confirmou recebimento - EventSwap',
        preheader: `O valor de ${amountFormatted} sera creditado na sua carteira.`,
        heading: isAutoRelease
          ? 'Valor liberado automaticamente'
          : 'Comprador confirmou o recebimento!',
        bodyText: isAutoRelease
          ? `O prazo de ${ESCROW_TIMEOUT_DAYS} dias para confirmacao expirou. O valor de ${amountFormatted} referente ao anuncio "${listing?.title}" foi liberado automaticamente para sua carteira.`
          : `O comprador ${buyer?.name} confirmou o recebimento da reserva "${listing?.title}". O valor de ${amountFormatted} sera creditado na sua carteira.`,
        ctaText: 'Ver Carteira',
        ctaUrl: '/wallet',
      })
    );
  }

  // Notify buyer about completion
  if (buyer?.email) {
    Promise.resolve().then(() =>
      emailService.sendGenericNotification(buyer.email, {
        recipientName: buyer.name,
        subject: 'Transacao concluida com sucesso - EventSwap',
        preheader: `A transacao do anuncio "${listing?.title}" foi finalizada.`,
        heading: 'Transacao concluida!',
        bodyText: isAutoRelease
          ? `O prazo de ${ESCROW_TIMEOUT_DAYS} dias para confirmacao expirou e a transacao do anuncio "${listing?.title}" foi concluida automaticamente. Se houver algum problema, entre em contato com nosso suporte.`
          : `Voce confirmou o recebimento da reserva "${listing?.title}". A transacao foi concluida com sucesso!`,
        ctaText: 'Ver Transacao',
        ctaUrl: `/transactions/${transactionId}`,
      })
    );
  }

  return NextResponse.json({
    data: {
      transaction_id: transactionId,
      status: 'COMPLETED',
      auto_release: isAutoRelease,
      completed_at: now,
    },
    message: isAutoRelease
      ? 'Escrow liberado automaticamente apos prazo de confirmacao'
      : 'Recebimento confirmado com sucesso. Valor liberado ao vendedor.',
  });
}
