/**
 * Animation duration and easing tokens.
 *
 * Duration guidelines:
 * - Micro (hover, focus): 100–150ms
 * - Fade in/out: 150–200ms
 * - Slide, scale: 200–250ms
 * - Page transition: 250–300ms
 * - > 500ms: almost always too slow
 */
export const animation = {
  duration: {
    instant: '50ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  // Framer Motion variants for reuse
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
    },
    slideUp: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 8 },
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95, y: 8 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 8 },
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
  },
} as const;
