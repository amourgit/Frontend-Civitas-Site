/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Permet d'utiliser dark:class
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: { 
      // Colors utilisant nos variables CSS
      colors: {
        // Primary colors
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950)',
          DEFAULT: 'var(--primary-500)',
        },
        // Secondary colors
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
          950: 'var(--secondary-950)',
          DEFAULT: 'var(--secondary-500)',
        },
        // Neutral colors
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
          950: 'var(--neutral-950)',
        },
        // Success colors
        success: {
          50: 'var(--success-50)',
          100: 'var(--success-100)',
          200: 'var(--success-200)',
          300: 'var(--success-300)',
          400: 'var(--success-400)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
          700: 'var(--success-700)',
          800: 'var(--success-800)',
          900: 'var(--success-900)',
          950: 'var(--success-950)',
          DEFAULT: 'var(--success-500)',
        },
        // Warning colors
        warning: {
          50: 'var(--warning-50)',
          100: 'var(--warning-100)',
          200: 'var(--warning-200)',
          300: 'var(--warning-300)',
          400: 'var(--warning-400)',
          500: 'var(--warning-500)',
          600: 'var(--warning-600)',
          700: 'var(--warning-700)',
          800: 'var(--warning-800)',
          900: 'var(--warning-900)',
          950: 'var(--warning-950)',
          DEFAULT: 'var(--warning-500)',
        },
        // Error colors
        error: {
          50: 'var(--error-50)',
          100: 'var(--error-100)',
          200: 'var(--error-200)',
          300: 'var(--error-300)',
          400: 'var(--error-400)',
          500: 'var(--error-500)',
          600: 'var(--error-600)',
          700: 'var(--error-700)',
          800: 'var(--error-800)',
          900: 'var(--error-900)',
          950: 'var(--error-950)',
          DEFAULT: 'var(--error-500)',
        },
        // Info colors
        info: {
          50: 'var(--info-50)',
          100: 'var(--info-100)',
          200: 'var(--info-200)',
          300: 'var(--info-300)',
          400: 'var(--info-400)',
          500: 'var(--info-500)',
          600: 'var(--info-600)',
          700: 'var(--info-700)',
          800: 'var(--info-800)',
          900: 'var(--info-900)',
          950: 'var(--info-950)',
          DEFAULT: 'var(--info-500)',
        },
        // Surface colors
        background: 'var(--surface-background)',
        foreground: 'var(--surface-foreground)',
        card: {
          DEFAULT: 'var(--surface-card)',
          foreground: 'var(--surface-cardForeground)',
        },
        popover: {
          DEFAULT: 'var(--surface-popover)',
          foreground: 'var(--surface-popoverForeground)',
        },
        muted: {
          DEFAULT: 'var(--surface-muted)',
          foreground: 'var(--surface-mutedForeground)',
        },
        accent: {
          DEFAULT: 'var(--surface-accent)',
          foreground: 'var(--surface-accentForeground)',
        },
        destructive: {
          DEFAULT: 'var(--surface-destructive)',
          foreground: 'var(--surface-destructiveForeground)',
        },
        // Border colors
        border: 'var(--border-default)',
        input: 'var(--border-input)',
        ring: 'var(--border-ring)',
      },
      
      // Font families utilisant nos variables
      fontFamily: {
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
        mono: 'var(--font-mono)',
      },
      
      // Font sizes utilisant nos variables
      fontSize: {
        xs: ['var(--font-size-xs-size)', { lineHeight: 'var(--font-size-xs-line-height)' }],
        sm: ['var(--font-size-sm-size)', { lineHeight: 'var(--font-size-sm-line-height)' }],
        base: ['var(--font-size-base-size)', { lineHeight: 'var(--font-size-base-line-height)' }],
        lg: ['var(--font-size-lg-size)', { lineHeight: 'var(--font-size-lg-line-height)' }],
        xl: ['var(--font-size-xl-size)', { lineHeight: 'var(--font-size-xl-line-height)' }],
        '2xl': ['var(--font-size-2xl-size)', { lineHeight: 'var(--font-size-2xl-line-height)' }],
        '3xl': ['var(--font-size-3xl-size)', { lineHeight: 'var(--font-size-3xl-line-height)' }],
        '4xl': ['var(--font-size-4xl-size)', { lineHeight: 'var(--font-size-4xl-line-height)' }],
        '5xl': ['var(--font-size-5xl-size)', { lineHeight: 'var(--font-size-5xl-line-height)' }],
        '6xl': ['var(--font-size-6xl-size)', { lineHeight: 'var(--font-size-6xl-line-height)' }],
        '7xl': ['var(--font-size-7xl-size)', { lineHeight: 'var(--font-size-7xl-line-height)' }],
        '8xl': ['var(--font-size-8xl-size)', { lineHeight: 'var(--font-size-8xl-line-height)' }],
        '9xl': ['var(--font-size-9xl-size)', { lineHeight: 'var(--font-size-9xl-line-height)' }],
      },

      // Spacing utilisant nos variables
      spacing: {
        'px': 'var(--spacing-px)',
        '0.5': 'var(--spacing-0_5)',
        '1': 'var(--spacing-1)',
        '1.5': 'var(--spacing-1_5)',
        '2': 'var(--spacing-2)',
        '2.5': 'var(--spacing-2_5)',
        '3': 'var(--spacing-3)',
        '3.5': 'var(--spacing-3_5)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '7': 'var(--spacing-7)',
        '8': 'var(--spacing-8)',
        '9': 'var(--spacing-9)',
        '10': 'var(--spacing-10)',
        '11': 'var(--spacing-11)',
        '12': 'var(--spacing-12)',
        '14': 'var(--spacing-14)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
        '28': 'var(--spacing-28)',
        '32': 'var(--spacing-32)',
        '36': 'var(--spacing-36)',
        '40': 'var(--spacing-40)',
        '44': 'var(--spacing-44)',
        '48': 'var(--spacing-48)',
        '52': 'var(--spacing-52)',
        '56': 'var(--spacing-56)',
        '60': 'var(--spacing-60)',
        '64': 'var(--spacing-64)',
        '72': 'var(--spacing-72)',
        '80': 'var(--spacing-80)',
        '96': 'var(--spacing-96)',
      },

      // Border radius utilisant nos variables
      borderRadius: {
        'none': 'var(--border-radius-none)',
        'sm': 'var(--border-radius-sm)',
        'DEFAULT': 'var(--border-radius-default)',
        'md': 'var(--border-radius-md)',
        'lg': 'var(--border-radius-lg)',
        'xl': 'var(--border-radius-xl)',
        '2xl': 'var(--border-radius-2xl)',
        '3xl': 'var(--border-radius-3xl)',
        'full': 'var(--border-radius-full)',
      },

      // Box shadow utilisant nos variables
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-default)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
        'none': 'var(--shadow-none)',
      },

      // Animation duration
      transitionDuration: {
        '75': 'var(--duration-75)',
        '100': 'var(--duration-100)',
        '150': 'var(--duration-150)',
        '200': 'var(--duration-200)',
        '300': 'var(--duration-300)',
        '500': 'var(--duration-500)',
        '700': 'var(--duration-700)',
        '1000': 'var(--duration-1000)',
      },

      // Animation timing function
      transitionTimingFunction: {
        'linear': 'var(--easing-linear)',
        'in': 'var(--easing-in)',
        'out': 'var(--easing-out)',
        'in-out': 'var(--easing-inOut)',
      },

      // Z-index
      zIndex: {
        '0': 'var(--z-index-0)',
        '10': 'var(--z-index-10)',
        '20': 'var(--z-index-20)',
        '30': 'var(--z-index-30)',
        '40': 'var(--z-index-40)',
        '50': 'var(--z-index-50)',
        'auto': 'var(--z-index-auto)',
      },

      // Breakpoints (pour les plugins)
      screens: {
        'sm': 'var(--breakpoint-sm)',
        'md': 'var(--breakpoint-md)', 
        'lg': 'var(--breakpoint-lg)',
        'xl': 'var(--breakpoint-xl)',
        '2xl': 'var(--breakpoint-2xl)',
      },
      keyframes: {
        "canopy-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "canopy-y": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        'scroll-up-smooth': {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'scroll-down-smooth': {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        "canopy-horizontal": "canopy-x var(--duration) infinite linear",
        "canopy-vertical": "canopy-y var(--duration) linear infinite",
        'pulse': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scroll-up': 'scroll-up-smooth linear infinite',
        'scroll-down': 'scroll-down-smooth linear infinite',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
    },
  },
  plugins: [import("tailwindcss-animate")],

  // Safelist pour les couleurs dynamiques
  safelist: [
    // Colors
    {
      pattern: /^(bg|text|border|from|to|via)-(cyan|blue|purple|emerald|amber|red|slate|white)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'focus', 'active'],
    },
    // Opacity
    {
      pattern: /^(bg|text|border)-(white|black)\/(5|10|20|30|40|50|60|70|80|90)/,
    },
    // Spacing
    {
      pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y)-(0|0\.5|1|2|3|4|5|6|8|10|12|16|20|24)/,
    },
    // Grid
    {
      pattern: /^grid-cols-(1|2|3|4|5|6)/,
    },
    // Flex
    {
      pattern: /^(flex|items|justify)-(start|center|end|between|around|evenly|stretch|baseline)/,
    },
    {
      pattern: /^flex-(row|col|row-reverse|col-reverse)/,
    },
    // Heights
    'h-12', 'h-16', 'h-20',
  ],
};
