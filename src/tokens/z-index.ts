/**
 * Z-index tokens. NEVER use arbitrary z-index values (z-[999]).
 * Always import from here.
 */
export const zIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const;
