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
        // Custom palette requested by user:
        // #E8F5E9 (light matcha), #A5D6A7 (soft pastel border), #66BB6A (vibrant green), #1B5E20 (deep forest green)
        brand: {
          50: "#E8F5E9",
          100: "#dcedc8",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#4CAF50",
          600: "#388E3C",
          700: "#2E7D32",
          800: "#226B28",
          900: "#1B5E20",
          light: "#E8F5E9",
          pastel: "#A5D6A7",
          vibrant: "#66BB6A",
          dark: "#1B5E20",
        },
        vuyanh: {
          light: "#E8F5E9",
          pastel: "#A5D6A7",
          vibrant: "#66BB6A",
          dark: "#1B5E20",
        },
        // Harmonize indigo to map to the new fresh green theme so existing components blend seamlessly
        indigo: {
          50: "#E8F5E9",
          100: "#dcedc8",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#4CAF50",
          600: "#2E7D32",
          700: "#1B5E20",
          800: "#154c19",
          900: "#0c300f",
        },
        jlpt: {
          blue: "#2E7D32",
          "blue-dark": "#1B5E20",
          indigo: "#1B5E20",
          teal: "#00796B",
          emerald: "#2E7D32",
          rose: "#E53935",
          amber: "#F59E0B",
          slate: "#1B5E20",
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
