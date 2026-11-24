import { useState } from 'react';

interface ClubBadgeProps {
  name: string;
  code: string;
  color?: string;
  /** URL de escudo real (football-data.org). Ausente/null = modo demonstração. */
  crestUrl?: string | null;
  size?: number;
}

/**
 * Modo demonstração (sem crestUrl): iniciais em círculo colorido — não
 * imita escudos oficiais. Modo real (crestUrl presente, Fase 5): exibe o
 * escudo fornecido pela football-data.org; se a imagem falhar ao carregar,
 * cai discretamente para as iniciais em vez de afirmar que um escudo
 * existe. Ver README sobre licenciamento dos escudos reais.
 */
export function ClubBadge({ name, code, color = '#3a3a3f', crestUrl, size = 36 }: ClubBadgeProps) {
  const [failed, setFailed] = useState(false);

  if (crestUrl && !failed) {
    return (
      <img
        src={crestUrl}
        alt={name}
        width={size}
        height={size}
        style={{ objectFit: 'contain', flexShrink: 0 }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      title={crestUrl ? `${name} (escudo indisponível)` : name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {code}
    </div>
  );
}
