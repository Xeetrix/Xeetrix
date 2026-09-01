import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff9f3",
          100: "#d7f0e1",
          200: "#b0e0c4",
          300: "#7dc9a2",
          400: "#4bab7e",
          500: "#2c8f63",
          600: "#1d7350",
          700: "#175c42",
          800: "#154936",
          900: "#123c2d",
          950: "#08221a",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd4",
          200: "#ffd8a8",
          300: "#ffbb70",
          400: "#ff9538",
          500: "#fd7a12",
          600: "#ee5f08",
          700: "#c54709",
          800: "#9c3810",
          900: "#7e3010",
        },
        ink: {
          50: "#f6f7f8",
          100: "#eceef1",
          200: "#d5d9e0",
          300: "#b1b9c4",
          400: "#8691a2",
          500: "#677286",
          600: "#535c6f",
          700: "#444b5b",
          800: "#3a3f4c",
          900: "#252831",
          950: "#14161b",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "var(--font-sora)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 6px -1px rgb(0 0 0 / 0.06)",
        elevated:
          "0 4px 12px -2px rgb(0 0 0 / 0.08), 0 12px 32px -8px rgb(0 0 0 / 0.10)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        marquee: "marquee 32s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      containerCenter: true,
    },
  },
  plugins: [],
};

export default config;
