import { useMemo, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { IosListGroup, IosListRow } from '../ios/IosListGroup';
import { IosToggle } from '../ios/IosToggle';
import { IosSearchField } from '../ios/IosSearchField';
import { useRemovedApps } from '../../hooks/useRemovedApps';
import { homeApps } from '../../data/apps';
import type { SettingsState } from '../../hooks/useSettingsState';
import './ConfiguracoesScreen.css';

interface ConfiguracoesScreenProps {
  onBack: () => void;
  settings: SettingsState;
  onOpenNotificacoes: () => void;
}

type SectionId = 'aparencia' | 'audio' | 'voz' | 'notificacoes' | 'apps' | 'idioma' | 'sobre';

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  color: string;
  summary: string;
}

const SECTIONS: Section[] = [
  { id: 'aparencia', label: 'Aparência', icon: '🎨', color: '#8e44ec', summary: 'Tema e transparência' },
  { id: 'audio', label: 'Sons e Áudio', icon: '🔊', color: '#ff453a', summary: 'Volume e avisos' },
  { id: 'voz', label: 'Siri e Voz', icon: '🎙️', color: '#2c2c2e', summary: 'Assistente de voz' },
  { id: 'notificacoes', label: 'Notificações', icon: '🔔', color: '#ff453a', summary: 'Badges e banners' },
  { id: 'apps', label: 'Aplicativos', icon: '▦', color: '#0a84ff', summary: 'Atalhos removidos' },
  { id: 'idioma', label: 'Idioma e Região', icon: '🌐', color: '#30d158', summary: 'Português (Brasil)' },
  { id: 'sobre', label: 'Sobre', icon: 'ℹ️', color: '#8e8e93', summary: 'Versão e sistema' },
];

/**
 * App **Ajustes** (antes "Configurações" — Fase 7 refaz a apresentação
 * para a linguagem do iOS/Ajustes do iPhone, mantendo o id de tela
 * `configuracoes` e o estado existente por compatibilidade). Navegação
 * mestre-detalhe: lista agrupada à esquerda (com busca funcional),
 * detalhe da seção à direita — nunca os dois mesmos 5 botões de aba da
 * versão anterior. Cada controle continua tendo efeito real e
 * persistido (useSettingsState); nenhuma opção liga um recurso fictício.
 */
export function ConfiguracoesScreen({ onBack, settings, onOpenNotificacoes }: ConfiguracoesScreenProps) {
  const [sectionId, setSectionId] = useState<SectionId>('aparencia');
  const [query, setQuery] = useState('');
  const { settings: s, update } = settings;
  const removedApps = useRemovedApps();

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter((sec) => sec.label.toLowerCase().includes(q) || sec.summary.toLowerCase().includes(q));
  }, [query]);

  const activeSection = filteredSections.find((sec) => sec.id === sectionId) ?? filteredSections[0];

  return (
    <div className="ajustes-screen">
      <BackButton onClick={onBack} />

      <nav className="ajustes-screen__nav">
        <h1 className="ajustes-screen__nav-title ios-large-title">Ajustes</h1>
        <IosSearchField value={query} onChange={setQuery} placeholder="Buscar em Ajustes" />
        <div className="ajustes-screen__nav-list">
          {filteredSections.map((sec) => (
            <IosListRow
              key={sec.id}
              icon={sec.icon}
              iconBg={sec.color}
              label={sec.label}
              chevron
              onClick={() => setSectionId(sec.id)}
            />
          ))}
          {filteredSections.length === 0 && (
            <p className="ajustes-screen__no-results ios-subheadline">Nenhum ajuste encontrado para "{query}".</p>
          )}
        </div>
      </nav>

      <section className="ajustes-screen__detail">
        {activeSection?.id === 'aparencia' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Aparência</h2>
            <IosListGroup
              footer="O tema claro só se aplica à tela de Navegação, o único app com referência visual para os dois temas. As demais telas mantêm o visual escuro original do CarPlay, aprovado nas fases anteriores."
            >
              <IosListRow label="Escuro" value={s.theme === 'escuro' ? '✓' : undefined} onClick={() => update('theme', 'escuro')} />
              <IosListRow label="Claro (Navegação)" value={s.theme === 'claro' ? '✓' : undefined} onClick={() => update('theme', 'claro')} />
            </IosListGroup>
            <IosListGroup header="Liquid Glass" footer="Controla o desfoque e a opacidade dos cartões flutuantes (Assistente de Voz e banner de Notificações).">
              <div className="ajustes-screen__slider-row">
                <span className="ios-body">Intensidade da transparência</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.glassIntensity}
                  onChange={(e) => update('glassIntensity', Number(e.target.value))}
                  className="ajustes-screen__slider"
                />
                <span className="ajustes-screen__slider-value ios-subheadline">{s.glassIntensity}%</span>
              </div>
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'audio' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Sons e Áudio</h2>
            <IosListGroup footer="Controla o volume e o interruptor do aviso sonoro do banner de Notificações.">
              <div className="ajustes-screen__slider-row">
                <span className="ios-body">Volume dos sons do sistema</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.masterVolume}
                  onChange={(e) => update('masterVolume', Number(e.target.value))}
                  className="ajustes-screen__slider"
                />
                <span className="ajustes-screen__slider-value ios-subheadline">{s.masterVolume}%</span>
              </div>
              <IosListRow
                label="Sons de notificação"
                trailing={<IosToggle checked={s.notificationSound} onChange={(v) => update('notificationSound', v)} />}
              />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'voz' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Siri e Voz</h2>
            <IosListGroup footer="Atalho: Ctrl+Alt+V. Não é a Siri oficial nem usa SiriKit — é a interface própria do NeoBladeConnectOS, inspirada visualmente no efeito do Apple Intelligence/Siri.">
              <IosListRow
                label="Assistente de voz"
                trailing={<IosToggle checked={s.assistantEnabled} onChange={(v) => update('assistantEnabled', v)} />}
              />
              <IosListRow
                label="Mostrar transcrição em tempo real"
                trailing={
                  <IosToggle checked={s.assistantShowTranscript} onChange={(v) => update('assistantShowTranscript', v)} />
                }
                disabled={!s.assistantEnabled}
              />
            </IosListGroup>
            <IosListGroup header="Voz">
              <IosListRow label="Idioma do reconhecimento" value="Português (Brasil)" />
              <IosListRow label="Voz da resposta" value="Automática (pt-BR do navegador)" />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'notificacoes' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Notificações</h2>
            <IosListGroup footer="O banner transitório e o aviso sonoro usam as preferências de Sons e Áudio acima.">
              <IosListRow label="Badges nos ícones" value="Ativado" />
              <IosListRow label="Banner sobre outros apps" value="Ativado" />
            </IosListGroup>
            <IosListGroup footer='Abra o app Notificações para marcar como lida, apagar ou simular uma nova notificação de teste.'>
              <IosListRow label="Gerenciar notificações" chevron onClick={onOpenNotificacoes} />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'apps' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Aplicativos</h2>
            {removedApps.removedIds.length === 0 ? (
              <IosListGroup footer="Nenhum atalho removido da Home.">
                <IosListRow label="Todos os atalhos estão visíveis" />
              </IosListGroup>
            ) : (
              <IosListGroup header="Atalhos removidos" footer="Remover um atalho na Home (pressione e segure) não desinstala o app, só o esconde da grade.">
                {removedApps.removedIds.map((id) => {
                  const app = homeApps.find((a) => a.id === id);
                  return (
                    <IosListRow
                      key={id}
                      label={app?.label ?? id}
                      trailing={
                        <button type="button" className="ajustes-screen__restore-btn" onClick={() => removedApps.restoreOne(id)}>
                          Restaurar
                        </button>
                      }
                    />
                  );
                })}
              </IosListGroup>
            )}
            {removedApps.removedIds.length > 0 && (
              <button type="button" className="ajustes-screen__restore-all" onClick={removedApps.restoreAll}>
                Restaurar todos os atalhos removidos
              </button>
            )}
          </>
        )}

        {activeSection?.id === 'idioma' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Idioma e Região</h2>
            <IosListGroup footer="Nomes próprios de marcas e clubes não são traduzidos. Não há suporte a outros idiomas nesta versão — nenhum seletor fictício é mostrado.">
              <IosListRow label="Idioma do sistema" value="Português (Brasil)" />
              <IosListRow label="Região" value="Brasil" />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'sobre' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Sobre</h2>
            <IosListGroup>
              <IosListRow label="Versão" value="NeoBladeConnectOS — Fase 7" />
              <IosListRow label="Resolução do stage" value="1280 × 720" />
              <IosListRow label="Navegador" value={detectBrowserName()} />
              <IosListRow label="Modo" value={import.meta.env.DEV ? 'Desenvolvimento' : 'Produção'} />
            </IosListGroup>
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
