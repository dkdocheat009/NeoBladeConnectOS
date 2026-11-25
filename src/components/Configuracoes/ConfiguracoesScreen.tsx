import { useEffect, useMemo, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { IosListGroup, IosListRow } from '../ios/IosListGroup';
import { IosToggle } from '../ios/IosToggle';
import { IosSearchField } from '../ios/IosSearchField';
import { useRemovedApps } from '../../hooks/useRemovedApps';
import { homeApps } from '../../data/apps';
import { playNotificationBeep } from '../../data/beep';
import { webSpeechHealth, VOICE_PROVIDER_CATALOG, type VoiceProviderHealth } from '../../types/voiceProvider';
import type { SettingsState, ThemeMode, TextSize, ClockFormat } from '../../hooks/useSettingsState';
import './ConfiguracoesScreen.css';

interface ConfiguracoesScreenProps {
  onBack: () => void;
  settings: SettingsState;
  onOpenNotificacoes: () => void;
}

type SectionId =
  | 'aparencia'
  | 'audio'
  | 'voz'
  | 'notificacoes'
  | 'acessibilidade'
  | 'privacidade'
  | 'apps'
  | 'sistema'
  | 'idioma'
  | 'integracoes'
  | 'sobre';

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  color: string;
  summary: string;
}

const SECTIONS: Section[] = [
  { id: 'aparencia', label: 'Tela e Aparência', icon: '🎨', color: '#8e44ec', summary: 'Tema, transparência' },
  { id: 'audio', label: 'Sons e Áudio', icon: '🔊', color: '#ff453a', summary: 'Volume e avisos' },
  { id: 'voz', label: 'Siri e Voz', icon: '🎙️', color: '#2c2c2e', summary: 'Assistente de voz' },
  { id: 'notificacoes', label: 'Notificações', icon: '🔔', color: '#ff453a', summary: 'Badges e banners' },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: '♿', color: '#0a84ff', summary: 'Movimento, texto' },
  { id: 'privacidade', label: 'Privacidade', icon: '🔒', color: '#8e8e93', summary: 'Microfone' },
  { id: 'apps', label: 'Home e Apps', icon: '▦', color: '#30d158', summary: 'Atalhos da Home' },
  { id: 'sistema', label: 'Sistema', icon: '⏱️', color: '#636366', summary: 'Relógio, idioma' },
  { id: 'idioma', label: 'Idioma e Região', icon: '🌐', color: '#30d158', summary: 'Português (Brasil)' },
  { id: 'integracoes', label: 'Integrações', icon: '🔌', color: '#8e8e93', summary: 'ETS2 / TruckSimMap' },
  { id: 'sobre', label: 'Sobre', icon: 'ℹ️', color: '#8e8e93', summary: 'Versão e sistema' },
];

const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'claro', label: 'Claro' },
  { id: 'escuro', label: 'Escuro' },
  { id: 'automatico', label: 'Automático' },
];

const TEXT_SIZE_OPTIONS: { id: TextSize; label: string }[] = [
  { id: 'pequeno', label: 'Pequeno' },
  { id: 'padrao', label: 'Padrão' },
  { id: 'grande', label: 'Grande' },
];

const CLOCK_FORMAT_OPTIONS: { id: ClockFormat; label: string }[] = [
  { id: '24h', label: '24 horas' },
  { id: '12h', label: '12 horas (AM/PM)' },
];

type MicStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'error' | 'unsupported';

/**
 * App **Ajustes** (antes "Configurações"). Navegação mestre-detalhe: lista
 * agrupada à esquerda (com busca funcional), detalhe da seção à direita.
 * Fase 8: tema Claro/Escuro/Automático afeta o app inteiro de verdade (ver
 * useSettingsState — aplica `data-theme` no `<html>`), e ganhou
 * Acessibilidade (reduzir transparência/movimento, tamanho do texto, com
 * efeito real) e Privacidade (teste de permissão de microfone). Fase 9:
 * cartões de prévia visual Claro/Escuro/Automático (em vez de texto),
 * seções novas Sistema (formato de relógio 12h/24h, real — afeta o dock) e
 * Integrações (promovida de dentro de Home e Apps), controles reais de
 * voz/Siri (velocidade da fala, intensidade do brilho, duração do
 * cartão), botão "Testar som" e tempo de permanência do banner de
 * Notificações. Cada controle tem efeito real e persistido; nenhuma
 * opção liga um recurso fictício nem simula hardware (brilho físico,
 * bateria do telefone).
 */
export function ConfiguracoesScreen({ onBack, settings, onOpenNotificacoes }: ConfiguracoesScreenProps) {
  const [sectionId, setSectionId] = useState<SectionId>('aparencia');
  const [query, setQuery] = useState('');
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [webSpeechStatus, setWebSpeechStatus] = useState<VoiceProviderHealth | null>(null);
  const { settings: s, update } = settings;
  const removedApps = useRemovedApps();

  useEffect(() => {
    webSpeechHealth().then(setWebSpeechStatus);
  }, []);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter((sec) => sec.label.toLowerCase().includes(q) || sec.summary.toLowerCase().includes(q));
  }, [query]);

  const activeSection = filteredSections.find((sec) => sec.id === sectionId) ?? filteredSections[0];

  const testMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }
    setMicStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicStatus('granted');
    } catch {
      setMicStatus('denied');
    }
  };

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
            <h2 className="ajustes-screen__detail-title ios-title1">Tela e Aparência</h2>
            <div className="ajustes-theme-grid">
              {(['claro', 'escuro', 'automatico'] as ThemeMode[]).map((id) => {
                const opt = THEME_OPTIONS.find((o) => o.id === id)!;
                const selected = s.theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`ajustes-theme-card ajustes-theme-card--${id}${selected ? ' is-selected' : ''}`}
                    onClick={() => update('theme', id)}
                    aria-pressed={selected}
                  >
                    <div className="ajustes-theme-card__preview">
                      <div className="ajustes-theme-card__bar" />
                      <div className="ajustes-theme-card__row" />
                      <div
                        className={`ajustes-theme-card__row${id === 'automatico' ? ' ajustes-theme-card__row--dark' : ''}`}
                      />
                      <div className="ajustes-theme-card__accent" />
                    </div>
                    <span className="ajustes-theme-card__label">
                      {selected && <span className="ajustes-theme-card__check">✓</span>}
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="ajustes-screen__hint ios-footnote">
              Automático segue a preferência clara/escura do seu sistema operacional (prefers-color-scheme) e atualiza
              sozinho se você mudar o sistema. O tema agora alcança todos os apps (Dashboard, Música, Rádio, Veículo,
              Trabalho, Clima, Esportes, Radar, Chamadas, Navegação e os apps de lista). A bandeja lateral (dock) e o
              papel de parede da Home mantêm um material escuro translúcido fixo em qualquer tema — reproduz o
              comportamento real do CarPlay visto na referência (a bandeja nunca "clareia" por cima do mapa/app
              aberto); cores de marca (Spotify, logos de caminhão, escudos de clube) também são preservadas.
            </p>
            <IosListGroup
              header="Liquid Glass"
              footer="Controla o desfoque e a opacidade dos cartões flutuantes (Assistente de Voz e banner de Notificações)."
            >
              <div className="ajustes-screen__slider-row">
                <span className="ios-body">Intensidade da transparência</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.glassIntensity}
                  disabled={s.reduceTransparency}
                  onChange={(e) => update('glassIntensity', Number(e.target.value))}
                  className="ajustes-screen__slider"
                />
                <span className="ajustes-screen__slider-value ios-subheadline">{s.glassIntensity}%</span>
              </div>
              {s.reduceTransparency && (
                <p className="ajustes-screen__hint ios-footnote">
                  Desativado porque "Reduzir transparência" está ativo (ver Acessibilidade).
                </p>
              )}
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
            <IosListGroup footer="Toca um bipe curto gerado pelo próprio app (Web Audio) no volume configurado acima — não é um arquivo de áudio baixado.">
              <IosListRow label="Testar som" chevron onClick={() => playNotificationBeep(s.masterVolume)} />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'voz' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Siri e Voz</h2>
            <IosListGroup footer="Atalho: Ctrl+Alt+V. Não é a Siri oficial nem usa SiriKit — é a interface própria do NeoBladeConnectOS, inspirada visualmente no efeito do Apple Intelligence/Siri. Nenhuma ligação telefônica real é feita ou recebida.">
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
              <div className="ajustes-screen__slider-row">
                <span className="ios-body">Velocidade da fala</span>
                <input
                  type="range"
                  min={70}
                  max={130}
                  value={Math.round(s.assistantSpeechRate * 100)}
                  onChange={(e) => update('assistantSpeechRate', Number(e.target.value) / 100)}
                  className="ajustes-screen__slider"
                />
                <span className="ajustes-screen__slider-value ios-subheadline">{s.assistantSpeechRate.toFixed(2)}x</span>
              </div>
            </IosListGroup>
            <IosListGroup
              header="Aparência do assistente"
              footer="Intensidade do brilho nas bordas e por quanto tempo o cartão de transcrição/resposta fica visível antes de desaparecer."
            >
              <div className="ajustes-screen__slider-row">
                <span className="ios-body">Intensidade do brilho</span>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={s.assistantGlowIntensity}
                  onChange={(e) => update('assistantGlowIntensity', Number(e.target.value))}
                  className="ajustes-screen__slider"
                />
                <span className="ajustes-screen__slider-value ios-subheadline">{s.assistantGlowIntensity}%</span>
              </div>
              <div className="ajustes-screen__slider-row">
                <span className="ios-body">Duração do cartão</span>
                <input
                  type="range"
                  min={1200}
                  max={5000}
                  step={200}
                  value={s.assistantCardDurationMs}
                  onChange={(e) => update('assistantCardDurationMs', Number(e.target.value))}
                  className="ajustes-screen__slider"
                />
                <span className="ajustes-screen__slider-value ios-subheadline">
                  {(s.assistantCardDurationMs / 1000).toFixed(1)}s
                </span>
              </div>
            </IosListGroup>
            <IosListGroup
              header="Vozes"
              footer='Vozes locais/nuvem são integrações auxiliares opcionais — nenhuma foi baixada ou instalada nesta build. "Não instalado" é o estado honesto, não um botão de instalar que finge funcionar.'
            >
              <IosListRow
                label="Navegador (Web Speech)"
                value={
                  webSpeechStatus === null
                    ? 'Verificando…'
                    : webSpeechStatus.installed
                      ? 'Ativo'
                      : 'Indisponível'
                }
              />
              {VOICE_PROVIDER_CATALOG.map((p) => (
                <IosListRow key={p.id} label={p.label} value="Não instalado" disabled />
              ))}
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'notificacoes' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Notificações</h2>
            <IosListGroup footer="O aviso sonoro usa as preferências de Sons e Áudio.">
              <IosListRow label="Badges nos ícones" value="Ativado" />
              <IosListRow label="Banner sobre outros apps" value="Ativado" />
              <div className="ajustes-screen__slider-row">
                <span className="ios-body">Tempo de permanência do banner</span>
                <input
                  type="range"
                  min={1500}
                  max={8000}
                  step={500}
                  value={s.notificationBannerDurationMs}
                  onChange={(e) => update('notificationBannerDurationMs', Number(e.target.value))}
                  className="ajustes-screen__slider"
                />
                <span className="ajustes-screen__slider-value ios-subheadline">
                  {(s.notificationBannerDurationMs / 1000).toFixed(1)}s
                </span>
              </div>
            </IosListGroup>
            <IosListGroup footer='Abra o app Notificações para marcar como lida, apagar ou simular uma nova notificação de teste.'>
              <IosListRow label="Gerenciar notificações" chevron onClick={onOpenNotificacoes} />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'acessibilidade' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Acessibilidade</h2>
            <IosListGroup header="Movimento" footer="Reduz/desativa animações e transições em todo o app, além da preferência do sistema operacional.">
              <IosListRow
                label="Reduzir movimento"
                trailing={<IosToggle checked={s.reduceMotion} onChange={(v) => update('reduceMotion', v)} />}
              />
            </IosListGroup>
            <IosListGroup header="Visualização" footer="Reduz a transparência dos cartões flutuantes (Siri, Notificações) para um fundo mais sólido e com mais contraste.">
              <IosListRow
                label="Reduzir transparência"
                trailing={<IosToggle checked={s.reduceTransparency} onChange={(v) => update('reduceTransparency', v)} />}
              />
            </IosListGroup>
            <IosListGroup header="Tamanho do texto" footer="Afeta títulos, listas e textos de Ajustes, Mensagens, Notificações, Calendário, Paradas e Diário de Bordo.">
              {TEXT_SIZE_OPTIONS.map((opt) => (
                <IosListRow
                  key={opt.id}
                  label={opt.label}
                  value={s.textSize === opt.id ? '✓' : undefined}
                  onClick={() => update('textSize', opt.id)}
                />
              ))}
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'privacidade' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Privacidade</h2>
            <IosListGroup
              header="Microfone"
              footer="Usado só enquanto o Assistente de Voz está ouvindo ativamente (Ctrl+Alt+V) ou durante o ditado de uma resposta em Mensagens. O áudio nunca é gravado, salvo ou enviado a um servidor — a transcrição acontece no próprio navegador."
            >
              <IosListRow
                label="Testar permissão de microfone"
                value={
                  micStatus === 'checking'
                    ? 'Verificando…'
                    : micStatus === 'granted'
                      ? 'Permitido ✓'
                      : micStatus === 'denied'
                        ? 'Negado'
                        : micStatus === 'unsupported'
                          ? 'Sem suporte'
                          : undefined
                }
                chevron
                onClick={testMicrophone}
              />
            </IosListGroup>
            <IosListGroup footer="Este app não acessa câmera, localização, contatos ou arquivos do dispositivo.">
              <IosListRow label="Câmera" value="Não utilizada" />
              <IosListRow label="Localização" value="Não utilizada" />
            </IosListGroup>
            <IosListGroup
              header="O que sai para a rede"
              footer="A única chamada de rede deste app é para football-data.org (tela Esportes), através de um proxy local que adiciona o token — o navegador nunca vê a chave. Reconhecimento e síntese de voz usam a engine do próprio navegador (processamento local ou do provedor do navegador, conforme o motor instalado); nenhum áudio é enviado para servidores do NeoBladeConnectOS, pois este projeto não tem backend próprio."
            >
              <IosListRow label="Telemetria/analytics" value="Nenhuma" />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'apps' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Home e Apps</h2>
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

        {activeSection?.id === 'sistema' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Sistema</h2>
            <IosListGroup header="Relógio" footer="Afeta o relógio mostrado no dock, em qualquer tela.">
              {CLOCK_FORMAT_OPTIONS.map((opt) => (
                <IosListRow
                  key={opt.id}
                  label={opt.label}
                  value={s.clockFormat === opt.id ? '✓' : undefined}
                  onClick={() => update('clockFormat', opt.id)}
                />
              ))}
            </IosListGroup>
            <IosListGroup footer="Idioma e formatação de data/hora seguem Português (Brasil) em todo o app. Isto não altera o idioma ou o fuso horário do Windows.">
              <IosListRow label="Idioma e formatação" value="Português (Brasil)" />
            </IosListGroup>
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

        {activeSection?.id === 'integracoes' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Integrações</h2>
            <IosListGroup footer="Planejada para uma versão futura — não há conexão real com o ETS2/TruckSimMap nesta build; nenhum dado de telemetria é lido, simulado ou exibido como se fosse real.">
              <IosListRow label="ETS2 / TruckSimMap" value="Em breve" disabled />
            </IosListGroup>
            <IosListGroup footer="football-data.org é a única integração externa real do app (Esportes). O token de acesso fica só no servidor de desenvolvimento (vite.config.ts), nunca no navegador.">
              <IosListRow label="football-data.org (Esportes)" value="Servidor local (proxy)" />
            </IosListGroup>
          </>
        )}

        {activeSection?.id === 'sobre' && (
          <>
            <h2 className="ajustes-screen__detail-title ios-title1">Sobre</h2>
            <IosListGroup>
              <IosListRow label="Versão" value="NeoBladeConnectOS — Fase 9" />
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
