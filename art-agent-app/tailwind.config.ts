import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#dc2626", // red-600 (Artplan Red)
        "primary-dark": "#b91c1c", // red-700
        "background-light": "#f8fafc", // slate-50
        "background-dark": "#0f172a", // slate-900
      },
      fontFamily: {
        display: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem", // 8px
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
export default config
