interface RadarGlyphProps {
  size?: number;
}

/**
 * Ícone do app Radar/Alertas (reproduz o 4º slot do dock em blitzer.png):
 * fundo escuro com duplo chevron verde ("live/à frente").
 */
export function RadarGlyph({ size = 96 }: RadarGlyphProps) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden="true">
      <rect x="0" y="0" width="96" height="96" rx="21" fill="#17181c" />
      <g fill="none" stroke="#34c759" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 56 48 34 72 56" />
        <path d="M24 72 48 50 72 72" opacity="0.6" />
      </g>
    </svg>
  );
}
