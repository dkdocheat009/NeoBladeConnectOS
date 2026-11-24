import type { IncomingCall } from '../../hooks/useIncomingCall';
import { mockCaller } from '../../data/callMock';
import './ChamadasOverlay.css';

interface ChamadasOverlayProps {
  call: IncomingCall;
}

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Cartão de chamada (reproduz call.png) — sobrepõe a tela atual (tipicamente
 * a Navegação) sem congelar a interface por baixo. Nome/número fictícios,
 * sem telefonia real.
 */
export function ChamadasOverlay({ call }: ChamadasOverlayProps) {
  if (call.state === 'idle') return null;

  return (
    <div className={`chamada-card chamada-card--${call.state}`} role="dialog" aria-label="Chamada">
      <span className="chamada-card__avatar">{mockCaller.initial}</span>
      <div className="chamada-card__info">
        <span className="chamada-card__name">{mockCaller.name}</span>
        <span className="chamada-card__subtitle">
          {call.state === 'active'
            ? formatElapsed(call.elapsedS)
            : call.state === 'ended'
              ? 'Chamada encerrada'
              : mockCaller.subtitle}
        </span>
      </div>

      {call.state === 'ringing' && (
        <div className="chamada-card__actions">
          <button
            type="button"
            className="chamada-card__btn chamada-card__btn--decline"
            aria-label="Recusar"
            onClick={call.decline}
          >
            <PhoneGlyph hangup />
          </button>
          <button
            type="button"
            className="chamada-card__btn chamada-card__btn--accept"
            aria-label="Atender"
            onClick={call.accept}
          >
            <PhoneGlyph />
          </button>
        </div>
      )}

      {call.state === 'active' && (
        <div className="chamada-card__actions">
          <button
            type="button"
            className={`chamada-card__btn chamada-card__btn--mute${call.muted ? ' is-active' : ''}`}
            aria-label={call.muted ? 'Reativar áudio' : 'Mudo'}
            onClick={call.toggleMute}
          >
            <MuteGlyph muted={call.muted} />
          </button>
          <button
            type="button"
            className="chamada-card__btn chamada-card__btn--decline"
            aria-label="Encerrar chamada"
            onClick={call.hangUp}
          >
            <PhoneGlyph hangup />
          </button>
        </div>
      )}
    </div>
  );
}

function PhoneGlyph({ hangup = false }: { hangup?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4.5 4.5c1.8-1.2 3.3-1.4 4-1 .6.3 1.4 1.9 1.8 3 .3.8.1 1.3-.4 1.8l-1.1 1c-.3.3-.4.7-.2 1.1.8 1.6 2.2 3 3.8 3.8.4.2.8.1 1.1-.2l1-1.1c.5-.5 1-.7 1.8-.4 1.1.4 2.7 1.2 3 1.8.4.7.2 2.2-1 4-.9 1.3-2.7 1.7-4.3 1.1-4.2-1.5-7.9-5.2-9.4-9.4-.6-1.6-.2-3.4 1.1-4.3Z"
        fill={hangup ? '#fff' : '#fff'}
        transform={hangup ? 'rotate(135 12 12)' : undefined}
      />
    </svg>
  );
}

function MuteGlyph({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
      <path
        d="M6 11a6 6 0 0 0 12 0M12 17v3"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {muted && <path d="M3 3 21 21" stroke="#ff453a" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}
