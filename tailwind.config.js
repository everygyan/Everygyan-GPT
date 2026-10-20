/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',      // Dark navy header & footer
          card: '#1e293b',      // Dark slate for header controls
          accent: '#dc2626',    // Restrained vivid red CTA
          'accent-hover': '#b91c1c',
          canvas: '#ffffff',    // Crisp white content canvas
          muted: '#64748b',     // Subdued metadata text
          border: '#e2e8f0',    // Soft border
          surface: '#f8fafc',   // Soft background surface
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
