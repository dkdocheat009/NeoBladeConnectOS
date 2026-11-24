interface EsportesGlyphProps {
  size?: number;
}

/**
 * Rebuilt as SVG (not a cropped asset) so it scales crisply both in the
 * Home grid (96px) and in the dock's contextual slot (61px). Green
 * gradient + stylised mini soccer pitch, matching the reference icon's
 * motif (a field with center circle and goal boxes).
 */
export function EsportesGlyph({ size = 96 }: EsportesGlyphProps) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="sport-bg" x1="10%" y1="5%" x2="95%" y2="95%">
          <stop offset="0%" stopColor="#8be58a" />
          <stop offset="55%" stopColor="#3fae57" />
          <stop offset="100%" stopColor="#1f7a3d" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="96" height="96" rx="21" fill="url(#sport-bg)" />
      <g fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round">
        <rect x="20" y="16" width="56" height="64" rx="3" />
        <line x1="20" y1="48" x2="76" y2="48" />
        <circle cx="48" cy="48" r="10" />
        <rect x="34" y="16" width="28" height="12" />
        <rect x="34" y="68" width="28" height="12" />
      </g>
    </svg>
  );
}
