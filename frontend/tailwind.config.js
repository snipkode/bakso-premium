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
        // Apple-style colors
        primary: {
          DEFAULT: '#007AFF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#5856D6',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#34C759',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#FF9500',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#FF3B30',
          foreground: '#FFFFFF',
        },
        // Neutral colors
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#000000',
        },
        surface: {
          DEFAULT: '#F2F2F7',
          dark: '#1C1C1E',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#2C2C2E',
        },
        border: {
          DEFAULT: '#E5E5EA',
          dark: '#38383A',
        },
        text: {
          primary: '#000000',
          secondary: '#3C3C43',
          tertiary: '#8E8E93',
          dark: '#FFFFFF',
          darkSecondary: '#EBEBF5',
          darkTertiary: '#98989D',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '20px',
        'ios-xl': '28px',
      },
      boxShadow: {
        'ios': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'ios-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'ios-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'spring': 'spring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        spring: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
