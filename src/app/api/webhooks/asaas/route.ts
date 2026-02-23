import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapAsaasPaymentStatus } from '@/lib/asaas';
import type { AsaasWebhookEvent } from '@/lib/asaas';
import { emailService } from '@/lib/email';

// ---------------------------------------------------------------------------
// Asaas Webhook Handler
// Handles payment and transfer events from Asaas gateway
// Docs: https://docs.asaas.com/docs/webhook
// ---------------------------------------------------------------------------

/**
 * Validates the webhook token sent by Asaas.
 * Asaas sends the token as a query parameter or custom header.
 */
function verifyWebhookToken(req: NextRequest): boolean {
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!webhookToken) {
    return false;
  }

  // Check asaas_access_token header first (custom header approach)
  const headerToken = req.headers.get('asaas-access-token');
  if (headerToken === webhookToken) {
    return true;
  }

  // Check query parameter approach
  const { searchParams } = new URL(req.url);
  const queryToken = searchParams.get('access_token');
  if (queryToken === webhookToken) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  // Verify webhook token
  if (!verifyWebhookToken(req)) {
    console.error('[Asaas Webhook] Token de autenticacao invalido');
    return NextResponse.json(
      { error: 'Token de autenticacao invalido' },
      { status: 401 }
    );
  }

  let event: AsaasWebhookEvent;

  try {
    event = await req.json() as AsaasWebhookEvent;
  } catch (parseError) {
    console.error('[Asaas Webhook] Falha ao processar corpo da requisicao:', parseError);
    return NextResponse.json(
      { error: 'Corpo JSON invalido' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.event) {
      // -----------------------------------------------------------------------
      // Pagamento recebido/confirmado - atualizar para SUCCEEDED, escrow, reservar
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

        // Mover para ESCROW_HELD (fundos retidos pela plataforma)
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

        // Buscar dados da transacao com buyer, seller e listing para emails
        const { data: txnForEmail } = await supabase
          .from('transactions')
          .select(
            'code, agreed_price, buyer_id, seller_id, listing:listings!listing_id(title), buyer:profiles!buyer_id(name, email), seller:profiles!seller_id(name, email)'
          )
          .eq('id', parseInt(transactionId))
          .single();

        // Atualizar o anuncio para RESERVED
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

        // Enviar emails de pagamento confirmado (fire-and-forget)
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
      // Pagamento vencido - cancelar a transacao
      // -----------------------------------------------------------------------
      case 'PAYMENT_OVERDUE': {
        const payment = event.payment;
        if (!payment) {
          console.warn('[Asaas Webhook] Evento PAYMENT_OVERDUE sem dados de payment');
          break;
        }

        const transactionId = payment.externalReference;
        if (!transactionId) {
          console.warn('[Asaas Webhook] Pagamento vencido sem externalReference');
          break;
        }

        // Atualizar registro de pagamento
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'FAILED',
            updated_at: new Date().toISOString(),
          })
          .eq('asaas_payment_id', payment.id);

        if (paymentError) {
          console.error('[Asaas Webhook] Falha ao atualizar pagamento vencido:', paymentError);
        }

        // Cancelar a transacao
        const { error: txnError } = await supabase
          .from('transactions')
          .update({
            status: 'CANCELLED',
            cancelled_at: new Date().toISOString(),
            cancel_reason: 'Pagamento vencido - prazo expirado',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .in('status', ['INITIATED', 'AWAITING_PAYMENT']);

        if (txnError) {
          console.error('[Asaas Webhook] Falha ao cancelar transacao:', txnError);
        }

        // Reativar o anuncio se estava reservado
        const { data: transaction } = await supabase
          .from('transactions')
          .select('listing_id')
          .eq('id', parseInt(transactionId))
          .single();

        if (transaction?.listing_id) {
          await supabase
            .from('listings')
            .update({
              status: 'ACTIVE',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.listing_id)
            .eq('status', 'RESERVED');
        }

        console.log(`[Asaas Webhook] Transacao ${transactionId} CANCELADA por pagamento vencido`);
        break;
      }

      // -----------------------------------------------------------------------
      // Pagamento reembolsado - reembolsar a transacao
      // -----------------------------------------------------------------------
      case 'PAYMENT_REFUNDED': {
        const payment = event.payment;
        if (!payment) {
          console.warn('[Asaas Webhook] Evento PAYMENT_REFUNDED sem dados de payment');
          break;
        }

        const transactionId = payment.externalReference;
        if (!transactionId) {
          console.warn('[Asaas Webhook] Reembolso sem externalReference');
          break;
        }

        // Atualizar registro de pagamento
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'REFUNDED',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('asaas_payment_id', payment.id);

        if (paymentError) {
          console.error('[Asaas Webhook] Falha ao atualizar pagamento reembolsado:', paymentError);
        }

        // Atualizar transacao para REFUNDED
        const { error: txnError } = await supabase
          .from('transactions')
          .update({
            status: 'REFUNDED',
            cancelled_at: new Date().toISOString(),
            cancel_reason: 'Pagamento reembolsado',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId));

        if (txnError) {
          console.error('[Asaas Webhook] Falha ao reembolsar transacao:', txnError);
        }

        // Reativar o anuncio
        const { data: transaction } = await supabase
          .from('transactions')
          .select('listing_id')
          .eq('id', parseInt(transactionId))
          .single();

        if (transaction?.listing_id) {
          await supabase
            .from('listings')
            .update({
              status: 'ACTIVE',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.listing_id)
            .in('status', ['RESERVED', 'SOLD']);
        }

        console.log(`[Asaas Webhook] Transacao ${transactionId} REEMBOLSADA`);
        break;
      }

      // -----------------------------------------------------------------------
      // Transferencia concluida - completar a transacao, marcar como SOLD
      // -----------------------------------------------------------------------
      case 'TRANSFER_DONE': {
        const transfer = event.transfer;
        if (!transfer) {
          console.warn('[Asaas Webhook] Evento TRANSFER_DONE sem dados de transfer');
          break;
        }

        const transactionId = transfer.externalReference;
        if (!transactionId) {
          console.warn('[Asaas Webhook] Transferencia sem externalReference');
          break;
        }

        // Atualizar pagamento com ID da transferencia e marcar como SUCCEEDED
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            asaas_transfer_id: transfer.id,
            status: 'SUCCEEDED',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', parseInt(transactionId));

        if (paymentError) {
          console.error('[Asaas Webhook] Falha ao atualizar pagamento com transferencia:', paymentError);
        }

        // Completar a transacao
        const { error: txnError } = await supabase
          .from('transactions')
          .update({
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .in('status', ['ESCROW_HELD', 'TRANSFER_PENDING']);

        if (txnError) {
          console.error('[Asaas Webhook] Falha ao completar transacao:', txnError);
        }

        // Buscar dados da transacao com buyer, seller e listing para emails
        const { data: txnForEmail } = await supabase
          .from('transactions')
          .select(
            'code, agreed_price, buyer:profiles!buyer_id(name, email), seller:profiles!seller_id(name, email)'
          )
          .eq('id', parseInt(transactionId))
          .single();

        // Atualizar anuncio para SOLD
        const { data: transaction } = await supabase
          .from('transactions')
          .select('listing_id')
          .eq('id', parseInt(transactionId))
          .single();

        if (transaction?.listing_id) {
          await supabase
            .from('listings')
            .update({
              status: 'SOLD',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.listing_id);
        }

        // Enviar emails de transacao concluida (fire-and-forget)
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
      // Transferencia criada - apenas log (transferencia ainda em processamento)
      // -----------------------------------------------------------------------
      case 'TRANSFER_CREATED': {
        const transfer = event.transfer;
        if (!transfer) break;

        const transactionId = transfer.externalReference;
        if (!transactionId) break;

        // Mover transacao para TRANSFER_PENDING
        const { error: txnError } = await supabase
          .from('transactions')
          .update({
            status: 'TRANSFER_PENDING',
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(transactionId))
          .eq('status', 'ESCROW_HELD');

        if (txnError) {
          console.error('[Asaas Webhook] Falha ao marcar transferencia pendente:', txnError);
        }

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
