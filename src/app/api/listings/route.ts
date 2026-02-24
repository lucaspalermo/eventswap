import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PAGINATION, SORT_OPTIONS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Listings API
// GET  - Fetch listings with filters (category, city, price range, sort, pagination)
// POST - Create a new listing (authenticated)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  // Parse query parameters
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const sortId = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(
    PAGINATION.maxPerPage,
    Math.max(1, parseInt(searchParams.get('per_page') || String(PAGINATION.defaultPerPage), 10))
  );
  const status = searchParams.get('status') || 'ACTIVE';
  const sellerId = searchParams.get('seller_id');

  // Calculate offset
  const offset = (page - 1) * perPage;

  // Build query
  let query = supabase
    .from('listings')
    .select('*, seller:profiles!seller_id(*, seller_plans(plan_type, status))', { count: 'exact' });

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (city) {
    query = query.ilike('venue_city', `%${city}%`);
  }

  if (state) {
    query = query.eq('venue_state', state);
  }

  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue_name.ilike.%${search}%`);
  }

  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      query = query.gte('asking_price', min);
    }
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      query = query.lte('asking_price', max);
    }
  }

  // Apply sorting
  const sortOption = SORT_OPTIONS.find((opt) => opt.id === sortId) || SORT_OPTIONS[0];
  query = query.order(sortOption.field, { ascending: sortOption.direction === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + perPage - 1);

  const { data: listings, error, count } = await query;

  if (error) {
    console.error('[Listings API] GET error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar anuncios', details: error.message },
      { status: 500 }
    );
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return NextResponse.json({
    data: listings || [],
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

  // Validate required fields
  const requiredFields = ['title', 'category', 'event_date', 'venue_name', 'venue_city', 'original_price', 'asking_price'];
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: 'Campos obrigatorios faltando',
        missing_fields: missingFields,
      },
      { status: 400 }
    );
  }

  // Validate price range
  const askingPrice = Number(body.asking_price);
  const originalPrice = Number(body.original_price);

  if (isNaN(askingPrice) || askingPrice < 50) {
    return NextResponse.json(
      { error: 'Preco minimo e R$ 50,00' },
      { status: 400 }
    );
  }

  if (isNaN(originalPrice) || originalPrice <= 0) {
    return NextResponse.json(
      { error: 'Preco original invalido' },
      { status: 400 }
    );
  }

  if (askingPrice > 500000) {
    return NextResponse.json(
      { error: 'Preco maximo e R$ 500.000,00' },
      { status: 400 }
    );
  }

  // Validate title length
  const title = String(body.title);
  if (title.length > 120) {
    return NextResponse.json(
      { error: 'Titulo deve ter no maximo 120 caracteres' },
      { status: 400 }
    );
  }

  // Generate slug
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Make slug unique with timestamp suffix
  const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

  // Calculate discount percentage
  const discountPercent =
    originalPrice > 0
      ? Math.round(((originalPrice - askingPrice) / originalPrice) * 100)
      : 0;

  // Build listing data
  const listingData = {
    seller_id: user.id,
    title: title,
    description: body.description ? String(body.description).slice(0, 5000) : null,
    category: String(body.category),
    event_date: String(body.event_date),
    event_end_date: body.event_end_date ? String(body.event_end_date) : null,
    venue_name: String(body.venue_name),
    venue_address: body.venue_address ? String(body.venue_address) : null,
    venue_city: String(body.venue_city),
    venue_state: body.venue_state ? String(body.venue_state) : null,
    venue_country: 'BR',
    provider_name: body.provider_name ? String(body.provider_name) : null,
    provider_phone: body.provider_phone ? String(body.provider_phone) : null,
    provider_email: body.provider_email ? String(body.provider_email) : null,
    original_price: originalPrice,
    asking_price: askingPrice,
    paid_amount: body.paid_amount ? Number(body.paid_amount) : null,
    remaining_amount: body.remaining_amount ? Number(body.remaining_amount) : null,
    is_negotiable: Boolean(body.is_negotiable),
    images: Array.isArray(body.images) ? body.images : [],
    has_original_contract: Boolean(body.has_original_contract),
    contract_file_url: body.contract_file_url ? String(body.contract_file_url) : null,
    transfer_conditions: body.transfer_conditions ? String(body.transfer_conditions) : null,
    vendor_approves_transfer: Boolean(body.vendor_approves_transfer),
    status: 'DRAFT' as const,
    slug: uniqueSlug,
    discount_percent: discountPercent,
    view_count: 0,
    favorite_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: listing, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select('*')
    .single();

  if (error) {
    console.error('[Listings API] POST error:', error);
    return NextResponse.json(
      { error: 'Falha ao criar anuncio', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data: listing, message: 'Anuncio criado com sucesso' },
    { status: 201 }
  );
}
