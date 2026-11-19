import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-card": "var(--surface-card)",
        "surface-border": "var(--surface-border)",
        "surface-muted": "var(--surface-muted)",
        brand: {
          navy: "#081536",
          "navy-dark": "#050E26",
          "navy-card": "#0D1C44",
          "navy-border": "#1A2F6E",
          cyan: "#0BB9FE",
          "cyan-bright": "#13E4FF",
          purple: "#8B5CF6",
          "purple-deep": "#7C3AED",
          orange: "#FF8A3D",
          "orange-bright": "#FFAC42",
        },
      },
      backgroundImage: {
        "brand-glow": "radial-gradient(ellipse at top, rgba(11, 185, 254, 0.15), rgba(139, 92, 246, 0.1) 40%, rgba(255, 138, 61, 0.05) 70%, transparent 100%)",
        "brand-gradient": "linear-gradient(135deg, #0BB9FE 0%, #8B5CF6 52%, #FF8A3D 100%)",
        "brand-gradient-hover": "linear-gradient(135deg, #13E4FF 0%, #A855F7 52%, #FFAC42 100%)",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px -3px rgba(11, 185, 254, 0.4)",
        "glow-purple": "0 0 20px -3px rgba(139, 92, 246, 0.4)",
        "glow-orange": "0 0 20px -3px rgba(255, 138, 61, 0.4)",
        "glow-brand": "0 4px 25px -4px rgba(11, 185, 254, 0.3), 0 0 15px -2px rgba(139, 92, 246, 0.2)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
