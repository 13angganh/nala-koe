export const colors = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  semantic: {
    success: { light: '#22c55e', DEFAULT: '#16a34a', dark: '#15803d' },
    warning: { light: '#fbbf24', DEFAULT: '#d97706', dark: '#b45309' },
    error: { light: '#f87171', DEFAULT: '#dc2626', dark: '#b91c1c' },
    info: { light: '#60a5fa', DEFAULT: '#2563eb', dark: '#1d4ed8' },
  },
  // Light mode surfaces
  surface: {
    base: '#ffffff',
    subtle: '#f8fafc',
    muted: '#f1f5f9',
    emphasis: '#e2e8f0',
  },
  // Dark mode surfaces
  surfaceDark: {
    base: '#0f172a',
    subtle: '#1e293b',
    muted: '#334155',
    emphasis: '#475569',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#ffffff',
  },
  textDark: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#64748b',
    disabled: '#475569',
    inverse: '#0f172a',
  },
  border: {
    subtle: '#f1f5f9',
    DEFAULT: '#e2e8f0',
    emphasis: '#cbd5e1',
    focus: '#0ea5e9',
  },
  borderDark: {
    subtle: '#1e293b',
    DEFAULT: '#334155',
    emphasis: '#475569',
    focus: '#0ea5e9',
  },
} as const;
