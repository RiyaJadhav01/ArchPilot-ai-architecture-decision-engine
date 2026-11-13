/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f8fafc',
        canvas: '#020617',
        brand: '#14b8a6',
        panel: '#0b1120',
        panel2: '#0f172a',
        line: '#1e293b',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(0, 0, 0, 0.24)',
        cyan: '0 0 0 1px rgba(20, 184, 166, 0.18), 0 0 30px rgba(20, 184, 166, 0.06)',
      },
    },
  },
  plugins: [],
}
