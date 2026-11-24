import type { Club } from '../../data/sportsMock';

interface ClubBadgeProps {
  club: Club;
  size?: number;
}

/** Iniciais em círculo colorido — não imita escudos oficiais de clubes reais. */
export function ClubBadge({ club, size = 36 }: ClubBadgeProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: club.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {club.code}
    </div>
  );
}
