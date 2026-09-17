/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        cream: '#FFFBF7',
        card: '#FFFFFF',
        ink: '#1C1C19',
        'ink-muted': '#58423B',
        orange: '#F18322',
        'orange-dark': '#894400',
        peach: '#FFE7DB',
        denim: '#2A4E75',
        line: '#DFC0B7',
        danger: '#BA1A1A',
        'danger-soft': '#FFDAD6',
        success: '#2E6B4F',
        'success-soft': '#E8F3EE',
      },
      fontFamily: {
        heading: ['BeVietnamPro-Regular'],
        'heading-medium': ['BeVietnamPro-Medium'],
        'heading-bold': ['BeVietnamPro-Bold'],
        body: ['PlusJakartaSans-Regular'],
        'body-medium': ['PlusJakartaSans-Medium'],
      },
      maxWidth: {
        form: '640px',
      },
    },
  },
  plugins: [],
};
