import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2A4A",
          light: "#2A3F6A",
          dark: "#111C33",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#D4BA6A",
          dark: "#B8953A",
        },
        sand: {
          DEFAULT: "#F5F0E8",
          light: "#FAF7F2",
          dark: "#E8E0D0",
        },
        stone: {
          DEFAULT: "#D6CFC4",
          light: "#E2DDD5",
          dark: "#C4BAA8",
        },
        warmGrey: {
          DEFAULT: "#6B6560",
          light: "#8A8480",
          dark: "#4A4540",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};

export default config;
