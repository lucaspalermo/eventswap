import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// KYC API
// GET  - Return current user's KYC status and documents
// POST - Submit KYC documents
// ---------------------------------------------------------------------------

export async function GET() {
  const supabase = await createClient();

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

  // Get user profile with verification info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, kyc_status, verification_level, max_transaction_amount, is_verified')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: 'Erro ao buscar perfil', details: profileError.message },
      { status: 500 }
    );
  }

  // Get KYC documents
  const { data: documents, error: docsError } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (docsError) {
    return NextResponse.json(
      { error: 'Erro ao buscar documentos KYC', details: docsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: {
      profile: {
        kyc_status: profile.kyc_status,
        verification_level: profile.verification_level || 'none',
        max_transaction_amount: profile.max_transaction_amount || 5000,
        is_verified: profile.is_verified,
      },
      documents: documents || [],
      latest: documents?.[0] || null,
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

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
  const requiredFields = ['document_type', 'document_front_url', 'selfie_url', 'cpf', 'full_name'];
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

  // Validate document type
  const validTypes = ['RG', 'CNH', 'PASSPORT'];
  if (!validTypes.includes(String(body.document_type))) {
    return NextResponse.json(
      { error: 'Tipo de documento invalido. Use: RG, CNH ou PASSPORT' },
      { status: 400 }
    );
  }

  // RG and CNH require back photo
  if (['RG', 'CNH'].includes(String(body.document_type)) && !body.document_back_url) {
    return NextResponse.json(
      { error: 'Foto do verso do documento e obrigatoria para RG e CNH' },
      { status: 400 }
    );
  }

  // Validate CPF format (basic: 11 digits)
  const cpf = String(body.cpf).replace(/\D/g, '');
  if (cpf.length !== 11) {
    return NextResponse.json(
      { error: 'CPF invalido. Informe 11 digitos' },
      { status: 400 }
    );
  }

  // Check if there's already a pending submission
  const { data: existing } = await supabase
    .from('kyc_documents')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending'])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Voce ja possui uma verificacao pendente. Aguarde a analise.' },
      { status: 409 }
    );
  }

  // Insert KYC document
  const kycData = {
    user_id: user.id,
    document_type: String(body.document_type),
    document_front_url: String(body.document_front_url),
    document_back_url: body.document_back_url ? String(body.document_back_url) : null,
    selfie_url: String(body.selfie_url),
    cpf: cpf,
    full_name: String(body.full_name),
    birth_date: body.birth_date ? String(body.birth_date) : null,
    status: 'pending',
  };

  const { data: document, error: insertError } = await supabase
    .from('kyc_documents')
    .insert(kycData)
    .select('*')
    .single();

  if (insertError) {
    console.error('[KYC API] POST error:', insertError);
    return NextResponse.json(
      { error: 'Erro ao enviar documentos', details: insertError.message },
      { status: 500 }
    );
  }

  // Update profile kyc_status to SUBMITTED
  await supabase
    .from('profiles')
    .update({
      kyc_status: 'SUBMITTED',
      cpf: cpf,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  return NextResponse.json(
    { data: document, message: 'Documentos enviados com sucesso! Aguarde a analise.' },
    { status: 201 }
  );
}
