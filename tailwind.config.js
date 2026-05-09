/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/meihua/**/*.{ts,tsx,js,jsx}",
    "./src/pages/meihua/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: {
    // 全站其餘頁用 MUI / SCSS，避免 Tailwind 重設 body/html
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
