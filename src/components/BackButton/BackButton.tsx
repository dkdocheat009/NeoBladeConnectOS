import './BackButton.css';

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button type="button" className="back-button" aria-label="Voltar" onClick={onClick}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M15 5 8 12l7 7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
