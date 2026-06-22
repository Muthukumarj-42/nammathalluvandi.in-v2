import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f9fafb",
        surface: "#ffffff",
        "surface-dim": "#f3f4f6",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f9fafb",
        "surface-container": "#f3f4f6",
        "surface-container-high": "#e5e7eb",
        "surface-container-highest": "#d1d5db",
        "on-surface": "#111827",
        "on-surface-variant": "#4b5563",
        "inverse-surface": "#1f2937",
        "inverse-on-surface": "#f9fafb",
        outline: "#9ca3af",
        "outline-variant": "#d1d5db",
        "surface-tint": "#0c6035",
        primary: "#0c6035",
        "on-primary": "#ffffff",
        "primary-container": "#bbf7d0",
        "on-primary-container": "#064e3b",
        "inverse-primary": "#86efac",
        secondary: "#c1121f",
        "on-secondary": "#ffffff",
        "secondary-container": "#fecaca",
        "on-secondary-container": "#7f1d1d",
        tertiary: "#c1121f",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#c1121f",
        "on-tertiary-container": "#ffffff",
        error: "#c1121f",
        "on-error": "#ffffff",
        "error-container": "#fecaca",
        "on-error-container": "#7f1d1d",
        ink: "#111827",
        muted: "#6b7280"
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        tamil: ["var(--font-noto-tamil)", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 48px rgba(255, 107, 0, 0.28)",
        premium: "0 24px 80px rgba(13, 13, 13, 0.16)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      }
    }
  },
  plugins: []
};

export default config;
