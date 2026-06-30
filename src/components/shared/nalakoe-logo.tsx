/**
 * NalaKoe brand mark — "N" monogram with an accent underline, matching the
 * PWA app icon exactly (see scripts/generate-icons.mjs: same composition,
 * same --accent underline bar, same proportions). Used everywhere the brand
 * needs to appear inside the app shell (sidebar, mobile nav drawer, login,
 * register) so the in-app mark and the installed-app icon are the same
 * logo, not two different unrelated marks.
 *
 * This is the ONE intentional non-lucide visual in the app: it's a brand
 * identity, not a UI icon, so it doesn't belong in the lucide icon set.
 */

interface NalaKoeLogoProps {
  /** Pixel size of the square mark. Default 16 (sidebar/nav scale). */
  size?: number;
  className?: string;
}

/**
 * Render inside a container with bg-[#0f172a] (the brand's fixed dark
 * background — same hex as BRAND.bg in scripts/generate-icons.mjs) and
 * text-white. Doesn't use a theme-variable background like
 * --surface-invert because that token's value happens to sit close to
 * adjacent surfaces in dark mode (low contrast); the brand mark needs a
 * fixed, guaranteed-contrast background in both themes, matching the
 * installed app icon exactly.
 */
export function NalaKoeLogo({ size = 16, className }: NalaKoeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <text
        x="12"
        y="11.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="700"
        fontFamily="var(--font-sans, Inter, system-ui, sans-serif)"
        fill="currentColor"
      >
        N
      </text>
      <rect x="7.2" y="17" width="9.6" height="1.6" rx="0.8" fill="var(--accent)" />
    </svg>
  );
}
