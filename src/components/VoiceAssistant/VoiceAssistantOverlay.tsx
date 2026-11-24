import type { VoiceAssistant } from '../../hooks/useVoiceAssistant';
import './VoiceAssistantOverlay.css';

interface VoiceAssistantOverlayProps {
  assistant: VoiceAssistant;
}

const STATE_LABEL: Record<string, string> = {
  ativando: 'Ativando…',
  escutando: 'Ouvindo…',
  processando: 'Pensando…',
  falando: 'Respondendo…',
  erro: 'Ops…',
};

/**
 * Overlay global estilo "Apple Intelligence/Siri" — brilho animado
 * contornando todo o stage 1280×720 (não um orb central). Interface
 * própria do NeoBladeConnectOS; não é a Siri oficial. Renderiza por cima
 * da tela atual sem desmontá-la; fechar restaura o contexto de origem.
 */
export function VoiceAssistantOverlay({ assistant }: VoiceAssistantOverlayProps) {
  const { state, isActive, transcript, responseText, errorMessage, audioLevel, cancel } = assistant;

  if (!isActive) return null;

  const pulse = 1 + audioLevel * 0.5;

  return (
    <div className="voice-overlay" role="dialog" aria-label="Assistente de voz">
      <div
        className={`voice-overlay__ring voice-overlay__ring--${state}`}
        style={{ ['--voice-pulse' as string]: pulse }}
      />
      <div className="voice-overlay__halo" style={{ ['--voice-pulse' as string]: pulse }} />

      <button type="button" className="voice-overlay__dismiss" onClick={cancel} aria-label="Fechar assistente">
        ✕
      </button>

      <div className="voice-overlay__panel">
        <span className="voice-overlay__state">{STATE_LABEL[state] ?? ''}</span>
        {state === 'escutando' && (
          <p className="voice-overlay__transcript">{transcript || 'Pode falar…'}</p>
        )}
        {(state === 'falando' || state === 'processando') && responseText && (
          <p className="voice-overlay__response">{responseText}</p>
        )}
        {state === 'erro' && errorMessage && <p className="voice-overlay__error">{errorMessage}</p>}
      </div>
    </div>
  );
}
