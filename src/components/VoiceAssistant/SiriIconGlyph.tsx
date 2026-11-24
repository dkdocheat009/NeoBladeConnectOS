interface SiriIconGlyphProps {
  size?: number;
}

/**
 * Ícone multicolorido original do assistente de voz do NeoBladeConnectOS —
 * um redemoinho desenhado em SVG (gradiente + anéis), só inspirado no
 * espírito visual do Apple Intelligence/Siri (mesma paleta já usada no
 * anel de borda em VoiceAssistantOverlay.css). Não reproduz o glifo oficial
 * da Siri nem qualquer asset/captura da Apple.
 */
export function SiriIconGlyph({ size = 28 }: SiriIconGlyphProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="siri-glyph-grad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#8be9ff" />
          <stop offset="35%" stopColor="#7c4dff" />
          <stop offset="68%" stopColor="#ff4da6" />
          <stop offset="100%" stopColor="#34d399" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18.5" fill="url(#siri-glyph-grad)" />
      <path
        d="M20 9c4.5 3 6.5 6.5 6.5 11s-2 8-6.5 11c-4.5-3-6.5-6.5-6.5-11s2-8 6.5-11Z"
        fill="rgba(255,255,255,0.28)"
      />
      <circle cx="20" cy="20" r="3.4" fill="#ffffff" />
    </svg>
  );
}
