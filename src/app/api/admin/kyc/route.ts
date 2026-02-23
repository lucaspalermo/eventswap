import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Admin KYC API
// GET   - List all KYC submissions with pagination and filters
// PATCH - Approve or reject a KYC submission
// ---------------------------------------------------------------------------

const VERIFICATION_LIMITS: Record<string, number> = {
  none: 0,
  email: 5000,
  document: 50000,
  full: 500000,
};

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

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Acesso nao autorizado' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));
  const offset = (page - 1) * perPage;

  // Use admin client to bypass RLS
  const adminClient = createAdminClient();

  let query = adminClient
    .from('kyc_documents')
    .select('*, user:profiles!user_id(id, name, email, avatar_url, kyc_status, verification_level)', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + perPage - 1);

  const { data: documents, error, count } = await query;

  if (error) {
    console.error('[Admin KYC API] GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar submissoes KYC', details: error.message },
      { status: 500 }
    );
  }

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return NextResponse.json({
    data: documents || [],
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

export async function PATCH(req: NextRequest) {
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

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Acesso nao autorizado' },
      { status: 403 }
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

  const { id, action, rejection_reason, verification_level } = body as {
    id: number;
    action: 'approve' | 'reject';
    rejection_reason?: string;
    verification_level?: string;
  };

  if (!id || !action) {
    return NextResponse.json(
      { error: 'Campos obrigatorios: id e action (approve/reject)' },
      { status: 400 }
    );
  }

  if (action === 'reject' && !rejection_reason) {
    return NextResponse.json(
      { error: 'Motivo da rejeicao e obrigatorio' },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  // Get the KYC document
  const { data: kycDoc, error: fetchError } = await adminClient
    .from('kyc_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !kycDoc) {
    return NextResponse.json(
      { error: 'Documento KYC nao encontrado' },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();

  if (action === 'approve') {
    const level = verification_level || 'document';
    const maxAmount = VERIFICATION_LIMITS[level] || VERIFICATION_LIMITS.document;

    // Update KYC document status
    const { error: updateError } = await adminClient
      .from('kyc_documents')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: now,
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao aprovar documento', details: updateError.message },
        { status: 500 }
      );
    }

    // Update user profile
    await adminClient
      .from('profiles')
      .update({
        kyc_status: 'APPROVED',
        is_verified: true,
        verification_level: level,
        max_transaction_amount: maxAmount,
        updated_at: now,
      })
      .eq('id', kycDoc.user_id);

    return NextResponse.json({
      message: 'Verificacao aprovada com sucesso',
      data: { status: 'approved', verification_level: level, max_transaction_amount: maxAmount },
    });
  } else if (action === 'reject') {
    // Update KYC document status
    const { error: updateError } = await adminClient
      .from('kyc_documents')
      .update({
        status: 'rejected',
        rejection_reason: rejection_reason,
        reviewed_by: user.id,
        reviewed_at: now,
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao rejeitar documento', details: updateError.message },
        { status: 500 }
      );
    }

    // Update user profile
    await adminClient
      .from('profiles')
      .update({
        kyc_status: 'REJECTED',
        updated_at: now,
      })
      .eq('id', kycDoc.user_id);

    return NextResponse.json({
      message: 'Verificacao rejeitada',
      data: { status: 'rejected', rejection_reason },
    });
  }

  return NextResponse.json(
    { error: 'Acao invalida. Use approve ou reject' },
    { status: 400 }
  );
}
