import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fbf9f4",
        surface: "#fbf9f4",
        "surface-dim": "#dbdad5",
        "surface-bright": "#fbf9f4",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3ee",
        "surface-container": "#f0eee9",
        "surface-container-high": "#eae8e3",
        "surface-container-highest": "#e4e2dd",
        "on-surface": "#1b1c19",
        "on-surface-variant": "#424844",
        "inverse-surface": "#30312e",
        "inverse-on-surface": "#f2f1ec",
        outline: "#727973",
        "outline-variant": "#c2c8c2",
        "surface-tint": "#496455",
        primary: "#173124",
        "on-primary": "#ffffff",
        "primary-container": "#2d4739",
        "on-primary-container": "#98b5a3",
        "inverse-primary": "#b0cdbb",
        secondary: "#516445",
        "on-secondary": "#ffffff",
        "secondary-container": "#d1e6c0",
        "on-secondary-container": "#556849",
        tertiary: "#422401",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#5c3a13",
        "on-tertiary-container": "#d5a474",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        ink: "#1b1c19",
        muted: "#424844"
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
