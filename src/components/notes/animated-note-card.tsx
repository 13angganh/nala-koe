'use client';

import { motion } from 'framer-motion';
import { animation } from '@/tokens/animation';
import { cn } from '@/lib/utils';

/**
 * AnimatedNoteCard wraps any content (typically NoteCard) with Framer Motion
 * entrance animation. Uses tokens from animation.ts.
 *
 * Usage:
 *   <AnimatedNoteCard index={i}>
 *     <NoteCard note={note} />
 *   </AnimatedNoteCard>
 */

interface AnimatedNoteCardProps {
  children: React.ReactNode;
  /** Stagger index — each item delays by index × 40ms */
  index?: number;
  className?: string;
  /** If false, renders children without animation (respects prefers-reduced-motion) */
  enabled?: boolean;
}

export function AnimatedNoteCard({
  children,
  index = 0,
  className,
  enabled = true,
}: AnimatedNoteCardProps) {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: Number.parseFloat(animation.duration.normal) / 1000,
        ease: animation.easing.easeOut,
        delay: index * 0.04, // 40ms stagger per card
      }}
      layout
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedNoteList — wraps a list container with AnimatePresence so items
 * animate in and out cleanly.
 */
import { AnimatePresence } from 'framer-motion';

interface AnimatedNoteListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedNoteList({ children, className }: AnimatedNoteListProps) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <div className={className}>{children}</div>
    </AnimatePresence>
  );
}
