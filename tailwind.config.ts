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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primarys: {
          DEFAULT: "#DF7521", // Correct format for colors
        },
        secondarys:{
          DEFAULT : "#4B6E8B",
        },
        adminprimary:{
          DEFAULT : '#C1CCA3'
        },
      },
    },
  },
  plugins: [],
};
export default config;
