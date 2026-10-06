import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Фирменная палитра Sofia Massage Madrid
        ivory: '#F5F1EA',       // Основной доминирующий фон сайта
        'warm-beige': '#D9CBBE', // Вторичные карточки и мягкие подложки
        espresso: '#2B2521',    // Глубокий темный для контрастных секций и основного текста
        'soft-taupe': '#9A8C81',// Второстепенный текст и подписи
        champagne: '#B7A48A',   // Деликатный акцент: рамки, hover, разделители
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Playfair Display', 'serif'],
        sans: ['var(--font-manrope)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;