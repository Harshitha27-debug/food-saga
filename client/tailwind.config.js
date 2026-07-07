/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#ff8e53',
          DEFAULT: '#ff6b6b',
          dark: '#e84118',
        },
        accent: {
          light: '#a8ffb2',
          DEFAULT: '#2ecc71',
          dark: '#27ae60',
        },
        darkBg: {
          DEFAULT: '#0f172a', // Slate 900
          card: '#1e293b',    // Slate 800
          border: '#334155',  // Slate 700
          text: '#f8fafc'     // Slate 50
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'premium': '0 10px 50px -12px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
