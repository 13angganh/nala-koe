// tailwind.config.ts — satu-satunya sumber kebenaran Tailwind + shadcn/ui + tokens
import type { Config }    from 'tailwindcss';
import { fontFamily }     from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── FONT ────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },

      // ── FONT SIZE (dari tokens/typography.ts) ──────────────────────────
      fontSize: {
        '2xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        xs:    ['13px', { lineHeight: '18px', letterSpacing: '0.01em' }],  // 12→13px
        sm:    ['15px', { lineHeight: '22px', letterSpacing: '0' }],       // 14→15px
        base:  ['16px', { lineHeight: '26px', letterSpacing: '0' }],
        lg:    ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        xl:    ['20px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.03em' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.03em' }],
        '6xl': ['60px', { lineHeight: '68px', letterSpacing: '-0.04em' }],
      },

      // ── WARNA — CSS variables (dark mode otomatis) ─────────────────────
      colors: {
        // shadcn/ui compatibility — menggunakan var() langsung (BUKAN hsl())
        // karena CSS variables sudah berisi hex values, bukan HSL triplets.
        // hsl() wrapper akan menghasilkan CSS invalid seperti hsl(#e2e8f0).
        border:     'var(--border)',
        input:      'var(--input)',
        ring:       'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },

        // ── Surface system — dari CSS variables ──────────────────────────
        surface: {
          base:     'var(--surface-base)',
          subtle:   'var(--surface-subtle)',
          muted:    'var(--surface-muted)',
          emphasis: 'var(--surface-emphasis)',
          invert:   'var(--surface-invert)',
        },

        // ── Text system ──────────────────────────────────────────────────
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          disabled:  'var(--text-disabled)',
          inverse:   'var(--text-inverse)',
        },

        // ── Border system ────────────────────────────────────────────────
        'border-subtle':   'var(--border-subtle)',
        'border-default':  'var(--border-default)',
        'border-emphasis': 'var(--border-emphasis)',
        'border-focus':    'var(--border-focus)',

        // ── Brand ────────────────────────────────────────────────────────
        brand: {
          50:  'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        // ── Semantic ─────────────────────────────────────────────────────
        success: {
          light:   '#22c55e',
          DEFAULT: 'var(--color-success)',
          dark:    '#15803d',
        },
        warning: {
          light:   '#fbbf24',
          DEFAULT: 'var(--color-warning)',
          dark:    '#b45309',
        },
        error: {
          light:   '#f87171',
          DEFAULT: 'var(--color-error)',
          dark:    '#b91c1c',
        },
        info: {
          light:   '#60a5fa',
          DEFAULT: 'var(--color-info)',
          dark:    '#1d4ed8',
        },
      },

      // ── BORDER RADIUS (dari tokens/radius.ts) ──────────────────────────
      borderRadius: {
        none:  '0',
        xs:    '2px',
        sm:    '4px',
        md:    '6px',
        lg:    '8px',
        xl:    '12px',
        '2xl': '16px',
        '3xl': '24px',
        full:  '9999px',
      },

      // ── BOX SHADOW (dari tokens/elevation.ts) ──────────────────────────
      boxShadow: {
        xs:    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm:    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md:    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg:    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl:    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none:  'none',
      },

      // ── Z-INDEX (dari tokens/z-index.ts) ───────────────────────────────
      zIndex: {
        base:     '0',
        raised:   '10',
        dropdown: '20',
        sticky:   '30',
        overlay:  '40',
        modal:    '50',
        popover:  '60',
        toast:    '70',
        tooltip:  '80',
        maximum:  '90',
      },

      // ── ANIMASI (dari tokens/animation.ts) ────────────────────────────
      transitionDuration: {
        instant: '50ms',
        fast:    '100ms',
        normal:  '200ms',
        slow:    '300ms',
        slower:  '500ms',
      },
      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ease-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ── KEYFRAMES ─────────────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in':  { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'slide-in-bottom': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        'slide-out-bottom': {
          from: { transform: 'translateY(0)' },
          to:   { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'accordion-down':   'accordion-down 0.2s ease-out',
        'accordion-up':     'accordion-up 0.2s ease-out',
        'fade-in':          'fade-in 0.2s ease-out',
        'fade-out':         'fade-out 0.2s ease-out',
        'slide-in-bottom':  'slide-in-bottom 0.3s cubic-bezier(0, 0, 0.2, 1)',
        'slide-out-bottom': 'slide-out-bottom 0.3s cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'), // dari shadcn/ui
  ],
};

export default config;
