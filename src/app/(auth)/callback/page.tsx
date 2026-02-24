import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

interface CallbackPageProps {
  searchParams: Promise<{ code?: string; type?: string }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const { code, type } = await searchParams;

  // Read the redirectTo cookie (set before OAuth was initiated)
  const cookieStore = await cookies();
  const redirectToCookie = cookieStore.get('redirectTo')?.value;
  const redirectToUrl = redirectToCookie ? decodeURIComponent(redirectToCookie) : '/dashboard';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Clear the redirectTo cookie
        cookieStore.delete('redirectTo');

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
        redirect(redirectToUrl);
      }
    } catch (e: unknown) {
      // redirect() throws a NEXT_REDIRECT error — re-throw it
      if (e && typeof e === 'object' && 'digest' in e) throw e;
      // Exchange failed, redirect to login
    }

    redirect('/login');
  }

  redirect('/login');
}
