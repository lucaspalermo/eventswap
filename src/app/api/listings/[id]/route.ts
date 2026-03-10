import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createListingSchema } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Listings [id] API
// PATCH  - Update a listing (owner only)
// DELETE - Cancel a listing (owner only)
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const listingId = Number(id);

  if (!listingId || isNaN(listingId)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Autenticacao necessaria' }, { status: 401 });
  }

  // Verify ownership
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('id, seller_id, status')
    .eq('id', listingId)
    .single();

  if (fetchError || !listing) {
    return NextResponse.json({ error: 'Anuncio nao encontrado' }, { status: 404 });
  }

  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: 'Voce nao tem permissao para editar este anuncio' }, { status: 403 });
  }

  // Prevent editing sold/cancelled listings
  if (['SOLD', 'CANCELLED', 'SUSPENDED'].includes(listing.status)) {
    return NextResponse.json(
      { error: `Nao e possivel editar um anuncio com status: ${listing.status}` },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 });
  }

  // Check if this is a publish action
  if (body.action === 'publish') {
    if (!['DRAFT'].includes(listing.status)) {
      return NextResponse.json(
        { error: 'Apenas anuncios em rascunho podem ser publicados' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('listings')
      .update({
        status: 'PENDING_REVIEW',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Falha ao publicar anuncio' }, { status: 500 });
    }

    return NextResponse.json({ data: updated, message: 'Anuncio enviado para revisao' });
  }

  // Partial validation — only validate provided fields
  const partialSchema = createListingSchema.partial();
  const result = partialSchema.safeParse(body);

  if (!result.success) {
    const errors = result.error.flatten();
    return NextResponse.json(
      { error: 'Dados invalidos', field_errors: errors.fieldErrors },
      { status: 400 }
    );
  }

  // Build update data (only include provided fields)
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const allowedFields = [
    'title', 'description', 'category', 'event_date', 'event_end_date',
    'venue_name', 'venue_address', 'venue_city', 'venue_state',
    'original_price', 'asking_price', 'paid_amount', 'remaining_amount',
    'is_negotiable', 'has_original_contract', 'contract_file_url',
    'provider_name', 'provider_phone', 'provider_email',
    'transfer_conditions', 'vendor_approves_transfer', 'images',
  ];

  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  // Recalculate discount if prices changed
  if (updateData.original_price || updateData.asking_price) {
    // Re-fetch full listing data for discount calc
    const { data: fullListing } = await supabase
      .from('listings')
      .select('original_price, asking_price')
      .eq('id', listingId)
      .single();

    if (fullListing) {
      const op = Number(updateData.original_price ?? fullListing.original_price);
      const ap = Number(updateData.asking_price ?? fullListing.asking_price);
      if (op > 0) {
        updateData.discount_percent = Math.round(((op - ap) / op) * 100);
      }
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', listingId)
    .select()
    .single();

  if (updateError) {
    console.error('[Listings API] PATCH error:', updateError);
    return NextResponse.json({ error: 'Falha ao atualizar anuncio' }, { status: 500 });
  }

  return NextResponse.json({ data: updated, message: 'Anuncio atualizado com sucesso' });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const listingId = Number(id);

  if (!listingId || isNaN(listingId)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Autenticacao necessaria' }, { status: 401 });
  }

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id, seller_id, status')
    .eq('id', listingId)
    .single();

  if (!listing) {
    return NextResponse.json({ error: 'Anuncio nao encontrado' }, { status: 404 });
  }

  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: 'Voce nao tem permissao para excluir este anuncio' }, { status: 403 });
  }

  // Can't cancel if there's an active transaction
  if (['RESERVED', 'SOLD'].includes(listing.status)) {
    return NextResponse.json(
      { error: 'Nao e possivel cancelar um anuncio com transacao ativa' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
    .eq('id', listingId);

  if (updateError) {
    return NextResponse.json({ error: 'Falha ao cancelar anuncio' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Anuncio cancelado com sucesso' });
}
