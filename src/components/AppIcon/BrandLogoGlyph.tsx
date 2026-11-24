import type { TruckBrand } from '../../data/truckBrands';
import { VehicleFallbackGlyph } from './VehicleFallbackGlyph';
import './BrandLogoGlyph.css';

interface BrandLogoGlyphProps {
  brand: TruckBrand;
  size?: number;
}

/**
 * Uniform white squircle card for the Veículo shortcut, so every brand
 * (different native logo proportions/colors) sits consistently inside the
 * same app-icon frame as the rest of the Home grid. `size` lets the same
 * component be reused at the dock's smaller contextual-slot scale.
 */
export function BrandLogoGlyph({ brand, size = 96 }: BrandLogoGlyphProps) {
  if (!brand.logo) {
    return <VehicleFallbackGlyph brandName={brand.name} size={size} />;
  }
  const radius = Math.round(size * 0.2188);
  const padding = Math.round(size * 0.1667);
  return (
    <div
      className="brand-logo-card"
      style={{ width: size, height: size, borderRadius: radius, padding }}
    >
      <img src={brand.logo} alt={brand.name} draggable={false} />
    </div>
  );
}
