import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateApiKey, generateApiSecret } from '@/lib/api-auth';
import { createApiKeySchema, validateBody } from '@/lib/validations';

// ============================================================================
// API Key Management
// GET:    List user's API keys
// POST:   Generate new API key
// DELETE:  Revoke an API key
// ============================================================================

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

  // Fetch user's API keys (mask the api_secret)
  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, key_name, api_key, permissions, rate_limit, is_active, last_used_at, expires_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[API Keys] GET error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar chaves de API' },
      { status: 500 }
    );
  }

  // Fetch usage stats per key using admin client
  const adminSupabase = createAdminClient();
  const keyIds = (keys || []).map((k) => k.id);

  let usageStats: Record<number, { total_requests: number; last_7d_requests: number }> = {};

  if (keyIds.length > 0) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: logs } = await adminSupabase
      .from('api_logs')
      .select('api_key_id, created_at')
      .in('api_key_id', keyIds);

    if (logs) {
      usageStats = logs.reduce(
        (acc, log) => {
          const keyId = log.api_key_id;
          if (!acc[keyId]) {
            acc[keyId] = { total_requests: 0, last_7d_requests: 0 };
          }
          acc[keyId].total_requests++;
          if (log.created_at >= sevenDaysAgo) {
            acc[keyId].last_7d_requests++;
          }
          return acc;
        },
        {} as Record<number, { total_requests: number; last_7d_requests: number }>
      );
    }
  }

  // Add usage stats to each key
  const keysWithStats = (keys || []).map((key) => ({
    ...key,
    usage: usageStats[key.id] || { total_requests: 0, last_7d_requests: 0 },
  }));

  return NextResponse.json({ data: keysWithStats });
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

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 });
  }

  const validation = validateBody(createApiKeySchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const keyName = validation.data.key_name;

  // Check key limit (max 5 active keys per user)
  const { count } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (count && count >= 5) {
    return NextResponse.json(
      { error: 'Limite de 5 chaves ativas atingido. Revogue uma chave existente.' },
      { status: 400 }
    );
  }

  const apiKey = generateApiKey();
  const apiSecret = generateApiSecret();

  // Use admin client to bypass RLS for insert
  const adminSupabase = createAdminClient();
  const { data: newKey, error } = await adminSupabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      key_name: keyName,
      api_key: apiKey,
      api_secret: apiSecret,
      permissions: ['read'],
      rate_limit: 100,
      is_active: true,
    })
    .select('id, key_name, api_key, permissions, rate_limit, is_active, created_at')
    .single();

  if (error) {
    console.error('[API Keys] POST error:', error);
    return NextResponse.json(
      { error: 'Falha ao criar chave de API' },
      { status: 500 }
    );
  }

  // Return key + secret (secret only shown once)
  return NextResponse.json(
    {
      data: {
        ...newKey,
        api_secret: apiSecret,
      },
      message: 'Chave de API criada com sucesso. Salve o segredo, ele nao sera exibido novamente.',
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get('id');

  if (!keyId) {
    return NextResponse.json(
      { error: 'ID da chave e obrigatorio' },
      { status: 400 }
    );
  }

  // Deactivate the key (soft delete)
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', parseInt(keyId, 10))
    .eq('user_id', user.id);

  if (error) {
    console.error('[API Keys] DELETE error:', error);
    return NextResponse.json(
      { error: 'Falha ao revogar chave de API' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Chave de API revogada com sucesso',
  });
}
