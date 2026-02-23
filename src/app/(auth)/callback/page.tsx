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
        redirect('/dashboard');
      }
    } catch {
      // Exchange failed, redirect to login
    }

    redirect('/login');
  }

  redirect('/login');
}
