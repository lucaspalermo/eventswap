'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui',
          backgroundColor: '#0A0A0F', color: '#FFFFFF'
        }}>
          <h1 style={{ fontSize: 48, fontWeight: 800 }}>
            <span style={{ color: '#6C3CE1' }}>Event</span>Swap
          </h1>
          <h2 style={{ fontSize: 24, marginTop: 16 }}>Algo deu errado</h2>
          <p style={{ color: '#A1A1AA', marginTop: 8 }}>
            Nosso time foi notificado e esta trabalhando para resolver.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24, padding: '12px 24px',
              backgroundColor: '#6C3CE1', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 16, fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
