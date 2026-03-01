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
          // Light theme surfaces
          'adam-bg-dark': '#F8F8F6',
          'adam-background-light': '#F8F8F6',
          'adam-bg-secondary-dark': '#FFFFFF',
          'adam-bg-light': '#F0F0EE',
          'adam-bg-secondary-light': '#E8E8E5',
          'adam-blue': '#00A6FF',
          'adam-text-primary': '#1A1A1A',
          'adam-text-secondary': '#6B6B6B',
          'adam-text-tertiary': '#9A9A9A',
          'secondary-tan': '#E8E8E5',
          'background-color': '#F8F8F6',
          'white-16%': 'rgba(0,0,0,0.06)',
          'white-700': '#404040',
          'white-500': '#737373',
          'adam-background-1': '#FFFFFF',
          'adam-background-2': '#F8F8F6',
          // Neutral scale — flipped for light theme
          // 950 = lightest hover bg, 0 = darkest text
          'adam-neutral-950': '#F0F0EE',
          'adam-neutral-900': '#E8E8E5',
          'adam-neutral-800': '#DEDEDB',
          'adam-neutral-700': '#E2E2DF',
          'adam-neutral-500': '#ADADAD',
          'adam-neutral-400': '#8A8A8A',
          'adam-neutral-300': '#737373',
          'adam-neutral-200': '#5C5C5C',
          'adam-neutral-100': '#404040',
          'adam-neutral-50': '#2D2D2D',
          'adam-neutral-10': '#1A1A1A',
          'adam-neutral-0': '#0D0D0D',
          pink: '#C77DFF',
          'sidebar-color': '#FFFFFF',
          'bg-gray': 'rgba(248, 248, 246)',
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