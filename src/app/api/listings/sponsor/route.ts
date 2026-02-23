import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asaasCustomers, asaasPayments } from '@/lib/asaas';
import type { AsaasPixQrCode } from '@/lib/asaas';

// ---------------------------------------------------------------------------
// Sponsored Listings API
// POST - Create a sponsored listing payment
// ---------------------------------------------------------------------------

const SPONSOR_PLANS = {
  weekly: {
    label: 'Semanal',
    amount: 29.90,
    durationDays: 7,
  },
  monthly: {
    label: 'Mensal',
    amount: 79.90,
    durationDays: 30,
  },
} as const;

type SponsorPlan = keyof typeof SPONSOR_PLANS;

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
  const plan = body.plan as string | null;

  if (!listingId) {
    return NextResponse.json(
      { error: 'listing_id e obrigatorio' },
      { status: 400 }
    );
  }

  if (!plan || !['weekly', 'monthly'].includes(plan)) {
    return NextResponse.json(
      { error: 'Plano invalido. Use "weekly" ou "monthly"' },
      { status: 400 }
    );
  }

  const selectedPlan = SPONSOR_PLANS[plan as SponsorPlan];

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

  // Only listing owner can sponsor
  if (listing.seller_id !== user.id) {
    return NextResponse.json(
      { error: 'Voce so pode patrocinar seus proprios anuncios' },
      { status: 403 }
    );
  }

  // Listing must be active
  if (listing.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Apenas anuncios ativos podem ser patrocinados' },
      { status: 400 }
    );
  }

  // Check if already sponsored and not expired
  if (listing.is_sponsored && listing.sponsored_until) {
    const sponsoredUntil = new Date(listing.sponsored_until);
    if (sponsoredUntil > new Date()) {
      return NextResponse.json(
        {
          error: 'Este anuncio ja esta em destaque',
          sponsored_until: listing.sponsored_until,
        },
        { status: 409 }
      );
    }
  }

  // Get user profile for Asaas customer
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    return NextResponse.json(
      { error: 'Perfil nao encontrado' },
      { status: 404 }
    );
  }

  if (!userProfile.cpf) {
    return NextResponse.json(
      { error: 'CPF e obrigatorio para realizar pagamentos. Atualize seu perfil.' },
      { status: 400 }
    );
  }

  // Create sponsored payment record
  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setDate(endsAt.getDate() + selectedPlan.durationDays);

  const { data: sponsoredPayment, error: spError } = await supabase
    .from('sponsored_payments')
    .insert({
      listing_id: listingId,
      user_id: user.id,
      plan: plan,
      amount: selectedPlan.amount,
      status: 'pending',
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select('*')
    .single();

  if (spError) {
    console.error('[Sponsor API] Insert error:', spError);
    return NextResponse.json(
      { error: 'Falha ao criar pagamento de patrocinio', details: spError.message },
      { status: 500 }
    );
  }

  // Create Asaas payment
  let asaasPaymentId: string | null = null;
  let pixData: AsaasPixQrCode | null = null;
  let invoiceUrl: string | null = null;

  try {
    const asaasCustomer = await asaasCustomers.getOrCreate({
      name: userProfile.name,
      email: userProfile.email,
      cpfCnpj: userProfile.cpf,
      phone: userProfile.phone || undefined,
      externalReference: user.id,
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    const asaasPayment = await asaasPayments.create({
      customer: asaasCustomer.id,
      billingType: 'PIX',
      value: selectedPlan.amount,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `EventSwap - Destaque ${selectedPlan.label} - ${listing.title}`,
      externalReference: `sponsor_${sponsoredPayment.id}`,
    });

    asaasPaymentId = asaasPayment.id;
    invoiceUrl = asaasPayment.invoiceUrl || null;

    // Update sponsored payment with Asaas ID
    await supabase
      .from('sponsored_payments')
      .update({ asaas_payment_id: asaasPayment.id })
      .eq('id', sponsoredPayment.id);

    // Get PIX QR code
    if (asaasPayment.id) {
      try {
        pixData = await asaasPayments.getPixQrCode(asaasPayment.id);
      } catch (pixError) {
        console.error('[Sponsor API] PIX QR code error:', pixError);
      }
    }

    // Update Asaas customer ID on profile if not set
    if (!userProfile.asaas_customer_id) {
      await supabase
        .from('profiles')
        .update({ asaas_customer_id: asaasCustomer.id })
        .eq('id', user.id);
    }
  } catch (asaasError) {
    console.error('[Sponsor API] Asaas error:', asaasError);
    // Payment record was created but Asaas failed
  }

  return NextResponse.json(
    {
      data: {
        sponsored_payment_id: sponsoredPayment.id,
        listing_id: listingId,
        plan: plan,
        amount: selectedPlan.amount,
        starts_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
      },
      payment: {
        asaas_payment_id: asaasPaymentId,
        invoice_url: invoiceUrl,
        pix: pixData
          ? {
              qr_code_image: pixData.encodedImage,
              copy_paste: pixData.payload,
              expiration_date: pixData.expirationDate,
            }
          : null,
      },
      message: `Pagamento de destaque ${selectedPlan.label} criado com sucesso`,
    },
    { status: 201 }
  );
}
