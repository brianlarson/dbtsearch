/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts}',
    './node_modules/preline/dist/*.js',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#bbcefd',
        // Preline-style semantic tokens (match frontend theme)
        primary: {
          DEFAULT: '#bbcefd',
          foreground: '#0f172a',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
