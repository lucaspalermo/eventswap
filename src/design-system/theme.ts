// ============================================================================
// EventSwap Theme - Combined Design System Export
// Single source of truth for all design tokens
// ============================================================================

import { colors, gradients, spacing, borderRadius, shadows, breakpoints, transitions, zIndex } from './tokens';
import { fontFamily, fontWeight, typeScale, responsiveTypeScale, getTailwindFontSize } from './typography';
import * as animations from './animations';

// ---------------------------------------------------------------------------
// Combined Theme Object
// ---------------------------------------------------------------------------

export const theme = {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  transitions,
  zIndex,
  fontFamily,
  fontWeight,
  typeScale,
  responsiveTypeScale,
} as const;

// ---------------------------------------------------------------------------
// Semantic color mappings for components
// ---------------------------------------------------------------------------

export const semanticColors = {
  // Text colors
  text: {
    primary: colors.neutral[950],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[400],
    inverse: colors.white,
    brand: colors.primary[500],
    link: colors.primary[500],
    linkHover: colors.primary[700],
    success: colors.success[700],
    warning: colors.warning[700],
    error: colors.error[600],
    disabled: colors.neutral[300],
  },

  // Background colors
  bg: {
    primary: colors.white,
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    inverse: colors.neutral[950],
    brand: colors.primary[500],
    brandSubtle: colors.primary[50],
    success: colors.success[50],
    successStrong: colors.success[500],
    warning: colors.warning[50],
    warningStrong: colors.warning[500],
    error: colors.error[50],
    errorStrong: colors.error[500],
    overlay: 'rgba(10, 10, 15, 0.6)',
    disabled: colors.neutral[100],
  },

  // Border colors
  border: {
    primary: colors.neutral[200],
    secondary: colors.neutral[100],
    brand: colors.primary[500],
    brandSubtle: colors.primary[200],
    success: colors.success[300],
    warning: colors.warning[300],
    error: colors.error[300],
    focus: colors.primary[500],
    disabled: colors.neutral[200],
  },

  // Icon colors
  icon: {
    primary: colors.neutral[900],
    secondary: colors.neutral[500],
    tertiary: colors.neutral[400],
    inverse: colors.white,
    brand: colors.primary[500],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    disabled: colors.neutral[300],
  },
} as const;

// ---------------------------------------------------------------------------
// Component-level tokens
// ---------------------------------------------------------------------------

export const componentTokens = {
  button: {
    primary: {
      bg: colors.primary[500],
      bgHover: colors.primary[600],
      bgActive: colors.primary[700],
      text: colors.white,
      border: 'transparent',
      shadow: shadows.sm,
      shadowHover: shadows.primaryGlow,
    },
    secondary: {
      bg: colors.white,
      bgHover: colors.neutral[50],
      bgActive: colors.neutral[100],
      text: colors.neutral[900],
      border: colors.neutral[200],
      shadow: shadows.xs,
      shadowHover: shadows.sm,
    },
    ghost: {
      bg: 'transparent',
      bgHover: colors.neutral[50],
      bgActive: colors.neutral[100],
      text: colors.neutral[700],
      border: 'transparent',
      shadow: 'none',
      shadowHover: 'none',
    },
    danger: {
      bg: colors.error[500],
      bgHover: colors.error[600],
      bgActive: colors.error[700],
      text: colors.white,
      border: 'transparent',
      shadow: shadows.sm,
      shadowHover: `0 0 20px rgba(239, 68, 68, 0.3)`,
    },
  },

  card: {
    bg: colors.white,
    border: colors.neutral[200],
    borderHover: colors.neutral[300],
    shadow: shadows.card,
    shadowHover: shadows.cardHover,
    radius: borderRadius.lg,
  },

  input: {
    bg: colors.white,
    border: colors.neutral[200],
    borderFocus: colors.primary[500],
    borderError: colors.error[500],
    placeholder: colors.neutral[400],
    text: colors.neutral[900],
    ringFocus: `0 0 0 3px ${colors.primary[100]}`,
    ringError: `0 0 0 3px ${colors.error[100]}`,
    radius: borderRadius.DEFAULT,
  },

  badge: {
    primary: {
      bg: colors.primary[50],
      text: colors.primary[700],
      border: colors.primary[200],
    },
    secondary: {
      bg: colors.neutral[100],
      text: colors.neutral[700],
      border: colors.neutral[200],
    },
    success: {
      bg: colors.success[50],
      text: colors.success[700],
      border: colors.success[200],
    },
    warning: {
      bg: colors.warning[50],
      text: colors.warning[700],
      border: colors.warning[200],
    },
    error: {
      bg: colors.error[50],
      text: colors.error[700],
      border: colors.error[200],
    },
  },

  nav: {
    bg: 'rgba(255, 255, 255, 0.8)',
    bgScrolled: 'rgba(255, 255, 255, 0.95)',
    border: colors.neutral[200],
    text: colors.neutral[700],
    textHover: colors.neutral[900],
    textActive: colors.primary[500],
    backdrop: 'blur(16px)',
  },

  avatar: {
    bg: colors.primary[100],
    text: colors.primary[700],
    border: colors.white,
    ring: colors.primary[200],
  },
} as const;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { colors, gradients, spacing, borderRadius, shadows, breakpoints, transitions, zIndex };
export { fontFamily, fontWeight, typeScale, responsiveTypeScale, getTailwindFontSize };
export { animations };

export type Theme = typeof theme;
export type SemanticColors = typeof semanticColors;
export type ComponentTokens = typeof componentTokens;

export default theme;
