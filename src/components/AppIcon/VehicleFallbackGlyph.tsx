import './VehicleFallbackGlyph.css';

interface VehicleFallbackGlyphProps {
  brandName: string;
}

/**
 * Neutral placeholder used when a truck brand has no correctly-licensed
 * logo asset available locally. Deliberately generic (silhouette + initial)
 * — it never imitates the real manufacturer mark.
 */
export function VehicleFallbackGlyph({ brandName }: VehicleFallbackGlyphProps) {
  return (
    <div className="vehicle-fallback">
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
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
      <span className="vehicle-fallback__initial">{brandName.charAt(0)}</span>
    </div>
  );
}
