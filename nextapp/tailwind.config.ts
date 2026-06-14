// Load shared color tokens
import tokens from './app/lib/colors.js';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // flattened semantic tokens for reliable class generation
        brand: tokens.brand.DEFAULT,
        'brand-500': tokens.brand[500],
        'brand-600': tokens.brand[600],
        'brand-700': tokens.brand[700],

        'status-error': tokens.status.error,
        'status-success': tokens.status.success,
        'status-warning': tokens.status.warning,
        'status-info': tokens.status.info,

        'neutral-900': tokens.neutral[900],
        'neutral-700': tokens.neutral[700],
        'neutral-500': tokens.neutral[500],
        'neutral-300': tokens.neutral[300],
        'neutral-100': tokens.neutral[100],

        TK: {
          background: '#131921',
          default: '#131921',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
