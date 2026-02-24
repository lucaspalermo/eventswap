import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAsaasPaymentStatus } from '@/lib/asaas';
import type { AsaasWebhookEvent } from '@/lib/asaas';
import { emailService } from '@/lib/email';
import { asaasWebhookSchema, validateBody } from '@/lib/validations';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Asaas Webhook Handler (Secured with HMAC + Idempotency)
// Handles payment and transfer events from Asaas gateway
// ---------------------------------------------------------------------------

/**
 * Verifies webhook authenticity via HMAC signature or token fallback.
 * HMAC: sha256(rawBody, ASAAS_WEBHOOK_SECRET)
 * Fallback: token-based (legacy) via header or query param.
 */
function verifyWebhook(req: NextRequest, rawBody: string): boolean {
  // 1) HMAC signature verification (preferred)
  const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;
  const signature = req.headers.get('x-asaas-signature') || req.headers.get('x-hub-signature-256');

  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (isValid) return true;

    // If HMAC is configured but fails, reject immediately
    console.error('[Asaas Webhook] HMAC signature mismatch');
    return false;
  }

  // 2) Token-based fallback (legacy)
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!webhookToken) return false;

  const headerToken = req.headers.get('asaas-access-token');
  if (headerToken === webhookToken) return true;

  const { searchParams } = new URL(req.url);
  const queryToken = searchParams.get('access_token');
  if (queryToken === webhookToken) return true;

  return false;
}

/**
 * Idempotency check — prevents processing the same webhook event twice.
 * Uses a webhook_events table to track processed event IDs.
 */
async function checkIdempotency(
  eventId: string,
  eventType: string
): Promise<{ isDuplicate: boolean }> {
  const adminSupabase = createAdminClient();

  // Try to insert — if it already exists, it's a duplicate
  const { error } = await adminSupabase
    .from('webhook_events')
    .insert({
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });

  if (error) {
    // Unique constraint violation = duplicate
    if (error.code === '23505') {
      console.log(`[Asaas Webhook] Duplicate event skipped: ${eventId}`);
      return { isDuplicate: true };
    }
    // Other errors — log but allow processing (fail-open for availability)
    console.error('[Asaas Webhook] Idempotency check error:', error.message);
  }

  return { isDuplicate: false };
}

export async function POST(req: NextRequest) {
  // Read raw body for HMAC verification
  const rawBody = await req.text();

  // Verify webhook authenticity
  if (!verifyWebhook(req, rawBody)) {
    console.error('[Asaas Webhook] Token de autenticacao invalido');
    return NextResponse.json(
      { error: 'Token de autenticacao invalido' },
      { status: 401 }
    );
  }

  // Parse body
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    console.error('[Asaas Webhook] Falha ao processar corpo da requisicao');
    return NextResponse.json(
      { error: 'Corpo JSON invalido' },
      { status: 400 }
    );
  }

  // Validate with Zod
  const validation = validateBody(asaasWebhookSchema, parsedBody);
  if (!validation.success) {
    return validation.response;
  }

  const event = parsedBody as AsaasWebhookEvent;

  // Generate idempotency key from payment/transfer ID + event type
  const resourceId = event.payment?.id || event.transfer?.id || 'unknown';
  const idempotencyKey = `${event.event}_${resourceId}`;

  // Check for duplicate processing
  const { isDuplicate } = await checkIdempotency(idempotencyKey, event.event);
  if (isDuplicate) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const supabase = await createClient();

  try {
    switch (event.event) {
      // -----------------------------------------------------------------------
      // Pagamento recebido/confirmado
      // -----------------------------------------------------------------------
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED': {
        const payment = event.payment;
        if (!payment) {
          console.warn('[Asaas Webhook] Evento de pagamento sem dados de payment');
          break;
        }

        const transactionId = payment.externalReference;
        if (!transactionId) {
          console.warn('[Asaas Webhook] Pagamento sem externalReference (transaction_id)');
          break;
        }

        const internalStatus = mapAsaasPaymentStatus(payment.status);

        // Atualizar o registro de pagamento
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: internalStatus,
            gateway_fee: payment.value - payment.netValue,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('asaas_payment_id', payment.id);

        if (paymentError) {
          console.error('[Asaas Webhook] Falha ao atualizar pagamento:', paymentError);
        }

        // Atualizar transacao para PAYMENT_CONFIRMED
        const { error: txnConfirmError } = await supabase
          .from('transactions')
          .update({
            status: 'PAYMENT_CONFIRMED',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .in('status', ['INITIATED', 'AWAITING_PAYMENT']);

        if (txnConfirmError) {
          console.error('[Asaas Webhook] Falha ao confirmar transacao:', txnConfirmError);
          break;
        }

        // Mover para ESCROW_HELD
        const { error: escrowError } = await supabase
          .from('transactions')
          .update({
            status: 'ESCROW_HELD',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .eq('status', 'PAYMENT_CONFIRMED');

        if (escrowError) {
          console.error('[Asaas Webhook] Falha ao mover para escrow:', escrowError);
        }

        // Buscar dados para emails
        const { data: txnForEmail } = await supabase
          .from('transactions')
          .select(
            'code, agreed_price, buyer_id, seller_id, listing:listings!listing_id(title), buyer:profiles!buyer_id(name, email), seller:profiles!seller_id(name, email)'
          )
          .eq('id', parseInt(transactionId))
          .single();

        // Atualizar anuncio para RESERVED
        const { data: transaction } = await supabase
          .from('transactions')
          .select('listing_id')
          .eq('id', parseInt(transactionId))
          .single();

        if (transaction?.listing_id) {
          await supabase
            .from('listings')
            .update({
              status: 'RESERVED',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.listing_id)
            .eq('status', 'ACTIVE');
        }

        // Enviar emails (fire-and-forget)
        if (txnForEmail) {
          const listing = txnForEmail.listing as unknown as { title: string } | null;
          const buyer = txnForEmail.buyer as unknown as { name: string; email: string } | null;
          const seller = txnForEmail.seller as unknown as { name: string; email: string } | null;
          const amountFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(txnForEmail.agreed_price);

          if (buyer?.email) {
            Promise.resolve().then(() =>
              emailService.sendPaymentConfirmed(buyer.email, {
                name: buyer.name,
                transactionCode: txnForEmail.code,
                amount: amountFormatted,
                listingTitle: listing?.title ?? '',
              })
            );
          }

          if (seller?.email) {
            Promise.resolve().then(() =>
              emailService.sendPaymentConfirmed(seller.email, {
                name: seller.name,
                transactionCode: txnForEmail.code,
                amount: amountFormatted,
                listingTitle: listing?.title ?? '',
              })
            );
          }
        }

        console.log(`[Asaas Webhook] Transacao ${transactionId} movida para ESCROW_HELD`);
        break;
      }

      // -----------------------------------------------------------------------
      // Pagamento vencido
      // -----------------------------------------------------------------------
      case 'PAYMENT_OVERDUE': {
        const payment = event.payment;
        if (!payment?.externalReference) break;

        const transactionId = payment.externalReference;

        await supabase
          .from('payments')
          .update({ status: 'FAILED', updated_at: new Date().toISOString() })
          .eq('asaas_payment_id', payment.id);

        await supabase
          .from('transactions')
          .update({
            status: 'CANCELLED',
            cancelled_at: new Date().toISOString(),
            cancel_reason: 'Pagamento vencido - prazo expirado',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .in('status', ['INITIATED', 'AWAITING_PAYMENT']);

        const { data: transaction } = await supabase
          .from('transactions')
          .select('listing_id')
          .eq('id', parseInt(transactionId))
          .single();

        if (transaction?.listing_id) {
          await supabase
            .from('listings')
            .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
            .eq('id', transaction.listing_id)
            .eq('status', 'RESERVED');
        }

        console.log(`[Asaas Webhook] Transacao ${transactionId} CANCELADA por pagamento vencido`);
        break;
      }

      // -----------------------------------------------------------------------
      // Pagamento reembolsado
      // -----------------------------------------------------------------------
      case 'PAYMENT_REFUNDED': {
        const payment = event.payment;
        if (!payment?.externalReference) break;

        const transactionId = payment.externalReference;

        await supabase
          .from('payments')
          .update({
            status: 'REFUNDED',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('asaas_payment_id', payment.id);

        await supabase
          .from('transactions')
          .update({
            status: 'REFUNDED',
            cancelled_at: new Date().toISOString(),
            cancel_reason: 'Pagamento reembolsado',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId));

        const { data: transaction } = await supabase
          .from('transactions')
          .select('listing_id')
          .eq('id', parseInt(transactionId))
          .single();

        if (transaction?.listing_id) {
          await supabase
            .from('listings')
            .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
            .eq('id', transaction.listing_id)
            .in('status', ['RESERVED', 'SOLD']);
        }

        console.log(`[Asaas Webhook] Transacao ${transactionId} REEMBOLSADA`);
        break;
      }

      // -----------------------------------------------------------------------
      // Transferencia concluida
      // -----------------------------------------------------------------------
      case 'TRANSFER_DONE': {
        const transfer = event.transfer;
        if (!transfer?.externalReference) break;

        const transactionId = transfer.externalReference;

        await supabase
          .from('payments')
          .update({
            asaas_transfer_id: transfer.id,
            status: 'SUCCEEDED',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', parseInt(transactionId));

        await supabase
          .from('transactions')
          .update({
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .in('status', ['ESCROW_HELD', 'TRANSFER_PENDING']);

        // Buscar dados para emails
        const { data: txnForEmail } = await supabase
          .from('transactions')
          .select(
            'code, agreed_price, buyer:profiles!buyer_id(name, email), seller:profiles!seller_id(name, email)'
          )
          .eq('id', parseInt(transactionId))
          .single();

        // Marcar anuncio como SOLD
        const { data: transaction } = await supabase
          .from('transactions')
          .select('listing_id')
          .eq('id', parseInt(transactionId))
          .single();

        if (transaction?.listing_id) {
          await supabase
            .from('listings')
            .update({ status: 'SOLD', updated_at: new Date().toISOString() })
            .eq('id', transaction.listing_id);
        }

        // Emails de conclusao
        if (txnForEmail) {
          const buyer = txnForEmail.buyer as unknown as { name: string; email: string } | null;
          const seller = txnForEmail.seller as unknown as { name: string; email: string } | null;
          const amountFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(txnForEmail.agreed_price);

          if (buyer?.email) {
            Promise.resolve().then(() =>
              emailService.sendTransactionCompleted(buyer.email, {
                name: buyer.name,
                transactionCode: txnForEmail.code,
                amount: amountFormatted,
              })
            );
          }

          if (seller?.email) {
            Promise.resolve().then(() =>
              emailService.sendTransactionCompleted(seller.email, {
                name: seller.name,
                transactionCode: txnForEmail.code,
                amount: amountFormatted,
              })
            );
          }
        }

        console.log(`[Asaas Webhook] Transacao ${transactionId} COMPLETADA via transferencia`);
        break;
      }

      // -----------------------------------------------------------------------
      // Transferencia criada
      // -----------------------------------------------------------------------
      case 'TRANSFER_CREATED': {
        const transfer = event.transfer;
        if (!transfer?.externalReference) break;

        const transactionId = transfer.externalReference;

        await supabase
          .from('transactions')
          .update({
            status: 'TRANSFER_PENDING',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .eq('status', 'ESCROW_HELD');

        console.log(`[Asaas Webhook] Transferencia criada para transacao ${transactionId}`);
        break;
      }

      default: {
        console.log(`[Asaas Webhook] Evento nao tratado: ${event.event}`);
      }
    }
  } catch (err) {
    console.error('[Asaas Webhook] Erro ao processar evento:', err);
    return NextResponse.json(
      { error: 'Falha ao processar webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
