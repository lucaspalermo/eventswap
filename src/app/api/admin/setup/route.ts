import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/admin/setup
// Creates the initial admin user. Only works once (when no SUPER_ADMIN exists).
// Requires ADMIN_SETUP_SECRET header for authentication.

export async function POST(req: NextRequest) {
  // Require a setup secret to prevent unauthorized admin creation
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: 'ADMIN_SETUP_SECRET nao configurada. Configure no .env.local para habilitar o setup.' },
      { status: 403 }
    );
  }

  const authHeader = req.headers.get('x-setup-secret') || req.headers.get('authorization')?.replace('Bearer ', '');
  if (authHeader !== setupSecret) {
    return NextResponse.json(
      { error: 'Setup secret invalido ou ausente. Envie o header x-setup-secret.' },
      { status: 401 }
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey === 'your-service-role-key') {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY nao configurada. Configure no .env.local' },
      { status: 500 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: 'Configure ADMIN_EMAIL e ADMIN_PASSWORD no .env.local' },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();

  // Check if a SUPER_ADMIN already exists
  const { data: existingAdmin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'SUPER_ADMIN')
    .limit(1)
    .maybeSingle();

  if (existingAdmin) {
    return NextResponse.json(
      { error: 'Um administrador ja existe. Operacao cancelada.' },
      { status: 409 }
    );
  }

  // Create admin user via Supabase Auth Admin API
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      name: 'Admin EventSwap',
    },
  });

  if (authError) {
    // If user already exists in auth but not in profiles, try to find them
    if (authError.message?.includes('already been registered')) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === adminEmail
      );

      if (existingUser) {
        // Update profile to SUPER_ADMIN
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'SUPER_ADMIN',
            is_verified: true,
            kyc_status: 'APPROVED',
            display_name: 'Admin EventSwap',
          })
          .eq('id', existingUser.id);

        if (updateError) {
          return NextResponse.json(
            { error: 'Falha ao promover usuario existente' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: 'Usuario existente promovido a SUPER_ADMIN',
          user_id: existingUser.id,
          email: adminEmail,
        });
      }
    }

    return NextResponse.json(
      { error: 'Falha ao criar usuario admin' },
      { status: 500 }
    );
  }

  // Wait a moment for the trigger to create the profile
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Update the profile to SUPER_ADMIN
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: 'SUPER_ADMIN',
      is_verified: true,
      kyc_status: 'APPROVED',
      display_name: 'Admin EventSwap',
    })
    .eq('id', authUser.user.id);

  if (profileError) {
    // Profile might not exist yet (trigger delay), insert it manually
    await supabase.from('profiles').upsert({
      id: authUser.user.id,
      email: adminEmail,
      name: 'Admin EventSwap',
      display_name: 'Admin EventSwap',
      role: 'SUPER_ADMIN',
      is_verified: true,
      kyc_status: 'APPROVED',
    });
  }

  return NextResponse.json({
    message: 'Admin criado com sucesso!',
    user_id: authUser.user.id,
    email: adminEmail,
    role: 'SUPER_ADMIN',
    instructions: `Faca login em /login com email: ${adminEmail}`,
  });
}
