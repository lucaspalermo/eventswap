import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asaasTransfers, asaasCustomers } from '@/lib/asaas';
import { walletWithdrawSchema, validateBody } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Wallet Withdraw API
// POST - Requests a withdrawal from the user's wallet balance
// ---------------------------------------------------------------------------

/**
 * POST /api/wallet/withdraw
 * Initiates a withdrawal from the seller's available wallet balance.
 *
 * Body: { amount: number, bank_account?: object }
 *
 * In demo mode (no Supabase configured): returns a simulated success response.
 * In production: initiates an Asaas transfer for the requested amount.
 */
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

  // Parse body
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 });
  }

  const validation = validateBody(walletWithdrawSchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const amount = validation.data.amount;

  // Calculate available balance from completed sales payments
  const { data: completedPayments, error: paymentsError } = await supabase
    .from('payments')
    .select('net_amount, asaas_transfer_id, status')
    .eq('payee_id', user.id)
    .eq('status', 'SUCCEEDED');

  if (paymentsError) {
    console.error('[Wallet Withdraw] Erro ao buscar pagamentos:', paymentsError);
    return NextResponse.json(
      { error: 'Falha ao calcular saldo disponivel' },
      { status: 500 }
    );
  }

  const totalEarnings = (completedPayments || []).reduce(
    (sum, p) => sum + (p.net_amount || 0),
    0
  );

  // Get already-withdrawn amounts (processing transfers)
  const { data: processingPayments, error: processingError } = await supabase
    .from('payments')
    .select('net_amount')
    .eq('payee_id', user.id)
    .eq('status', 'PROCESSING');

  if (processingError) {
    console.error('[Wallet Withdraw] Erro ao buscar saques em andamento:', processingError);
    return NextResponse.json(
      { error: 'Falha ao calcular saldo disponivel' },
      { status: 500 }
    );
  }

  const processingAmount = (processingPayments || []).reduce(
    (sum, p) => sum + (p.net_amount || 0),
    0
  );

  const availableBalance = totalEarnings - processingAmount;

  if (amount > availableBalance) {
    return NextResponse.json(
      {
        error: `Saldo insuficiente. Saldo disponivel: R$ ${availableBalance.toFixed(2).replace('.', ',')}`,
        available_balance: availableBalance,
      },
      { status: 400 }
    );
  }

  // Check if Supabase is in demo mode (no real connection)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isDemoMode = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (isDemoMode) {
    // Simulate success in demo mode
    console.log(`[Wallet Withdraw] Demo mode - simulando saque de R$${amount} para usuario ${user.id}`);
    return NextResponse.json(
      {
        data: {
          transfer_id: `demo-transfer-${Date.now()}`,
          amount,
          status: 'PENDING',
          estimated_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
        message: `Saque de R$ ${amount.toFixed(2).replace('.', ',')} solicitado com sucesso (modo demo)`,
      },
      { status: 201 }
    );
  }

  // Fetch seller profile for Asaas
  const { data: sellerProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, email, cpf, phone, asaas_customer_id')
    .eq('id', user.id)
    .single();

  if (profileError || !sellerProfile) {
    return NextResponse.json(
      { error: 'Perfil do usuario nao encontrado' },
      { status: 404 }
    );
  }

  if (!sellerProfile.cpf) {
    return NextResponse.json(
      { error: 'CPF nao cadastrado. Atualize seu perfil antes de solicitar saques.' },
      { status: 400 }
    );
  }

  // Ensure seller has an Asaas customer record
  let asaasCustomerId = sellerProfile.asaas_customer_id;

  if (!asaasCustomerId) {
    try {
      const asaasCustomer = await asaasCustomers.getOrCreate({
        name: sellerProfile.name,
        email: sellerProfile.email,
        cpfCnpj: sellerProfile.cpf,
        phone: sellerProfile.phone || undefined,
        externalReference: sellerProfile.id,
      });

      asaasCustomerId = asaasCustomer.id;

      await supabase
        .from('profiles')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', user.id);
    } catch (asaasCustomerError) {
      console.error('[Wallet Withdraw] Erro ao criar/obter cliente Asaas:', asaasCustomerError);
      return NextResponse.json(
        { error: 'Falha ao configurar conta de recebimento. Tente novamente mais tarde.' },
        { status: 502 }
      );
    }
  }

  // Initiate Asaas transfer using CPF as PIX key
  let asaasTransfer: { id: string; value: number; status?: string } | null = null;

  try {
    asaasTransfer = await asaasTransfers.create({
      value: amount,
      operationType: 'PIX',
      pixAddressKey: sellerProfile.cpf.replace(/\D/g, ''), // CPF digits only
      pixAddressKeyType: 'CPF',
      description: `EventSwap - Saque de carteira`,
      externalReference: `withdrawal-${user.id}-${Date.now()}`,
    });
  } catch (transferError) {
    console.error('[Wallet Withdraw] Erro ao criar transferencia Asaas:', transferError);
    return NextResponse.json(
      { error: 'Falha ao processar saque. Verifique seus dados bancarios e tente novamente.' },
      { status: 502 }
    );
  }

  console.log(
    `[Wallet Withdraw] Saque iniciado: user=${user.id} transfer_id=${asaasTransfer.id} valor=R$${amount}`
  );

  return NextResponse.json(
    {
      data: {
        transfer_id: asaasTransfer.id,
        amount,
        status: asaasTransfer.status || 'PENDING',
        estimated_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      message: `Saque de R$ ${amount.toFixed(2).replace('.', ',')} solicitado com sucesso`,
    },
    { status: 201 }
  );
}
