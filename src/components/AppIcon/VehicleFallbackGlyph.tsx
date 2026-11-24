import './VehicleFallbackGlyph.css';

interface VehicleFallbackGlyphProps {
  brandName: string;
  size?: number;
}

/**
 * Neutral placeholder used when a truck brand has no correctly-licensed
 * logo asset available locally. Deliberately generic (silhouette + initial)
 * — it never imitates the real manufacturer mark.
 */
export function VehicleFallbackGlyph({ brandName, size = 96 }: VehicleFallbackGlyphProps) {
  const iconSize = Math.round(size * 0.417);
  const radius = Math.round(size * 0.2188);
  return (
    <div
      className="vehicle-fallback"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} aria-hidden="true">
        <path
          d="M4 30V17a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v13h2l6-8h8a2 2 0 0 1 2 2v6h2"
          fill="none"
          stroke="#9aa3b2"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="14" cy="32" r="4" fill="none" stroke="#9aa3b2" strokeWidth="2.4" />
        <circle cx="36" cy="32" r="4" fill="none" stroke="#9aa3b2" strokeWidth="2.4" />
      </svg>
      <span
        className="vehicle-fallback__initial"
        style={{ fontSize: Math.max(10, Math.round(size * 0.146)) }}
      >
        {brandName.charAt(0)}
      </span>
    </div>
  );
}
