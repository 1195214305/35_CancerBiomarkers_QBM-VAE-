/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 科研风格配色 - 避免蓝紫渐变
        primary: '#10b981', // 翠绿色 - 生命科学主题
        secondary: '#059669', // 深绿色
        accent: '#f59e0b', // 琥珀色 - 强调色
        dark: '#0f172a', // 深色背景
        light: '#f8fafc', // 浅色背景
        medical: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      backgroundImage: {
        'medical-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        'data-pattern': 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)',
      }
    },
  },
  plugins: [],
}
