import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A192F",
        secondary: "#B3934F",
        accent: "#C9A961",
        background: "#F8F9FA",
        surface: "#FFFFFF",
        "on-surface": "#111111",
        "on-surface-variant": "#4A5568",
        outline: "#E2E8F0"
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem"
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
