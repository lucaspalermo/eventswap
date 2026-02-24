import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOfferSchema, validateBody } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Offers API
// GET  - List offers for the authenticated user (as buyer or seller)
// POST - Create a new offer on a listing
// ---------------------------------------------------------------------------

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
  const listingId = searchParams.get('listing_id');
  const status = searchParams.get('status');
  const role = searchParams.get('role'); // 'buyer', 'seller', or null (both)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));
  const offset = (page - 1) * perPage;

  // Build query with joined data
  let query = supabase
    .from('offers')
    .select(
      '*, buyer:profiles!buyer_id(id, name, avatar_url, rating_avg, is_verified), seller:profiles!seller_id(id, name, avatar_url), listing:listings!listing_id(id, title, slug, asking_price, original_price, images, status)',
      { count: 'exact' }
    );

  // Filter by role
  if (role === 'buyer') {
    query = query.eq('buyer_id', user.id);
  } else if (role === 'seller') {
    query = query.eq('seller_id', user.id);
  } else {
    query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
  }

  // Filter by listing
  if (listingId) {
    query = query.eq('listing_id', Number(listingId));
  }

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Order and paginate
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  const { data: offers, error, count } = await query;

  if (error) {
    console.error('[Offers API] GET error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar ofertas', details: error.message },
      { status: 500 }
    );
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return NextResponse.json({
    data: offers || [],
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

  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido' },
      { status: 400 }
    );
  }

  // Validate with Zod
  const validation = validateBody(createOfferSchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const body = validation.data;
  const listingId = body.listing_id;
  const amount = body.amount;
  const message = body.message?.trim() ?? null;

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

  // Validate listing is active
  if (listing.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Anuncio nao esta disponivel para ofertas' },
      { status: 400 }
    );
  }

  // Prevent self-offer
  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: 'Voce nao pode fazer oferta no seu proprio anuncio' },
      { status: 400 }
    );
  }

  // Validate amount is not more than 150% of asking price
  const maxAmount = listing.asking_price * 1.5;
  if (amount > maxAmount) {
    return NextResponse.json(
      { error: `O valor da oferta nao pode exceder ${maxAmount.toFixed(2)}` },
      { status: 400 }
    );
  }

  // Check for existing active (PENDING) offer on this listing by this buyer
  const { data: existingOffer } = await supabase
    .from('offers')
    .select('id, status')
    .eq('listing_id', listingId)
    .eq('buyer_id', user.id)
    .eq('status', 'PENDING')
    .maybeSingle();

  if (existingOffer) {
    return NextResponse.json(
      {
        error: 'Voce ja possui uma oferta pendente para este anuncio',
        existing_offer_id: existingOffer.id,
      },
      { status: 409 }
    );
  }

  // Create the offer
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const offerData = {
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: listing.seller_id,
    amount,
    message: message || null,
    status: 'PENDING' as const,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .insert(offerData)
    .select(
      '*, buyer:profiles!buyer_id(id, name, avatar_url, rating_avg, is_verified), seller:profiles!seller_id(id, name, avatar_url), listing:listings!listing_id(id, title, slug, asking_price, original_price, images, status)'
    )
    .single();

  if (offerError) {
    console.error('[Offers API] POST error:', offerError);
    return NextResponse.json(
      { error: 'Falha ao criar oferta', details: offerError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      data: offer,
      message: 'Oferta enviada com sucesso',
    },
    { status: 201 }
  );
}
