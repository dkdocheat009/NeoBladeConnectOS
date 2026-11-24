import { useEffect, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { useOneShotDictation } from '../../hooks/useOneShotDictation';
import type { MessagesState } from '../../hooks/useMessagesState';
import type { MessageItem } from '../../data/messagesMock';
import './MensagensScreen.css';

interface MensagensScreenProps {
  onBack: () => void;
  messages: MessagesState;
  onActivateVoice: () => void;
}

type View = 'recentes' | 'naoLidas';
type Mode = 'lista' | 'detalhe' | 'ditar' | 'revisar';

/**
 * App Mensagens (atalho existente na Home). Estados: 1) visão recente
 * minimalista orientada a voz; 2) não lidas; 3) leitura de uma mensagem
 * (com opção de ouvir em voz alta); 4) ditar resposta + revisão/confirmação
 * simulada; 5) caixa vazia. Tudo mock/local — sem SMS/WhatsApp/contatos
 * reais; nenhuma mensagem é enviada a uma pessoa real.
 */
export function MensagensScreen({ onBack, messages, onActivateVoice }: MensagensScreenProps) {
  const [view, setView] = useState<View>('recentes');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('lista');
  const [draft, setDraft] = useState('');
  const [sentToast, setSentToast] = useState(false);
  const dictation = useOneShotDictation();

  const selected = messages.messages.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    if (mode === 'ditar' && !dictation.listening && dictation.transcript) {
      setDraft(dictation.transcript);
      setMode('revisar');
    }
  }, [mode, dictation.listening, dictation.transcript]);

  const openMessage = (m: MessageItem) => {
    setSelectedId(m.id);
    setMode('detalhe');
    messages.markRead(m.id);
  };

  const closeDetail = () => {
    setSelectedId(null);
    setMode('lista');
    dictation.reset();
    setDraft('');
  };

  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    window.speechSynthesis.speak(utter);
  };

  const startDictation = () => {
    setMode('ditar');
    dictation.start();
  };

  const confirmSend = () => {
    if (selected) messages.replySimulated(selected.id, draft);
    setSentToast(true);
    window.setTimeout(() => setSentToast(false), 2200);
    closeDetail();
  };

  if (messages.messages.length === 0) {
    return (
      <div className="mensagens-screen">
        <BackButton onClick={onBack} />
        <div className="mensagens-screen__empty">
          <span className="mensagens-screen__empty-icon">💬</span>
          <p>Nenhuma mensagem.</p>
          <button type="button" className="mensagens-screen__action" onClick={messages.restoreDemo}>
            Repor mensagens de exemplo (teste)
          </button>
        </div>
      </div>
    );
  }

  const list = (view === 'naoLidas' ? messages.messages.filter((m) => !m.read) : messages.messages).slice(
    0,
    view === 'recentes' ? 3 : undefined,
  );

  return (
    <div className="mensagens-screen">
      <BackButton onClick={onBack} />

      <header className="mensagens-screen__header">
        <h1 className="mensagens-screen__title">Mensagens</h1>
        <SegmentedControl
          options={[
            { id: 'recentes', label: 'Recentes' },
            { id: 'naoLidas', label: 'Não lidas' },
          ]}
          value={view}
          onChange={(id) => setView(id as View)}
        />
        <button type="button" className="mensagens-screen__clear" onClick={messages.clearAll}>
          Limpar tudo
        </button>
      </header>

      {view === 'recentes' && (
        <button type="button" className="mensagens-screen__voice-hint" onClick={onActivateVoice}>
          <span className="mensagens-screen__voice-icon">🎙️</span>
          Perguntar por voz ("que horas são?", "abrir rádio"…)
        </button>
      )}

      <div className="mensagens-screen__list">
        {list.length === 0 && view === 'naoLidas' && (
          <p className="mensagens-screen__list-empty">Nenhuma mensagem não lida.</p>
        )}
        {list.map((m) => (
          <button type="button" key={m.id} className="mensagens-screen__item" onClick={() => openMessage(m)}>
            {!m.read && <span className="mensagens-screen__dot" aria-hidden="true" />}
            <div className="mensagens-screen__item-body">
              <span className="mensagens-screen__item-sender">{m.sender}</span>
              <span className="mensagens-screen__item-preview">{m.preview}</span>
            </div>
            <span className="mensagens-screen__item-time">{m.time}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mensagens-screen__overlay" onClick={closeDetail}>
          <div className="mensagens-screen__detail" onClick={(e) => e.stopPropagation()}>
            {mode === 'detalhe' && (
              <>
                <span className="mensagens-screen__detail-sender">{selected.sender}</span>
                <p className="mensagens-screen__detail-body">{selected.body}</p>
                {selected.replied && (
                  <p className="mensagens-screen__detail-replied">Sua resposta (simulada): “{selected.replied}”</p>
                )}
                <div className="mensagens-screen__detail-actions">
                  <button type="button" onClick={() => speakMessage(selected.body)}>
                    🔊 Ouvir mensagem
                  </button>
                  <button type="button" onClick={startDictation}>
                    🎙️ Ditar resposta
                  </button>
                  <button type="button" className="is-secondary" onClick={() => messages.deleteMessage(selected.id)}>
                    Apagar
                  </button>
                </div>
              </>
            )}

            {mode === 'ditar' && (
              <>
                <span className="mensagens-screen__detail-sender">Ditando resposta…</span>
                <p className="mensagens-screen__dictation-live">
                  {dictation.transcript || 'Pode falar…'}
                </p>
                {dictation.error && <p className="mensagens-screen__detail-replied">{dictation.error}</p>}
                <div className="mensagens-screen__detail-actions">
                  <button type="button" className="is-secondary" onClick={() => dictation.stop()}>
                    Parar e revisar
                  </button>
                </div>
              </>
            )}

            {mode === 'revisar' && (
              <>
                <span className="mensagens-screen__detail-sender">Revisar resposta</span>
                <textarea
                  className="mensagens-screen__draft"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                />
                <div className="mensagens-screen__detail-actions">
                  <button type="button" onClick={confirmSend} disabled={!draft.trim()}>
                    Confirmar envio (simulado)
                  </button>
                  <button type="button" className="is-secondary" onClick={() => setMode('detalhe')}>
                    Cancelar
                  </button>
                </div>
              </>
            )}

            <button type="button" className="mensagens-screen__detail-close" onClick={closeDetail}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {sentToast && <div className="mensagens-screen__toast">Mensagem enviada (simulado)</div>}
    </div>
  );
}
