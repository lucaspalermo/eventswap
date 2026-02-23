// ============================================================================
// Lightweight i18n System for EventSwap
// React Context-based, no external dependencies
// ============================================================================

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { createElement } from 'react';
import { ptBR, type TranslationKeys } from './locales/pt-BR';
import { en } from './locales/en';
import { es } from './locales/es';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = 'pt-BR' | 'en' | 'es';

export interface LocaleInfo {
  code: Locale;
  label: string;
  flag: string;
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const LOCALES: LocaleInfo[] = [
  { code: 'pt-BR', label: 'Portugues (BR)', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'es', label: 'Espanol', flag: '\u{1F1EA}\u{1F1F8}' },
];

export const DEFAULT_LOCALE: Locale = 'pt-BR';

const STORAGE_KEY = 'eventswap-locale';

// ---------------------------------------------------------------------------
// Translation dictionaries
// ---------------------------------------------------------------------------

const dictionaries: Record<Locale, TranslationKeys> = {
  'pt-BR': ptBR,
  en,
  es,
};

// ---------------------------------------------------------------------------
// Translation resolver
// ---------------------------------------------------------------------------

/**
 * Resolves a dot-notation key (e.g., "common.save") against a translation
 * dictionary. Returns the key itself as fallback if not found.
 */
function resolveKey(dict: TranslationKeys, key: string): string {
  const parts = key.split('.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dict;

  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return key; // fallback
    }
    current = current[part];
  }

  if (typeof current === 'string') {
    return current;
  }

  return key; // fallback
}

/**
 * Standalone translation function.
 * Can be used outside of React components.
 *
 * @param key - Dot-notation key (e.g., "common.save")
 * @param locale - Target locale (defaults to stored/default locale)
 */
export function t(key: string, locale?: Locale): string {
  const resolvedLocale = locale || getStoredLocale();
  const dict = dictionaries[resolvedLocale] || dictionaries[DEFAULT_LOCALE];
  return resolveKey(dict, key);
}

/**
 * Returns the locale stored in localStorage, or the default locale.
 */
export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && dictionaries[stored]) return stored;
  return DEFAULT_LOCALE;
}

/**
 * Stores the locale in localStorage.
 */
export function storeLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, locale);
}

// ---------------------------------------------------------------------------
// React Context
// ---------------------------------------------------------------------------

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string) => key,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
  }, []);

  // Update html lang attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    storeLocale(newLocale);
  }, []);

  const translate = useCallback(
    (key: string): string => {
      const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
      return resolveKey(dict, key);
    },
    [locale]
  );

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translate,
  };

  return createElement(I18nContext.Provider, { value }, children);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook that provides access to the i18n context.
 *
 * @returns { t, locale, setLocale }
 *
 * @example
 * ```tsx
 * const { t, locale, setLocale } = useTranslation();
 * return <button>{t('common.save')}</button>;
 * ```
 */
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
