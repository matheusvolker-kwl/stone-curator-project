import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1360px" },
    },
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        western: {
          "green-deep": "hsl(var(--western-green-deep))",
          "green-mid": "hsl(var(--western-green-mid))",
          "green-soft": "hsl(var(--western-green-soft))",
          gold: "hsl(var(--western-gold))",
          "gold-soft": "hsl(var(--western-gold-soft))",
          cream: "hsl(var(--western-cream))",
          "cream-muted": "hsl(var(--western-cream-muted))",
          ivory: "hsl(var(--western-ivory))",
          paper: "hsl(var(--western-paper))",
          "stone-dark": "hsl(var(--western-stone-dark))",
          "stone-warm": "hsl(var(--western-stone-warm))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "hero-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        "hero-drift": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(-1.2deg)" },
        },
        "swatch-fill": {
          "0%": { clipPath: "circle(0% at 50% 50%)", opacity: "0" },
          "100%": { clipPath: "circle(60% at 50% 50%)", opacity: "1" },
        },
        "swatch-breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        "swatch-splash": {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 600ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in": "fade-in 500ms ease-out both",
        shimmer: "shimmer 2s linear infinite",
        "hero-shimmer": "hero-shimmer 9s ease-in-out infinite",
        "hero-drift": "hero-drift 12s ease-in-out infinite",
        "swatch-fill": "swatch-fill 400ms ease-out both",
        "swatch-breathe": "swatch-breathe 2.5s ease-in-out infinite",
        "swatch-splash": "swatch-splash 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
