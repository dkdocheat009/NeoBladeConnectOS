import type { VoiceAssistant } from '../../hooks/useVoiceAssistant';
import { SiriIconGlyph } from './SiriIconGlyph';
import './VoiceAssistantOverlay.css';

interface VoiceAssistantOverlayProps {
  assistant: VoiceAssistant;
  showTranscript?: boolean;
}

const STATE_LABEL: Record<string, string> = {
  ativando: 'Ativando…',
  escutando: 'Ouvindo',
  processando: 'Processando',
  falando: 'Respondendo',
  erro: 'Erro',
};

/**
 * Overlay global estilo "Apple Intelligence/Siri": o brilho animado nas
 * bordas de todo o stage 1280×720 (não um orb central) permanece
 * inalterado (ver VoiceAssistantOverlay.css) — Fase 6 troca só a
 * apresentação do texto por um cartão de notificação flutuante dentro do
 * stage, com ícone, transcrição em tempo real ("Você: …") e resposta
 * falada ("Assistente: …") visível do início ao fim da fala + fade de
 * saída. Interface própria do NeoBladeConnectOS; não é a Siri oficial,
 * não usa SiriKit. Renderiza por cima da tela atual sem desmontá-la.
 */
export function VoiceAssistantOverlay({ assistant, showTranscript = true }: VoiceAssistantOverlayProps) {
  const { state, isActive, transcript, responseText, errorMessage, audioLevel, fadingOut, cancel } = assistant;

  if (!isActive) return null;

  const pulse = 1 + audioLevel * 0.5;

  return (
    <div className="voice-overlay" role="dialog" aria-label="Assistente de voz">
      <div
        className={`voice-overlay__ring voice-overlay__ring--${state}`}
        style={{ ['--voice-pulse' as string]: pulse }}
      />
      <div className="voice-overlay__halo" style={{ ['--voice-pulse' as string]: pulse }} />

      <div className={`voice-card${fadingOut ? ' voice-card--fading' : ''} voice-card--${state}`}>
        <button type="button" className="voice-card__dismiss" onClick={cancel} aria-label="Fechar assistente">
          ✕
        </button>

        <div className="voice-card__header">
          <SiriIconGlyph size={26} />
          <span className="voice-card__state">{STATE_LABEL[state] ?? ''}</span>
          {state === 'escutando' && <span className="voice-card__dot" aria-hidden="true" />}
        </div>

        <div className="voice-card__body">
          {showTranscript && (state === 'escutando' || state === 'processando') && (
            <p className="voice-card__line voice-card__line--user">
              <strong>Você:</strong> {transcript || (state === 'escutando' ? 'Pode falar…' : '…')}
            </p>
          )}
          {showTranscript && state === 'falando' && responseText && (
            <p className="voice-card__line voice-card__line--assistant">
              <strong>Assistente:</strong> {responseText}
            </p>
          )}
          {state === 'erro' && errorMessage && (
            <p className="voice-card__line voice-card__line--error">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
