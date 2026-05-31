import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "m-red": "#f0323c",
        "m-blue": "#175cff",
        "m-light-blue": "#49b9ff",
        "m-ink": "#0c0d10",
      },
    },
  },
  plugins: [],
};

export default config;
