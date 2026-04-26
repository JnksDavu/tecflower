/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          sage: '#6ea49b',
          sand: '#d9d0ac',
          olive: '#6b8f0b',
          plum: '#7d3f60',
          bark: '#372b2e',
        },
      },
      boxShadow: {
        panel: '0 18px 40px rgba(55, 43, 46, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'SF Pro Text', 'Poppins', 'Montserrat', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        dashboard:
          'radial-gradient(circle at top left, rgba(110, 164, 155, 0.18), transparent 28%), linear-gradient(135deg, rgba(217, 208, 172, 0.3), rgba(255, 255, 255, 0.96))',
      },
    },
  },
  plugins: [],
};
