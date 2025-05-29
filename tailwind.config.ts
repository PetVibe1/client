import type { Config } from "tailwindcss";

export default {
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
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        primary: {
          DEFAULT: '#003459',
          dark: '#00293F',
        },
        secondary: {
          DEFAULT: '#FCEED5',
          light: '#FCFCFD',
        },
      },
      fontFamily: {
        sans: ['Quicksand', 'cursive'],
        Quicksand: ['Quicksand', 'cursive'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-light': {
          '0%, 100%': { backgroundColor: 'rgb(254, 243, 199)' },
          '50%': { backgroundColor: 'rgb(255, 251, 235)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'pulse-light': 'pulse-light 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
