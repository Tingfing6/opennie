/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 中性色 - Notion风格
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',
          800: '#3c4043',
          900: '#202124',
        },
        // 主色调 - 深蓝色调，类似Notion的蓝色
        primary: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',  // Notion主要蓝色
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
        },
        // 功能色 - 财务应用专用
        income: {
          50: '#e6f4ea',
          100: '#ceead6',
          200: '#a8dab9',
          300: '#81c995',
          400: '#5bb971',
          500: '#34a853',  // Google绿色
          600: '#2e8f4a',
          700: '#287641',
          800: '#225d38',
          900: '#1c442f',
        },
        expense: {
          50: '#fce8e6',
          100: '#f9d0cc',
          200: '#f2a199',
          300: '#ea7266',
          400: '#e34234',
          500: '#dc2626',  // Google红色
          600: '#c21f1f',
          700: '#a81919',
          800: '#8e1313',
          900: '#740d0d',
        },
        warning: {
          50: '#fef7e0',
          100: '#fef0c7',
          200: '#fedf89',
          300: '#fec84b',
          400: '#fbbf24',
          500: '#f59e0b',  // Google黄色
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
