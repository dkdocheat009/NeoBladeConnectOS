import type { VoiceAssistant } from '../../hooks/useVoiceAssistant';
import { SiriIconGlyph } from './SiriIconGlyph';
import './VoiceAssistantOverlay.css';

interface VoiceAssistantOverlayProps {
  assistant: VoiceAssistant;
  showTranscript?: boolean;
}

const STATE_HEADLINE: Record<string, string> = {
  ativando: 'Ativando…',
  escutando: 'Ouvindo…',
  processando: 'Processando…',
  falando: 'Assistente',
  erro: 'Erro',
};

const LISTEN_HINTS = ['Ex.: "Que horas são?"', 'Ex.: "Abra o Rádio"', 'Ex.: "Pausar música"'];

/**
 * Overlay global estilo "Apple Intelligence/Siri": brilho animado nas
 * bordas de todo o stage 1280×720 (ver VoiceAssistantOverlay.css) + um
 * cartão compacto no canto inferior esquerdo (Fase 9) — reproduz a
 * composição vista em imagens/de/voice.png (orb pequeno + 2 linhas de
 * texto sobre a navegação, não um cartão largo centralizado). Interface
 * própria do NeoBladeConnectOS; não é a Siri oficial, não usa SiriKit.
 * Renderiza por cima da tela atual sem desmontá-la.
 */
export function VoiceAssistantOverlay({ assistant, showTranscript = true }: VoiceAssistantOverlayProps) {
  const { state, isActive, transcript, responseText, errorMessage, audioLevel, fadingOut, cancel } = assistant;

  if (!isActive) return null;

  const pulse = 1 + audioLevel * 0.5;
  const hint = LISTEN_HINTS[Math.floor((Date.now() / 4000) % LISTEN_HINTS.length)];

  let secondary: string;
  if (state === 'erro') secondary = errorMessage ?? 'Algo deu errado.';
  else if (state === 'escutando') secondary = showTranscript ? transcript || hint : hint;
  else if (state === 'processando') secondary = showTranscript ? transcript || '…' : 'Pensando…';
  else if (state === 'falando') secondary = showTranscript ? responseText : 'Respondendo por voz…';
  else secondary = '';

  return (
    <div className="voice-overlay" role="dialog" aria-label="Assistente de voz">
      <div
        className={`voice-overlay__ring voice-overlay__ring--${state}`}
        style={{ ['--voice-pulse' as string]: pulse }}
      />
      <div className="voice-overlay__halo" style={{ ['--voice-pulse' as string]: pulse }} />

      <div className={`voice-card${fadingOut ? ' voice-card--fading' : ''} voice-card--${state}`}>
        <div className="voice-card__orb" aria-hidden="true">
          <SiriIconGlyph size={34} />
        </div>
        <div className="voice-card__body">
          <p className="voice-card__headline">
            {STATE_HEADLINE[state] ?? ''}
            {state === 'escutando' && <span className="voice-card__dot" aria-hidden="true" />}
          </p>
          {secondary && <p className="voice-card__secondary">{secondary}</p>}
        </div>
        <button type="button" className="voice-card__dismiss" onClick={cancel} aria-label="Fechar assistente">
          ✕
        </button>
      </div>
    </div>
  );
}
