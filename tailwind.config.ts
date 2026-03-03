import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ancient Angkor Design System
        sandstone: "#F7F5F0",
        slate: {
          temple: "#1A1C1E",
        },
        jungle: "#2C4C3B",
        gold: "#C57D3E",
        charcoal: "#222222",
      },
      fontFamily: {
        heading: ["var(--font-cinzel)", "Playfair Display", "Georgia", "serif"],
        body: ["var(--font-inter)", "Inter", "Lato", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
