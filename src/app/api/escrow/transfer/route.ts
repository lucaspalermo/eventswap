import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailService } from '@/lib/email';
import { escrowTransferSchema, validateBody } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Escrow Transfer API
// POST - Seller marks reservation as transferred to buyer
//        Sets escrow_release_date to 7 days from now
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

  const validation = validateBody(escrowTransferSchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const transactionId = validation.data.transaction_id;

  // Fetch the transaction
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

  // Only seller can mark as transferred
  if (transaction.seller_id !== user.id) {
    return NextResponse.json(
      { error: 'Apenas o vendedor pode marcar a reserva como transferida' },
      { status: 403 }
    );
  }

  // Transaction must be in ESCROW_HELD or PAYMENT_CONFIRMED status
  if (!['ESCROW_HELD', 'PAYMENT_CONFIRMED'].includes(transaction.status)) {
    return NextResponse.json(
      { error: 'Transacao nao esta no status correto para transferencia. Status atual: ' + transaction.status },
      { status: 400 }
    );
  }

  const now = new Date();
  const escrowReleaseDate = new Date(now);
  escrowReleaseDate.setDate(escrowReleaseDate.getDate() + ESCROW_TIMEOUT_DAYS);

  // Update transaction
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      status: 'TRANSFER_PENDING',
      seller_transferred_at: now.toISOString(),
      escrow_release_date: escrowReleaseDate.toISOString(),
      auto_release: false,
      updated_at: now.toISOString(),
    })
    .eq('id', transactionId);

  if (updateError) {
    console.error('[Escrow Transfer] Update error:', updateError);
    return NextResponse.json(
      { error: 'Falha ao atualizar transacao', details: updateError.message },
      { status: 500 }
    );
  }

  // Notify buyer about the transfer (fire-and-forget)
  const buyer = transaction.buyer as unknown as { name: string; email: string } | null;
  const seller = transaction.seller as unknown as { name: string; email: string } | null;
  const listing = transaction.listing as unknown as { title: string } | null;

  if (buyer?.email) {
    Promise.resolve().then(() =>
      emailService.sendGenericNotification(buyer.email, {
        recipientName: buyer.name,
        subject: 'O vendedor transferiu a reserva - EventSwap',
        preheader: `Confirme o recebimento em ate ${ESCROW_TIMEOUT_DAYS} dias.`,
        heading: 'Reserva transferida!',
        bodyText: `O vendedor ${seller?.name} informou que transferiu a reserva "${listing?.title}" para voce. Confirme o recebimento em ate ${ESCROW_TIMEOUT_DAYS} dias. Caso nao confirme, o valor sera liberado automaticamente ao vendedor.`,
        ctaText: 'Confirmar Recebimento',
        ctaUrl: `/transactions/${transactionId}`,
      })
    );
  }

  // Notify seller about successful marking
  if (seller?.email) {
    Promise.resolve().then(() =>
      emailService.sendGenericNotification(seller.email, {
        recipientName: seller.name,
        subject: 'Transferencia registrada - EventSwap',
        preheader: 'Aguardando confirmacao do comprador.',
        heading: 'Transferencia registrada com sucesso!',
        bodyText: `Voce marcou a reserva "${listing?.title}" como transferida. O comprador ${buyer?.name} tem ate ${ESCROW_TIMEOUT_DAYS} dias para confirmar o recebimento. Apos esse prazo, o valor sera liberado automaticamente para sua carteira.`,
        ctaText: 'Ver Transacao',
        ctaUrl: `/transactions/${transactionId}`,
      })
    );
  }

  return NextResponse.json({
    data: {
      transaction_id: transactionId,
      status: 'TRANSFER_PENDING',
      seller_transferred_at: now.toISOString(),
      escrow_release_date: escrowReleaseDate.toISOString(),
      auto_release_in_days: ESCROW_TIMEOUT_DAYS,
    },
    message: `Reserva marcada como transferida. O comprador tem ${ESCROW_TIMEOUT_DAYS} dias para confirmar o recebimento.`,
  });
}
