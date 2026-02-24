import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ------------------------------------------------------------------
      // Colors - Trust-first palette (Stripe/Wise inspired)
      // Deep Navy primary transmits trust & security for financial marketplace
      // ------------------------------------------------------------------
      colors: {
        // Primary - Deep Navy (Trust & Security)
        primary: {
          DEFAULT: "#1E3A5F",
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#1E3A5F",
          900: "#102A43",
          950: "#0A1929",
        },
        // Secondary - Electric Blue (Action & Energy)
        secondary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        // Accent - Warm Amber
        accent: {
          DEFAULT: "#F97316",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          950: "#431407",
        },
        // Neutrals
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0F",
        },
        // Semantic
        success: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
        },
        error: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          950: "#450A0A",
        },
        // CSS variable-based theme colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
      },

      // ------------------------------------------------------------------
      // Font Family
      // ------------------------------------------------------------------
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        heading: [
          "var(--font-heading)",
          "Plus Jakarta Sans",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "Monaco",
          "Courier New",
          "monospace",
        ],
      },

      // ------------------------------------------------------------------
      // Font Size (with line-height and letter-spacing)
      // ------------------------------------------------------------------
      fontSize: {
        "display-2xl": [
          "72px",
          { lineHeight: "1.0", letterSpacing: "-0.04em", fontWeight: "800" },
        ],
        "display-xl": [
          "60px",
          { lineHeight: "1.05", letterSpacing: "-0.035em", fontWeight: "800" },
        ],
        "display-lg": [
          "48px",
          { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        "display-md": [
          "40px",
          { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        "display-sm": [
          "36px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "heading-xl": [
          "32px",
          { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "heading-lg": [
          "28px",
          { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        "heading-md": [
          "24px",
          {
            lineHeight: "1.35",
            letterSpacing: "-0.01em",
            fontWeight: "600",
          },
        ],
        "heading-sm": [
          "20px",
          {
            lineHeight: "1.4",
            letterSpacing: "-0.01em",
            fontWeight: "600",
          },
        ],
        "heading-xs": [
          "18px",
          {
            lineHeight: "1.45",
            letterSpacing: "-0.005em",
            fontWeight: "600",
          },
        ],
        "body-xl": [
          "20px",
          {
            lineHeight: "1.6",
            letterSpacing: "-0.005em",
            fontWeight: "400",
          },
        ],
        "body-lg": [
          "18px",
          {
            lineHeight: "1.6",
            letterSpacing: "-0.005em",
            fontWeight: "400",
          },
        ],
        "body-md": [
          "16px",
          { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" },
        ],
        "body-sm": [
          "14px",
          { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" },
        ],
        "body-xs": [
          "13px",
          { lineHeight: "1.55", letterSpacing: "0em", fontWeight: "400" },
        ],
        "label-lg": [
          "16px",
          { lineHeight: "1.4", letterSpacing: "0em", fontWeight: "500" },
        ],
        "label-md": [
          "14px",
          { lineHeight: "1.4", letterSpacing: "0em", fontWeight: "500" },
        ],
        "label-sm": [
          "13px",
          {
            lineHeight: "1.4",
            letterSpacing: "0.005em",
            fontWeight: "500",
          },
        ],
        "label-xs": [
          "12px",
          {
            lineHeight: "1.4",
            letterSpacing: "0.01em",
            fontWeight: "500",
          },
        ],
        caption: [
          "12px",
          {
            lineHeight: "1.5",
            letterSpacing: "0.01em",
            fontWeight: "400",
          },
        ],
        overline: [
          "12px",
          {
            lineHeight: "1.4",
            letterSpacing: "0.08em",
            fontWeight: "600",
          },
        ],
      },

      // ------------------------------------------------------------------
      // Border Radius
      // ------------------------------------------------------------------
      borderRadius: {
        DEFAULT: "8px",
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },

      // ------------------------------------------------------------------
      // Box Shadow
      // ------------------------------------------------------------------
      boxShadow: {
        xs: "0 1px 2px 0 rgba(10, 10, 15, 0.05)",
        sm: "0 1px 3px 0 rgba(10, 10, 15, 0.1), 0 1px 2px -1px rgba(10, 10, 15, 0.1)",
        md: "0 4px 6px -1px rgba(10, 10, 15, 0.1), 0 2px 4px -2px rgba(10, 10, 15, 0.1)",
        lg: "0 10px 15px -3px rgba(10, 10, 15, 0.1), 0 4px 6px -4px rgba(10, 10, 15, 0.1)",
        xl: "0 20px 25px -5px rgba(10, 10, 15, 0.1), 0 8px 10px -6px rgba(10, 10, 15, 0.1)",
        "2xl": "0 25px 50px -12px rgba(10, 10, 15, 0.25)",
        "primary-glow":
          "0 0 20px rgba(30, 58, 95, 0.3), 0 0 60px rgba(30, 58, 95, 0.1)",
        "secondary-glow":
          "0 0 20px rgba(37, 99, 235, 0.3), 0 0 60px rgba(37, 99, 235, 0.1)",
        "accent-glow":
          "0 0 20px rgba(249, 115, 22, 0.3), 0 0 60px rgba(249, 115, 22, 0.1)",
        "success-glow":
          "0 0 20px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)",
        card: "0 1px 3px rgba(10, 10, 15, 0.08), 0 1px 2px rgba(10, 10, 15, 0.06)",
        "card-hover":
          "0 12px 24px rgba(10, 10, 15, 0.12), 0 4px 8px rgba(10, 10, 15, 0.08)",
        float:
          "0 16px 48px rgba(10, 10, 15, 0.12), 0 8px 16px rgba(10, 10, 15, 0.08)",
        inner: "inset 0 2px 4px 0 rgba(10, 10, 15, 0.06)",
        none: "none",
      },

      // ------------------------------------------------------------------
      // Screens / Breakpoints
      // ------------------------------------------------------------------
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },

      // ------------------------------------------------------------------
      // Spacing extensions
      // ------------------------------------------------------------------
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
        "144": "36rem",
      },

      // ------------------------------------------------------------------
      // Max Width
      // ------------------------------------------------------------------
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      // ------------------------------------------------------------------
      // Z-Index
      // ------------------------------------------------------------------
      zIndex: {
        dropdown: "10",
        sticky: "20",
        fixed: "30",
        overlay: "40",
        modal: "50",
        popover: "60",
        tooltip: "70",
        toast: "80",
      },

      // ------------------------------------------------------------------
      // Background Image (Gradients)
      // ------------------------------------------------------------------
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #1E3A5F 0%, #2563EB 50%, #10B981 100%)",
        "gradient-hero-subtle":
          "linear-gradient(135deg, rgba(30, 58, 95, 0.15) 0%, rgba(37, 99, 235, 0.15) 50%, rgba(16, 185, 129, 0.15) 100%)",
        "gradient-primary":
          "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #2563EB 0%, #F97316 100%)",
        "gradient-success":
          "linear-gradient(135deg, #2563EB 0%, #10B981 100%)",
        "gradient-radial-glow":
          "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.2) 0%, transparent 70%)",
        "gradient-dark-overlay":
          "linear-gradient(180deg, rgba(10, 10, 15, 0) 0%, rgba(10, 10, 15, 0.8) 100%)",
        "gradient-card-shine":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%)",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, rgba(30, 58, 95, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(37, 99, 235, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.08) 0px, transparent 50%)",
      },

      // ------------------------------------------------------------------
      // Backdrop Blur
      // ------------------------------------------------------------------
      backdropBlur: {
        xs: "2px",
      },

      // ------------------------------------------------------------------
      // Keyframes
      // ------------------------------------------------------------------
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow:
              "0 0 20px rgba(37, 99, 235, 0.3), 0 0 60px rgba(37, 99, 235, 0.1)",
          },
          "50%": {
            boxShadow:
              "0 0 30px rgba(37, 99, 235, 0.5), 0 0 80px rgba(37, 99, 235, 0.2)",
          },
        },
        "border-spin": {
          "0%": { borderColor: "#1E3A5F" },
          "33%": { borderColor: "#2563EB" },
          "66%": { borderColor: "#10B981" },
          "100%": { borderColor: "#1E3A5F" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "text-reveal": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0%)" },
        },
      },

      // ------------------------------------------------------------------
      // Animation
      // ------------------------------------------------------------------
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-down":
          "fade-down 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-out": "fade-out 0.3s cubic-bezier(0, 0, 0.2, 1) forwards",
        "scale-in":
          "scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-in-left":
          "slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-in-right":
          "slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-in-bottom":
          "slide-in-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-in-top":
          "slide-in-top 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        shimmer: "shimmer 1.5s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-soft":
          "pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        breathe: "breathe 4s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "border-spin": "border-spin 3s linear infinite",
        wiggle: "wiggle 0.3s ease-in-out",
        "bounce-in":
          "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        marquee: "marquee 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
        "count-up":
          "count-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "text-reveal":
          "text-reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },

      // ------------------------------------------------------------------
      // Transition
      // ------------------------------------------------------------------
      transitionTimingFunction: {
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "0": "0ms",
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
    },
  },

  // ------------------------------------------------------------------
  // Plugins
  // ------------------------------------------------------------------
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        // Glass morphism utilities
        ".glass": {
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        },
        ".glass-strong": {
          background: "rgba(255, 255, 255, 0.16)",
          backdropFilter: "blur(24px)",
          "-webkit-backdrop-filter": "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        ".glass-dark": {
          background: "rgba(10, 10, 15, 0.6)",
          backdropFilter: "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        },

        // Text gradient utility
        ".text-gradient-hero": {
          background:
            "linear-gradient(135deg, #1E3A5F 0%, #2563EB 50%, #10B981 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          backgroundClip: "text",
        },
        ".text-gradient-primary": {
          background:
            "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          backgroundClip: "text",
        },

        // Hide scrollbar
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },

        // Custom focus ring
        ".focus-ring": {
          outline: "none",
          boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.2)",
        },

        // Animation delay utilities
        ".animation-delay-100": { animationDelay: "100ms" },
        ".animation-delay-200": { animationDelay: "200ms" },
        ".animation-delay-300": { animationDelay: "300ms" },
        ".animation-delay-400": { animationDelay: "400ms" },
        ".animation-delay-500": { animationDelay: "500ms" },
        ".animation-delay-700": { animationDelay: "700ms" },
        ".animation-delay-1000": { animationDelay: "1000ms" },
      });
    }),
  ],
};

export default config;
