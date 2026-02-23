// ============================================================================
// EventSwap Typography System
// Premium font scale from display-2xl (72px) to caption (12px)
// Font: Inter (Google Fonts)
// ============================================================================

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export interface TypeStyle {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
}

export const typeScale = {
  // Display sizes - Hero sections, landing pages
  'display-2xl': {
    fontSize: '72px',
    lineHeight: '1.0',
    letterSpacing: '-0.04em',
    fontWeight: fontWeight.extrabold,
  },
  'display-xl': {
    fontSize: '60px',
    lineHeight: '1.05',
    letterSpacing: '-0.035em',
    fontWeight: fontWeight.extrabold,
  },
  'display-lg': {
    fontSize: '48px',
    lineHeight: '1.1',
    letterSpacing: '-0.03em',
    fontWeight: fontWeight.bold,
  },
  'display-md': {
    fontSize: '40px',
    lineHeight: '1.15',
    letterSpacing: '-0.025em',
    fontWeight: fontWeight.bold,
  },
  'display-sm': {
    fontSize: '36px',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    fontWeight: fontWeight.bold,
  },

  // Heading sizes - Page titles, section headers
  'heading-xl': {
    fontSize: '32px',
    lineHeight: '1.25',
    letterSpacing: '-0.02em',
    fontWeight: fontWeight.bold,
  },
  'heading-lg': {
    fontSize: '28px',
    lineHeight: '1.3',
    letterSpacing: '-0.015em',
    fontWeight: fontWeight.semibold,
  },
  'heading-md': {
    fontSize: '24px',
    lineHeight: '1.35',
    letterSpacing: '-0.01em',
    fontWeight: fontWeight.semibold,
  },
  'heading-sm': {
    fontSize: '20px',
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
    fontWeight: fontWeight.semibold,
  },
  'heading-xs': {
    fontSize: '18px',
    lineHeight: '1.45',
    letterSpacing: '-0.005em',
    fontWeight: fontWeight.semibold,
  },

  // Body sizes - Paragraphs, descriptions
  'body-xl': {
    fontSize: '20px',
    lineHeight: '1.6',
    letterSpacing: '-0.005em',
    fontWeight: fontWeight.regular,
  },
  'body-lg': {
    fontSize: '18px',
    lineHeight: '1.6',
    letterSpacing: '-0.005em',
    fontWeight: fontWeight.regular,
  },
  'body-md': {
    fontSize: '16px',
    lineHeight: '1.6',
    letterSpacing: '0em',
    fontWeight: fontWeight.regular,
  },
  'body-sm': {
    fontSize: '14px',
    lineHeight: '1.6',
    letterSpacing: '0em',
    fontWeight: fontWeight.regular,
  },
  'body-xs': {
    fontSize: '13px',
    lineHeight: '1.55',
    letterSpacing: '0em',
    fontWeight: fontWeight.regular,
  },

  // Label sizes - Form labels, buttons, badges
  'label-lg': {
    fontSize: '16px',
    lineHeight: '1.4',
    letterSpacing: '0em',
    fontWeight: fontWeight.medium,
  },
  'label-md': {
    fontSize: '14px',
    lineHeight: '1.4',
    letterSpacing: '0em',
    fontWeight: fontWeight.medium,
  },
  'label-sm': {
    fontSize: '13px',
    lineHeight: '1.4',
    letterSpacing: '0.005em',
    fontWeight: fontWeight.medium,
  },
  'label-xs': {
    fontSize: '12px',
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    fontWeight: fontWeight.medium,
  },

  // Caption - Small text, helper text, timestamps
  caption: {
    fontSize: '12px',
    lineHeight: '1.5',
    letterSpacing: '0.01em',
    fontWeight: fontWeight.regular,
  },

  // Overline - Eyebrows, category labels
  overline: {
    fontSize: '12px',
    lineHeight: '1.4',
    letterSpacing: '0.08em',
    fontWeight: fontWeight.semibold,
  },

  // Code - Inline code snippets
  code: {
    fontSize: '14px',
    lineHeight: '1.6',
    letterSpacing: '0em',
    fontWeight: fontWeight.regular,
  },
} as const;

// ---------------------------------------------------------------------------
// Responsive type scale (Tailwind-compatible class mappings)
// These map to fontSize + lineHeight pairs for Tailwind's font-size config
// ---------------------------------------------------------------------------

export const responsiveTypeScale = {
  'display-2xl': {
    base: { fontSize: '40px', lineHeight: '1.1' },
    md: { fontSize: '56px', lineHeight: '1.05' },
    lg: { fontSize: '72px', lineHeight: '1.0' },
  },
  'display-xl': {
    base: { fontSize: '36px', lineHeight: '1.1' },
    md: { fontSize: '48px', lineHeight: '1.05' },
    lg: { fontSize: '60px', lineHeight: '1.05' },
  },
  'display-lg': {
    base: { fontSize: '32px', lineHeight: '1.15' },
    md: { fontSize: '40px', lineHeight: '1.1' },
    lg: { fontSize: '48px', lineHeight: '1.1' },
  },
  'display-md': {
    base: { fontSize: '28px', lineHeight: '1.2' },
    md: { fontSize: '36px', lineHeight: '1.15' },
    lg: { fontSize: '40px', lineHeight: '1.15' },
  },
  'display-sm': {
    base: { fontSize: '24px', lineHeight: '1.25' },
    md: { fontSize: '32px', lineHeight: '1.2' },
    lg: { fontSize: '36px', lineHeight: '1.2' },
  },
} as const;

// ---------------------------------------------------------------------------
// Tailwind fontSize config format
// Returns [fontSize, { lineHeight, letterSpacing, fontWeight }]
// ---------------------------------------------------------------------------

export function getTailwindFontSize() {
  const result: Record<string, [string, { lineHeight: string; letterSpacing: string; fontWeight: string }]> = {};

  for (const [key, value] of Object.entries(typeScale)) {
    result[key] = [
      value.fontSize,
      {
        lineHeight: value.lineHeight,
        letterSpacing: value.letterSpacing,
        fontWeight: value.fontWeight,
      },
    ];
  }

  return result;
}

export type TypeScaleKey = keyof typeof typeScale;
export type FontFamilyKey = keyof typeof fontFamily;
export type FontWeightKey = keyof typeof fontWeight;
