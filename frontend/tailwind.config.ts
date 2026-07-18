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
        brand: {
          DEFAULT: "#0A2540",  // deep navy
          light: "#1A3A5C",
          dark: "#061829",
        },
        accent: {
          DEFAULT: "#00C896",  // vibrant green
          light: "#00F0B5",
          dark: "#00A07A",
        },
        surface: "#F7F9FC",
        muted: "#8898AA",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
