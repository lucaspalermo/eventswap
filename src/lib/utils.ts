import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// Class Name Utility
// Merges Tailwind classes with proper precedence using clsx + tailwind-merge
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Currency Formatting (BRL - Brazilian Real)
// ============================================================================

/**
 * Formats a number as Brazilian Real currency.
 * @param value - The numeric value to format (in reais, not centavos)
 * @param options - Optional Intl.NumberFormat options to override defaults
 * @returns Formatted currency string (e.g., "R$ 1.250,00")
 *
 * @example
 * formatCurrency(1250) // "R$ 1.250,00"
 * formatCurrency(99.9) // "R$ 99,90"
 * formatCurrency(0)    // "R$ 0,00"
 */
export function formatCurrency(
  value: number,
  options?: Partial<Intl.NumberFormatOptions>
): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Formats a number as compact Brazilian Real currency (e.g., "R$ 1,2K").
 * Useful for dashboards and summary cards.
 * @param value - The numeric value to format
 * @returns Compact formatted currency string
 *
 * @example
 * formatCurrencyCompact(1250)    // "R$ 1,3 mil"
 * formatCurrencyCompact(1500000) // "R$ 1,5 mi"
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace(".", ",")} mil`;
  }
  return formatCurrency(value);
}

/**
 * Parses a BRL currency string back to a number.
 * @param value - The formatted currency string
 * @returns The numeric value
 *
 * @example
 * parseCurrency("R$ 1.250,00") // 1250
 * parseCurrency("1.250,00")    // 1250
 */
export function parseCurrency(value: string): number {
  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ============================================================================
// Date Formatting (pt-BR)
// ============================================================================

/**
 * Formats a date in pt-BR locale.
 * @param date - Date string, Date object, or timestamp
 * @param options - Optional Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDate("2025-06-15")                          // "15 de jun. de 2025"
 * formatDate("2025-06-15", { dateStyle: "full" })   // "domingo, 15 de junho de 2025"
 * formatDate("2025-06-15", { dateStyle: "short" })  // "15/06/2025"
 */
export function formatDate(
  date: string | Date | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    ...options,
  }).format(dateObj);
}

/**
 * Formats a date as a short string (dd/mm/yyyy).
 * @param date - Date string, Date object, or timestamp
 * @returns Short formatted date string
 *
 * @example
 * formatDateShort("2025-06-15") // "15/06/2025"
 */
export function formatDateShort(date: string | Date | number): string {
  return formatDate(date, { dateStyle: "short" });
}

/**
 * Formats a date with time.
 * @param date - Date string, Date object, or timestamp
 * @returns Date and time string
 *
 * @example
 * formatDateTime("2025-06-15T14:30:00") // "15 de jun. de 2025, 14:30"
 */
export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Returns a relative time string (e.g., "há 2 dias", "em 3 horas").
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string in pt-BR
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "há 1 hora"
 */
export function formatRelativeTime(date: string | Date | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Data inválida";
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);

  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffWeeks) < 5) {
    return rtf.format(diffWeeks, "week");
  }
  return rtf.format(diffMonths, "month");
}

// ============================================================================
// Slug Generation
// ============================================================================

/**
 * Generates a URL-friendly slug from a string.
 * Handles Portuguese accented characters properly.
 * @param text - The text to slugify
 * @returns URL-safe slug string
 *
 * @example
 * generateSlug("Casamento na Praia") // "casamento-na-praia"
 * generateSlug("Buffet São Paulo - 2025") // "buffet-sao-paulo-2025"
 * generateSlug("  Espaço Elegância!!! ") // "espaco-elegancia"
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================================
// Text Truncation
// ============================================================================

/**
 * Truncates text to a specified length with ellipsis.
 * @param text - The text to truncate
 * @param maxLength - Maximum number of characters (default 100)
 * @param suffix - The suffix to append (default "...")
 * @returns Truncated text string
 *
 * @example
 * truncateText("Lorem ipsum dolor sit amet", 15) // "Lorem ipsum do..."
 * truncateText("Short", 100) // "Short"
 */
export function truncateText(
  text: string,
  maxLength: number = 100,
  suffix: string = "..."
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Formats a number with thousand separators in pt-BR locale.
 * @param value - The numeric value
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1250000) // "1.250.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/**
 * Formats a percentage value.
 * @param value - The decimal value (0.15 = 15%)
 * @param decimals - Number of decimal places (default 0)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.156)    // "16%"
 * formatPercent(0.156, 1) // "15,6%"
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Capitalizes the first letter of a string.
 * @param text - The text to capitalize
 * @returns Capitalized text
 *
 * @example
 * capitalize("casamento") // "Casamento"
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Returns initials from a name (max 2 characters).
 * @param name - The full name
 * @returns Initials string
 *
 * @example
 * getInitials("João Silva")      // "JS"
 * getInitials("Maria")           // "MA"
 * getInitials("Ana Beatriz Costa") // "AC"
 */
export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================================================
// Delay / Async Utilities
// ============================================================================

/**
 * Returns a promise that resolves after a specified delay.
 * Useful for animation timing and debounced operations.
 * @param ms - Delay in milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Builds a URL with query parameters, omitting null/undefined values.
 * @param base - Base URL path
 * @param params - Object of query parameters
 * @returns URL string with query parameters
 *
 * @example
 * buildUrl("/listings", { category: "casamento", page: 1, q: null })
 * // "/listings?category=casamento&page=1"
 */
export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates a Brazilian CPF number.
 * @param cpf - CPF string (with or without formatting)
 * @returns Whether the CPF is valid
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Validates a Brazilian phone number.
 * @param phone - Phone string
 * @returns Whether the phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Validates an email address.
 * @param email - Email string
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// Format Helpers
// ============================================================================

/**
 * Formats a Brazilian phone number.
 * @param phone - Phone digits string
 * @returns Formatted phone string
 *
 * @example
 * formatPhone("11999998888") // "(11) 99999-8888"
 * formatPhone("1133334444")  // "(11) 3333-4444"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

/**
 * Formats a CPF number.
 * @param cpf - CPF digits string
 * @returns Formatted CPF string
 *
 * @example
 * formatCPF("12345678901") // "123.456.789-01"
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
