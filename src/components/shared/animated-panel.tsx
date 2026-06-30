'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { animation } from '@/tokens/animation';
import { useSettingsStore } from '@/stores/settings.store';

interface AnimatedPanelProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a conditionally-rendered section with a consistent fade+slide
 * entrance/exit (tokens/animation.ts `slideUp`) instead of an instant
 * mount/unmount snap. Use for collapsible panels, inline forms, and any
 * `{condition && (...)}` block where the appearance/disappearance should
 * feel smooth rather than jarring. Respects Settings → Appearance →
 * "Animasi" so people who turned animations off stay snappy everywhere,
 * not just in the note list.
 */
export function AnimatedPanel({ show, children, className }: AnimatedPanelProps) {
  const animationsEnabled = useSettingsStore((s) => s.preferences.enableAnimations ?? true);

  if (!animationsEnabled) {
    return show ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={animation.variants.slideUp.initial}
          animate={animation.variants.slideUp.animate}
          exit={animation.variants.slideUp.exit}
          transition={animation.variants.slideUp.transition}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
