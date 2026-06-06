/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F4EDDF',
          100: '#EAE0CF', // Cream
          200: '#C6D2E0',
          300: '#A4B5CE',
          400: '#8A9DBA', // Lightened for text
          500: '#7288AA', // Slate Accent
          600: '#5F7293',
          700: '#4F5E80',
          800: '#4B5694', // Muted Indigo / Cards
          900: '#1A2355',
          950: '#111844', // Deep Navy / Main Bg
        },
        primary: {
          navy: '#111844',
          blue: '#4B5694',
        },
        secondary: {
          gold: '#EAE0CF',
          emerald: '#7288AA',
        },
        neutral: {
          white: '#EAE0CF',
          light: '#F4EDDF',
          gray: '#7288AA',
        },
        amber: { 400: '#8A9DBA', 500: '#7288AA', 600: '#5F7293', 700: '#4F5E80' },
        orange: { 400: '#7288AA', 500: '#5F7293', 600: '#4F5E80', 700: '#4B5694', 800: '#1A2355' },
        emerald: { 400: '#8A9DBA', 500: '#7288AA', 600: '#5F7293' },
        teal: { 400: '#7288AA', 500: '#5F7293', 600: '#4F5E80' },
        violet: { 400: '#8A9DBA', 500: '#7288AA', 600: '#5F7293' },
        purple: { 400: '#7288AA', 500: '#5F7293', 600: '#4F5E80' },
        blue: { 400: '#8A9DBA', 500: '#7288AA', 600: '#5F7293' },
        cyan: { 400: '#7288AA', 500: '#5F7293', 600: '#4F5E80' },
        pink: { 400: '#8A9DBA', 500: '#7288AA', 600: '#5F7293' },
        rose: { 400: '#7288AA', 500: '#5F7293', 600: '#4F5E80' },
        red: { 400: '#8A9DBA', 500: '#7288AA', 600: '#5F7293' },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#0F172A',
            a: {
              color: '#2563EB',
            },
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.33%)' },
        },
      },
    },
  },
  plugins: [],
}
