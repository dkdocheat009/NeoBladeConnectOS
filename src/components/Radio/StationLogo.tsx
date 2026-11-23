import type { RadioStation } from '../../data/radioStations';

interface StationLogoProps {
  station: RadioStation;
  size?: number;
}

/** Generic colored-square placeholder logo — mock stations only, no real branding. */
export function StationLogo({ station, size = 48 }: StationLogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: station.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.32,
        flexShrink: 0,
      }}
    >
      {station.initials}
    </div>
  );
}
