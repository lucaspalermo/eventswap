import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface CallbackPageProps {
  searchParams: Promise<{ code?: string; type?: string }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const { code, type } = await searchParams;

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        if (type === 'recovery') {
          redirect('/reset-password');
        }
        // Check if user is admin to redirect to admin panel
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
            redirect('/admin');
          }
        }
        redirect('/dashboard');
      }
    } catch {
      // Exchange failed, redirect to login
    }

    redirect('/login');
  }

  redirect('/login');
}
