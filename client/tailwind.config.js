/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        meet: {
          dark: '#202124',
          surface: '#121212',
          tile: '#3c4043',
          tileDark: '#28292c',
          border: '#3c4043',
          borderSubtle: '#5f6368',
          blue: '#1a73e8',
          blueHover: '#1765cc',
          red: '#ea4335',
          redHover: '#d93025',
          green: '#34a853',
          yellow: '#fbbc04',
          textMuted: '#9aa0a6',
          textBright: '#e8eaed',
          controlBg: '#3c4043',
          controlHover: '#4e5256'
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'float-up': 'floatUp 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-speaking': 'pulseSpeaking 1.5s ease-in-out infinite',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { transform: 'translateY(-20px) scale(1.15)', opacity: '1' },
          '80%': { transform: 'translateY(-140px) scale(1)', opacity: '0.9' },
          '100%': { transform: 'translateY(-200px) scale(0.8)', opacity: '0' },
        },
        pulseSpeaking: {
          '0%, 100%': { boxShadow: '0 0 0 2px rgba(26, 115, 232, 0.4)' },
          '50%': { boxShadow: '0 0 0 5px rgba(26, 115, 232, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
