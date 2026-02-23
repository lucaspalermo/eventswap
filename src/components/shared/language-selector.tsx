'use client';

import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, LOCALES, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Component: LanguageSelector
// ---------------------------------------------------------------------------

/**
 * A dropdown for switching between supported languages.
 *
 * - Displays the current language flag and a Globe icon.
 * - Saves preference to localStorage immediately (via the i18n context).
 * - Persists to the user's profile in Supabase if authenticated.
 * - Works on both the landing page and in-app topbar.
 */
export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Update context + localStorage
    setLocale(newLocale);

    // Try to persist to profile (non-blocking)
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ language: newLocale, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch {
      // Silent fail - localStorage is the primary store
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg',
            'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CE1]/50',
            className
          )}
          aria-label="Selecionar idioma"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">
            {currentLocale.flag}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={cn(
              'flex items-center gap-2.5 cursor-pointer',
              locale === loc.code && 'bg-[#6C3CE1]/5 text-[#6C3CE1] dark:bg-[#6C3CE1]/10 dark:text-[#6C3CE1]'
            )}
          >
            <span className="text-base leading-none">{loc.flag}</span>
            <span className="flex-1 text-sm">{loc.label}</span>
            {locale === loc.code && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C3CE1]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
