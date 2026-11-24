import './VoiceAssistantButton.css';

interface VoiceAssistantButtonProps {
  onClick: () => void;
  active: boolean;
}

/**
 * Acionamento visível do assistente (além do atalho Ctrl+Alt+V), para
 * acessibilidade e testes — discreto, não polui a Home.
 */
export function VoiceAssistantButton({ onClick, active }: VoiceAssistantButtonProps) {
  return (
    <button
      type="button"
      className={`voice-button${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-label="Abrir assistente de voz (Ctrl+Alt+V)"
      title="Assistente de voz — Ctrl+Alt+V"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="9" y="2" width="6" height="12" rx="3" fill="#fff" />
        <path
          d="M5 11a7 7 0 0 0 14 0M12 18v3"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
