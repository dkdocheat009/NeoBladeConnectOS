import type { WeatherIcon } from '../../data/weatherMock';

interface WeatherIconGlyphProps {
  icon: WeatherIcon;
  size?: number;
}

/** Pequeno conjunto de ícones de clima reutilizado em hora/dia/detalhe. */
export function WeatherIconGlyph({ icon, size = 22 }: WeatherIconGlyphProps) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const };

  if (icon === 'sun') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="5" fill="#ffcc4d" />
        <g stroke="#ffcc4d" strokeWidth="1.8" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="23" />
          <line x1="1" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="23" y2="12" />
          <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
          <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
          <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
          <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
        </g>
      </svg>
    );
  }
  if (icon === 'moon') {
    return (
      <svg {...common}>
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5z" fill="#ffcc4d" />
      </svg>
    );
  }
  if (icon === 'rain') {
    return (
      <svg {...common}>
        <path
          d="M7 15a4.5 4.5 0 0 1 .4-9A6 6 0 0 1 19 8a4 4 0 0 1-1 7.9H7z"
          fill="#b9c3cf"
        />
        <g stroke="#5fb0ff" strokeWidth="1.6" strokeLinecap="round">
          <line x1="9" y1="18" x2="7.5" y2="22" />
          <line x1="13" y1="18" x2="11.5" y2="22" />
          <line x1="17" y1="18" x2="15.5" y2="22" />
        </g>
      </svg>
    );
  }
  if (icon === 'partly') {
    return (
      <svg {...common}>
        <circle cx="8" cy="9" r="4.2" fill="#ffcc4d" />
        <path
          d="M10 17a4.5 4.5 0 0 1 .3-9 6 6 0 0 1 11 2.7A4 4 0 0 1 20.5 19H10z"
          fill="#d6dde3"
        />
      </svg>
    );
  }
  // cloud
  return (
    <svg {...common}>
      <path
        d="M7 18a4.5 4.5 0 0 1 .4-9A6 6 0 0 1 19 11a4 4 0 0 1-1 7H7z"
        fill="#d6dde3"
      />
    </svg>
  );
}
