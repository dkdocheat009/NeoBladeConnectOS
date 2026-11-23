import type { TruckBrand } from '../../data/truckBrands';
import { VehicleFallbackGlyph } from './VehicleFallbackGlyph';
import './BrandLogoGlyph.css';

interface BrandLogoGlyphProps {
  brand: TruckBrand;
}

/**
 * Uniform white squircle card for the Veículo shortcut, so every brand
 * (different native logo proportions/colors) sits consistently inside the
 * same app-icon frame as the rest of the Home grid.
 */
export function BrandLogoGlyph({ brand }: BrandLogoGlyphProps) {
  if (!brand.logo) {
    return <VehicleFallbackGlyph brandName={brand.name} />;
  }
  return (
    <div className="brand-logo-card">
      <img src={brand.logo} alt={brand.name} draggable={false} />
    </div>
  );
}
