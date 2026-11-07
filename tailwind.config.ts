import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        jlpt: {
          blue: "#2563EB",
          "blue-dark": "#1D4ED8",
          indigo: "#4F46E5",
          teal: "#0D9488",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B",
          slate: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Noto Sans JP", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        japanese: ["Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

