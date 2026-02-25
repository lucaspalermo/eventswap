'use client';

import { type ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/hooks/use-auth';

// ---------------------------------------------------------------------------
// Client-side Providers
// Wraps the application with all required React context providers.
// AuthProvider fetches auth state ONCE and shares it to all components via
// context, eliminating duplicate getUser() + profile queries.
// ---------------------------------------------------------------------------

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18nProvider>
  );
}
