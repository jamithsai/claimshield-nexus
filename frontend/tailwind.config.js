/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        acentra: {
          dark: '#042126',       // Obsidian Pine Teal
          green: '#209B47',      // Forest Healthcare Green
          greenHover: '#1B843C', // Forest Green Hover
          teal: '#005F68',       // Deep Ocean Teal
          mint: '#ACF2E5',       // Pale Seafoam Mint
          navy: '#15497E',       // Slate Healthcare Navy
          glacier: '#F2FCFF',    // Glacier Tint
          white: '#FFFFFF',      // Clean White
        },
        risk: {
          critical: '#B91C1C',
          criticalBg: '#FEE2E2',
          high: '#D97706',
          highBg: '#FEF3C7',
          medium: '#15497E',
          mediumBg: '#EFF6FF',
          low: '#209B47',
          lowBg: '#ACF2E5',
        }
      }
    },
  },
  plugins: [],
}
