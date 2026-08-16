import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00322a",
          container: "#004b40",
          fixed: "#b0efdf",
          "fixed-dim": "#95d3c4",
          foreground: "#ffffff",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#7dbaab",
        "on-primary-fixed": "#00201b",
        "on-primary-fixed-variant": "#095045",
        "inverse-primary": "#95d3c4",

        secondary: {
          DEFAULT: "#954a00",
          container: "#fd8100",
          fixed: "#ffdcc6",
          "fixed-dim": "#ffb785",
          foreground: "#ffffff",
        },
        "on-secondary": "#ffffff",
        "on-secondary-container": "#5d2c00",
        "on-secondary-fixed": "#301400",
        "on-secondary-fixed-variant": "#723700",

        tertiary: {
          DEFAULT: "#2a2c2a",
          container: "#404240",
          fixed: "#e2e3e0",
          "fixed-dim": "#c6c7c4",
        },
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#adaeab",
        "on-tertiary-fixed": "#1a1c1a",
        "on-tertiary-fixed-variant": "#454745",

        surface: {
          DEFAULT: "var(--surface)",
          dim: "var(--surface-dim)",
          bright: "var(--surface)",
          variant: "var(--surface-variant)",
          tint: "var(--surface-tint)",
        },
        "surface-container": {
          lowest: "var(--surface-container-lowest)",
          low: "var(--surface-container-low)",
          DEFAULT: "var(--surface-container)",
          high: "var(--surface-container-high)",
          highest: "var(--surface-container-highest)",
        },
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "inverse-surface": "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",

        background: "var(--background)",
        "on-background": "var(--on-background)",

        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },

        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      spacing: {
        base: "8px",
        "stack-sm": "12px",
        gutter: "16px",
        "container-margin": "20px",
        "stack-md": "24px",
        "stack-lg": "48px",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      fontFamily: {
        display: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "sans-serif"],
        headline: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        label: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      boxShadow: {
        tactile: "0 4px 20px rgba(0, 0, 0, 0.04)",
        "tactile-hover": "0 10px 30px rgba(0, 0, 0, 0.08)",
        modal: "0 20px 40px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
