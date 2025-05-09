// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'animate-slideFadeIn',
    'opacity-0',
    'opacity-100',
    {
      pattern: /delay-\[\d+ms\]/, // delay-[100ms] 등 safelist
    },
  ],
  theme: {
    extend: {
      keyframes: {
        slideFadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        slideFadeIn: "slideFadeIn 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
