import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLATFORM } from '@/lib/constants';
import { asaasCustomers, asaasPayments } from '@/lib/asaas';
import type { AsaasPixQrCode } from '@/lib/asaas';
import { subscribePlanSchema, validateBody } from '@/lib/validations';

// ---------------------------------------------------------------------------
// POST /api/plans/subscribe
// Body: { plan: 'pro' | 'business', listing_id: number }
// Creates an Asaas payment for the plan and stores a seller_plans record.
// ---------------------------------------------------------------------------

type PlanId = 'gratuito' | 'pro' | 'business';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Autenticacao necessaria' }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 });
  }

  const validation = validateBody(subscribePlanSchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const planId = validation.data.plan as PlanId;
  const listingId = validation.data.listing_id;

  // Fetch the listing and verify ownership
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Anuncio nao encontrado' }, { status: 404 });
  }

  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: 'Voce nao e o dono deste anuncio' }, { status: 403 });
  }

  // Get plan config
  const planConfig = PLATFORM.plans[planId];
  if (!planConfig || planConfig.price <= 0) {
    return NextResponse.json({ error: 'Configuracao de plano invalida' }, { status: 400 });
  }

  // Get seller profile (with CPF for Asaas)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.cpf) {
    return NextResponse.json(
      { error: 'CPF e obrigatorio para realizar pagamentos.', code: 'CPF_REQUIRED' },
      { status: 400 },
    );
  }

  try {
    // Get or create Asaas customer
    const asaasCustomer = await asaasCustomers.getOrCreate({
      name: profile.name,
      email: profile.email,
      cpfCnpj: profile.cpf,
      phone: profile.phone || undefined,
      externalReference: user.id,
    });

    // Create Asaas payment for the plan price
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    const asaasPayment = await asaasPayments.create({
      customer: asaasCustomer.id,
      billingType: 'PIX',
      value: planConfig.price,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `EventSwap - Plano ${planConfig.name} - Anuncio #${listingId}`,
      externalReference: `plan_${planId}_listing_${listingId}`,
    });

    // Insert seller_plans record
    await supabase.from('seller_plans').insert({
      user_id: user.id,
      plan_type: planId,
      commission_rate: planConfig.sellerFeePercent / 100,
      asaas_subscription_id: asaasPayment.id,
      status: 'pending',
      features: {
        listing_id: listingId,
        plan_name: planConfig.name,
        price: planConfig.price,
        max_photos: planConfig.maxPhotos,
        highlights: planConfig.highlights,
      },
      starts_at: new Date().toISOString(),
    });

    // Update Asaas customer ID on profile if not set
    if (!profile.asaas_customer_id) {
      await supabase
        .from('profiles')
        .update({ asaas_customer_id: asaasCustomer.id })
        .eq('id', user.id);
    }

    // Get PIX QR code
    let pixData: AsaasPixQrCode | null = null;
    if (asaasPayment.id) {
      try {
        pixData = await asaasPayments.getPixQrCode(asaasPayment.id);
      } catch (pixErr) {
        console.error('[Plans API] PIX QR code error:', pixErr);
      }
    }

    return NextResponse.json(
      {
        data: {
          plan: planId,
          plan_name: planConfig.name,
          listing_id: listingId,
          seller_fee_percent: planConfig.sellerFeePercent,
          amount: planConfig.price,
          status: 'pending',
          asaas_payment_id: asaasPayment.id,
          invoice_url: asaasPayment.invoiceUrl || null,
          pix: pixData
            ? {
                qr_code_image: pixData.encodedImage,
                copy_paste: pixData.payload,
                expiration_date: pixData.expirationDate,
              }
            : null,
        },
        message: 'Pagamento do plano criado com sucesso',
      },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Plans API] Asaas error:', msg);
    return NextResponse.json(
      { error: `Erro ao processar pagamento: ${msg}` },
      { status: 500 },
    );
  }
}
