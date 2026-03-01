/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: ['w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-11', 'w-12'],
  theme: {
    extend: {
      screens: {
        desktop: '936px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'monospace'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        'kumbh-sans': ['Kumbh Sans', 'sans-serif'],
      },
      colors: {
        // Dark theme surfaces
        'adam-bg-dark': '#000000',
        'adam-background-light': '#0A0A0A',
        'adam-bg-secondary-dark': '#000000',
        'adam-bg-light': '#111111',
        'adam-bg-secondary-light': '#1A1A1A',
        'adam-blue': '#00A6FF',
        'adam-text-primary': '#F5F5F5',
        'adam-text-secondary': '#A3A3A3',
        'adam-text-tertiary': '#737373',
        'secondary-tan': '#1A1A1A',
        'background-color': '#000000',
        'white-16%': 'rgba(255,255,255,0.06)',
        'white-700': '#D4D4D4',
        'white-500': '#A3A3A3',
        'adam-background-1': '#000000',
        'adam-background-2': '#0A0A0A',
        // Neutral scale — dark theme
        // 950 = darkest bg, 0 = near white
        'adam-neutral-950': '#0A0A0A',
        'adam-neutral-900': '#111111',
        'adam-neutral-800': '#1A1A1A',
        'adam-neutral-700': '#262626',
        'adam-neutral-500': '#404040',
        'adam-neutral-400': '#6B6B6B',
        'adam-neutral-300': '#A3A3A3',
        'adam-neutral-200': '#C4C4C4',
        'adam-neutral-100': '#D4D4D4',
        'adam-neutral-50': '#E5E5E5',
        'adam-neutral-10': '#F0F0F0',
        'adam-neutral-0': '#FAFAFA',
        pink: '#C77DFF',
        'sidebar-color': '#000000',
        'bg-gray': 'rgba(0, 0, 0, 1)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'dot-bounce-1': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-8px)' },
        },
        'dot-bounce-2': {
          '0%, 20%, 100%': { transform: 'translateY(0)' },
          '60%': { transform: 'translateY(-8px)' },
        },
        'dot-bounce-3': {
          '0%, 40%, 100%': { transform: 'translateY(0)' },
          '80%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'dot-bounce-1': 'dot-bounce-1 1.0s infinite ease-in-out',
        'dot-bounce-2': 'dot-bounce-2 1.0s infinite ease-in-out',
        'dot-bounce-3': 'dot-bounce-3 1.0s infinite ease-in-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
