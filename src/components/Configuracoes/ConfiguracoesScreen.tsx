import { useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { useRemovedApps } from '../../hooks/useRemovedApps';
import { homeApps } from '../../data/apps';
import type { SettingsState } from '../../hooks/useSettingsState';
import './ConfiguracoesScreen.css';

interface ConfiguracoesScreenProps {
  onBack: () => void;
  settings: SettingsState;
}

type Tab = 'aparencia' | 'audio' | 'voz' | 'apps' | 'sobre';

const TABS: { id: Tab; label: string }[] = [
  { id: 'aparencia', label: 'Aparência' },
  { id: 'audio', label: 'Áudio' },
  { id: 'voz', label: 'Voz/Siri' },
  { id: 'apps', label: 'Aplicativos' },
  { id: 'sobre', label: 'Sistema' },
];

/**
 * App Configurações (engrenagem do dock). Estados: 1) Aparência; 2)
 * Áudio/sons; 3) Voz/Siri; 4) Aplicativos (restaurar atalhos removidos);
 * 5) Informações do sistema. Preferências persistem em localStorage (ver
 * useSettingsState) e têm efeito real e restrito ao que já existe — nunca
 * ligam um recurso futuro fictício.
 */
export function ConfiguracoesScreen({ onBack, settings }: ConfiguracoesScreenProps) {
  const [tab, setTab] = useState<Tab>('aparencia');
  const { settings: s, update } = settings;
  const removedApps = useRemovedApps();

  return (
    <div className="config-screen">
      <BackButton onClick={onBack} />

      <nav className="config-screen__sidebar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`config-screen__tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="config-screen__main">
        {tab === 'aparencia' && (
          <>
            <h1 className="config-screen__title">Aparência</h1>
            <div className="config-screen__row">
              <div>
                <span className="config-screen__row-label">Tema</span>
                <span className="config-screen__row-hint">
                  Aplica-se à tela de Navegação (único app com referência visual clara/escura). As
                  demais telas do sistema mantêm o visual escuro original do CarPlay.
                </span>
              </div>
              <div className="config-screen__segmented">
                <button
                  type="button"
                  className={s.theme === 'escuro' ? 'is-active' : ''}
                  onClick={() => update('theme', 'escuro')}
                >
                  Escuro
                </button>
                <button
                  type="button"
                  className={s.theme === 'claro' ? 'is-active' : ''}
                  onClick={() => update('theme', 'claro')}
                >
                  Claro
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'audio' && (
          <>
            <h1 className="config-screen__title">Áudio</h1>
            <div className="config-screen__row">
              <div>
                <span className="config-screen__row-label">Volume dos sons do sistema</span>
                <span className="config-screen__row-hint">Controla o aviso sonoro das Notificações.</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={s.masterVolume}
                onChange={(e) => update('masterVolume', Number(e.target.value))}
              />
              <span className="config-screen__value">{s.masterVolume}%</span>
            </div>
            <div className="config-screen__row">
              <span className="config-screen__row-label">Sons de notificação</span>
              <Toggle checked={s.notificationSound} onChange={(v) => update('notificationSound', v)} />
            </div>
          </>
        )}

        {tab === 'voz' && (
          <>
            <h1 className="config-screen__title">Voz / Siri</h1>
            <div className="config-screen__row">
              <span className="config-screen__row-label">Ativar assistente de voz</span>
              <Toggle checked={s.assistantEnabled} onChange={(v) => update('assistantEnabled', v)} />
            </div>
            <div className="config-screen__row">
              <span className="config-screen__row-label">Mostrar transcrição em tempo real</span>
              <Toggle
                checked={s.assistantShowTranscript}
                onChange={(v) => update('assistantShowTranscript', v)}
              />
            </div>
            <div className="config-screen__row">
              <div>
                <span className="config-screen__row-label">Idioma</span>
                <span className="config-screen__row-hint">Português (Brasil) — único idioma suportado nesta versão.</span>
              </div>
            </div>
          </>
        )}

        {tab === 'apps' && (
          <>
            <h1 className="config-screen__title">Aplicativos</h1>
            {removedApps.removedIds.length === 0 ? (
              <p className="config-screen__row-hint">Nenhum atalho removido da Home.</p>
            ) : (
              <>
                <ul className="config-screen__app-list">
                  {removedApps.removedIds.map((id) => {
                    const app = homeApps.find((a) => a.id === id);
                    return (
                      <li key={id}>
                        <span>{app?.label ?? id}</span>
                        <button type="button" onClick={() => removedApps.restoreOne(id)}>
                          Restaurar
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button type="button" className="config-screen__action" onClick={removedApps.restoreAll}>
                  Restaurar todos os atalhos removidos
                </button>
              </>
            )}
          </>
        )}

        {tab === 'sobre' && (
          <>
            <h1 className="config-screen__title">Informações do sistema</h1>
            <dl className="config-screen__info">
              <dt>Versão</dt>
              <dd>NeoBladeConnectOS — Fase 6</dd>
              <dt>Resolução do stage</dt>
              <dd>1280 × 720</dd>
              <dt>Navegador</dt>
              <dd>{detectBrowserName()}</dd>
              <dt>Modo</dt>
              <dd>{import.meta.env.DEV ? 'Desenvolvimento' : 'Produção'}</dd>
            </dl>
          </>
        )}
      </section>
    </div>
  );
}

function detectBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/')) return 'Google Chrome';
  if (ua.includes('Firefox/')) return 'Mozilla Firefox';
  if (ua.includes('Safari/')) return 'Safari';
  return 'Navegador não identificado';
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`config-toggle${checked ? ' is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="config-toggle__knob" />
    </button>
  );
}
