export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  fontSize: {
    '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.02em' }],
    xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
    sm: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
    base: ['16px', { lineHeight: '24px', letterSpacing: '0' }],
    lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
    xl: ['20px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
    '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
    '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
    '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.03em' }],
    '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.03em' }],
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
