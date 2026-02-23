'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
        Algo deu errado
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md">
        Ocorreu um erro inesperado. Nosso time foi notificado automaticamente.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
