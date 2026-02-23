// ============================================================================
// EventSwap Design Tokens
// Premium SaaS marketplace inspired by Stripe, Apple, Airbnb, Linear
// ============================================================================

export const colors = {
  // Primary - Electric Violet
  primary: {
    50: '#F5F0FF',
    100: '#E8DEFF',
    200: '#D4BFFF',
    300: '#B794FF',
    400: '#9B6DFF',
    500: '#6C3CE1',
    600: '#5A2ECF',
    700: '#4A1FB8',
    800: '#3B18A0',
    900: '#2D1080',
    950: '#1A0A52',
  },

  // Secondary - Sky Blue
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    950: '#082F49',
  },

  // Accent - Warm Amber
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
  },

  // Neutrals
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0F',
  },

  // Semantic Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },

  // Backgrounds
  white: '#FFFFFF',
  black: '#000000',

  // Glass morphism
  glass: {
    white: 'rgba(255, 255, 255, 0.08)',
    whiteStrong: 'rgba(255, 255, 255, 0.16)',
    dark: 'rgba(10, 10, 15, 0.6)',
    darkStrong: 'rgba(10, 10, 15, 0.8)',
  },
} as const;

export const gradients = {
  hero: 'linear-gradient(135deg, #6C3CE1 0%, #0EA5E9 50%, #10B981 100%)',
  heroSubtle: 'linear-gradient(135deg, rgba(108, 60, 225, 0.15) 0%, rgba(14, 165, 233, 0.15) 50%, rgba(16, 185, 129, 0.15) 100%)',
  primaryToSecondary: 'linear-gradient(135deg, #6C3CE1 0%, #0EA5E9 100%)',
  primaryToAccent: 'linear-gradient(135deg, #6C3CE1 0%, #F97316 100%)',
  secondaryToSuccess: 'linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)',
  radialGlow: 'radial-gradient(ellipse at center, rgba(108, 60, 225, 0.2) 0%, transparent 70%)',
  darkOverlay: 'linear-gradient(180deg, rgba(10, 10, 15, 0) 0%, rgba(10, 10, 15, 0.8) 100%)',
  cardShine: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%)',
  meshBackground: 'radial-gradient(at 40% 20%, rgba(108, 60, 225, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(14, 165, 233, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.08) 0px, transparent 50%)',
} as const;

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgba(10, 10, 15, 0.05)',
  sm: '0 1px 3px 0 rgba(10, 10, 15, 0.1), 0 1px 2px -1px rgba(10, 10, 15, 0.1)',
  md: '0 4px 6px -1px rgba(10, 10, 15, 0.1), 0 2px 4px -2px rgba(10, 10, 15, 0.1)',
  lg: '0 10px 15px -3px rgba(10, 10, 15, 0.1), 0 4px 6px -4px rgba(10, 10, 15, 0.1)',
  xl: '0 20px 25px -5px rgba(10, 10, 15, 0.1), 0 8px 10px -6px rgba(10, 10, 15, 0.1)',
  '2xl': '0 25px 50px -12px rgba(10, 10, 15, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(10, 10, 15, 0.06)',
  // Colored shadows
  primaryGlow: '0 0 20px rgba(108, 60, 225, 0.3), 0 0 60px rgba(108, 60, 225, 0.1)',
  secondaryGlow: '0 0 20px rgba(14, 165, 233, 0.3), 0 0 60px rgba(14, 165, 233, 0.1)',
  accentGlow: '0 0 20px rgba(249, 115, 22, 0.3), 0 0 60px rgba(249, 115, 22, 0.1)',
  successGlow: '0 0 20px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)',
  // Card elevation
  card: '0 1px 3px rgba(10, 10, 15, 0.08), 0 1px 2px rgba(10, 10, 15, 0.06)',
  cardHover: '0 12px 24px rgba(10, 10, 15, 0.12), 0 4px 8px rgba(10, 10, 15, 0.08)',
  cardActive: '0 4px 12px rgba(10, 10, 15, 0.08)',
  // Float
  float: '0 16px 48px rgba(10, 10, 15, 0.12), 0 8px 16px rgba(10, 10, 15, 0.08)',
  none: 'none',
} as const;

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: '600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 9999,
} as const;

export type ColorScale = typeof colors;
export type GradientScale = typeof gradients;
export type SpacingScale = typeof spacing;
export type ShadowScale = typeof shadows;
