'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        },
        classNames: {
          toast: 'group border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xl',
          title: 'text-sm font-medium',
          description: 'text-xs text-neutral-500 dark:text-neutral-400',
          success: 'border-emerald-200 dark:border-emerald-800 [&>svg]:text-emerald-500',
          error: 'border-red-200 dark:border-red-800 [&>svg]:text-red-500',
          warning: 'border-amber-200 dark:border-amber-800 [&>svg]:text-amber-500',
          actionButton: 'bg-[#2563EB] text-white hover:bg-[#5A2ECF] text-xs font-medium',
          cancelButton: 'text-neutral-500 hover:text-neutral-700 text-xs',
        },
      }}
      richColors
      closeButton
      duration={4000}
    />
  );
}
