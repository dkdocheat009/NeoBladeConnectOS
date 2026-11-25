import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Wallpaper } from '../Wallpaper/Wallpaper';
import { Dock } from '../Dock/Dock';
import { MainCarousel } from '../MainCarousel/MainCarousel';
import { HomeScreen } from '../HomeScreen/HomeScreen';
import { DashboardScreen } from '../Dashboard/DashboardScreen';
import { MusicScreen } from '../Music/MusicScreen';
import { RadioScreen } from '../Radio/RadioScreen';
import { VeiculoScreen } from '../Veiculo/VeiculoScreen';
import { TrabalhoScreen } from '../Trabalho/TrabalhoScreen';
import { ClimaScreen } from '../Clima/ClimaScreen';
import { EsportesScreen } from '../Esportes/EsportesScreen';
import { NavegacaoScreen } from '../Navegacao/NavegacaoScreen';
import { ChamadasOverlay } from '../Chamadas/ChamadasOverlay';
import { RadarScreen } from '../Radar/RadarScreen';
import { MensagensScreen } from '../Mensagens/MensagensScreen';
import { NotificacoesScreen } from '../Notificacoes/NotificacoesScreen';
import { NotificationBanner } from '../Notificacoes/NotificationBanner';
import { CalendarioScreen } from '../Calendario/CalendarioScreen';
import { ConfiguracoesScreen } from '../Configuracoes/ConfiguracoesScreen';
import { ParadasScreen } from '../Paradas/ParadasScreen';
import { DiarioDeBordoScreen } from '../DiarioDeBordo/DiarioDeBordoScreen';
import { VoiceAssistantOverlay } from '../VoiceAssistant/VoiceAssistantOverlay';
import { VoiceAssistantButton } from '../VoiceAssistant/VoiceAssistantButton';
import { useHomeMockState } from '../../hooks/useHomeMockState';
import { useMusicPlayerState } from '../../hooks/useMusicPlayerState';
import { useNavDemoState } from '../../hooks/useNavDemoState';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useIncomingCall } from '../../hooks/useIncomingCall';
import { useMessagesState } from '../../hooks/useMessagesState';
import { useNotificationsState } from '../../hooks/useNotificationsState';
import { useSettingsState } from '../../hooks/useSettingsState';
import { useRemovedApps } from '../../hooks/useRemovedApps';
import { homeApps } from '../../data/apps';
import type { MainScreen, Screen } from '../../types';
import './Shell.css';

const slideVariants = {
  enter: (direction: number) => ({ x: direction * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -48, opacity: 0 }),
};

const HOME_PAGE_SIZE = 10;

// Telas "overlay": abrem por cima de Home/Dashboard e voltam para a tela
// principal de onde o usuário veio (ver backToMain / mainScreen).
const OVERLAY_SCREENS: Screen[] = [
  'music',
  'radio',
  'veiculo',
  'trabalho',
  'clima',
  'esportes',
  'navegacao',
  'radar',
  'mensagens',
  'notificacoes',
  'calendario',
  'configuracoes',
  'paradas',
  'diario',
];

export function Shell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [direction, setDirection] = useState(1);
  const [editing, setEditing] = useState(false);
  const [homePage, setHomePage] = useState(0);
  const player = useMusicPlayerState();
  const call = useIncomingCall();
  const nav = useNavDemoState();
  const messages = useMessagesState();
  const settings = useSettingsState();
  const removedApps = useRemovedApps();
  const notifications = useNotificationsState({
    soundEnabled: settings.settings.notificationSound,
    volume: settings.settings.masterVolume,
  });

  // Fase 8: a Home virou um carrossel real (Dashboard + páginas de
  // aplicativos) em vez de uma única grade de 3 linhas — mais fiel a
  // home.png (2 linhas por página) e ao pedido de paginação funcional.
  // Nenhuma página vazia é criada: o número de páginas acompanha a
  // quantidade de atalhos visíveis.
  const visibleApps = useMemo(() => homeApps.filter((app) => !removedApps.removedIds.includes(app.id)), [
    removedApps.removedIds,
  ]);
  const homePagesApps = useMemo(() => {
    const pages = [];
    for (let i = 0; i < visibleApps.length; i += HOME_PAGE_SIZE) {
      pages.push(visibleApps.slice(i, i + HOME_PAGE_SIZE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [visibleApps]);

  useEffect(() => {
    setHomePage((p) => Math.min(p, homePagesApps.length - 1));
  }, [homePagesApps.length]);

  const navigateTo = (next: Screen) => {
    setDirection(1);
    if (next === 'home' || next === 'dashboard') setMainScreen(next);
    setScreen(next);
  };

  const goHome = () => {
    setDirection(-1);
    setMainScreen('home');
    setScreen('home');
  };

  const { currentTruckBrand, cycleTruckBrand, handleOpenApp } = useHomeMockState({
    onOpenMusic: () => navigateTo('music'),
    onOpenRadio: () => navigateTo('radio'),
    onOpenVeiculo: () => navigateTo('veiculo'),
    onOpenTrabalho: () => navigateTo('trabalho'),
    onOpenEsportes: () => navigateTo('esportes'),
    onOpenNavegacao: () => navigateTo('navegacao'),
    onOpenMensagens: () => navigateTo('mensagens'),
    onOpenNotificacoes: () => navigateTo('notificacoes'),
    onOpenCalendario: () => navigateTo('calendario'),
    onOpenParadas: () => navigateTo('paradas'),
    onOpenDiario: () => navigateTo('diario'),
  });

  const badgeCounts: Record<string, number> = {
    nachrichten: messages.unreadCount,
    mitteilungen: notifications.unreadCount,
  };

  const backToNavegacao = () => {
    setDirection(-1);
    setScreen('navegacao');
  };

  const voiceAssistant = useVoiceAssistant(
    {
      onOpenScreen: navigateTo,
      onGoHome: goHome,
      musicPlay: player.play,
      musicPause: player.pause,
    },
    { enabled: settings.settings.assistantEnabled },
  );

  const backToMain = () => {
    setDirection(-1);
    setScreen(mainScreen);
  };

  const isMainScreenActive = screen === 'home' || screen === 'dashboard';
  const carouselPosition = screen === 'dashboard' ? 0 : 1 + homePage;

  // Troca de posição no carrossel (arraste, clique nos indicadores ou
  // setas do teclado) — mantém `screen`/`mainScreen` como fonte da
  // verdade para o resto do Shell (dock, Siri "ir para a Home", etc.).
  const handleCarouselPosition = (next: number) => {
    if (next === 0) {
      setMainScreen('dashboard');
      setScreen('dashboard');
      setEditing(false);
    } else {
      setMainScreen('home');
      setScreen('home');
      setHomePage(Math.min(next - 1, homePagesApps.length - 1));
    }
  };

  // Botão inferior do dock: a partir de qualquer tela "overlay" volta
  // direto para a Home; na Home abre o Dashboard; no Dashboard volta para
  // a Home (preserva a página de apps em que o usuário estava).
  const handleDockButton = () => {
    if (OVERLAY_SCREENS.includes(screen)) {
      goHome();
      return;
    }
    const next: MainScreen = screen === 'home' ? 'dashboard' : 'home';
    setMainScreen(next);
    setScreen(next);
    if (next === 'dashboard') setEditing(false);
  };

  // Navegação genérica usada pelo dock (slot do Spotify e slot contextual
  // 4, que abre Clima por padrão ou o app atualmente aberto).
  const handleOpenScreen = (next: Screen) => {
    if (OVERLAY_SCREENS.includes(next)) {
      navigateTo(next);
    }
  };

  const handleActivateShortcut = (id: string) => {
    if (id === 'dock-maps') {
      navigateTo('navegacao');
      return;
    }
    if (id === 'dock-settings') {
      navigateTo('configuracoes');
      return;
    }
    console.info(`[NeoBladeConnectOS] atalho "${id}" ainda não implementado.`);
  };

  return (
    <div className="shell">
      <Wallpaper />

      <div className={`shell__main${isMainScreenActive ? '' : ' is-hidden'}`}>
        <MainCarousel
          position={carouselPosition}
          totalHomePages={homePagesApps.length}
          onChangePosition={handleCarouselPosition}
          editing={editing}
          onExitEditing={() => setEditing(false)}
          removedCount={removedApps.removedIds.length}
          onRestoreAll={removedApps.restoreAll}
          dashboard={
            <DashboardScreen
              player={player}
              onOpenMusic={() => navigateTo('music')}
              nav={nav}
              onOpenNavegacao={() => navigateTo('navegacao')}
            />
          }
          homePages={homePagesApps.map((apps, i) => (
            <HomeScreen
              key={i}
              apps={apps}
              editing={editing}
              onExitEditing={() => setEditing(false)}
              badgeCounts={badgeCounts}
              currentTruckBrand={currentTruckBrand}
              onActivateApp={handleOpenApp}
              onLongPress={() => setEditing(true)}
              onRemoveApp={removedApps.removeApp}
            />
          ))}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {!isMainScreenActive && (
          <motion.div
            key={screen}
            className="shell__content"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: 'easeInOut' }}
          >
            {screen === 'music' && <MusicScreen player={player} onBack={backToMain} />}
            {screen === 'radio' && <RadioScreen onBack={backToMain} />}
            {screen === 'veiculo' && (
              <VeiculoScreen
                onBack={backToMain}
                currentTruckBrand={currentTruckBrand}
                onCycleBrand={cycleTruckBrand}
              />
            )}
            {screen === 'trabalho' && <TrabalhoScreen onBack={backToMain} />}
            {screen === 'clima' && <ClimaScreen onBack={backToMain} />}
            {screen === 'esportes' && <EsportesScreen onBack={backToMain} />}
            {screen === 'navegacao' && (
              <NavegacaoScreen
                onBack={backToMain}
                onOpenRadar={() => navigateTo('radar')}
                call={call}
                initialTheme={settings.effectiveTheme}
                nav={nav}
              />
            )}
            {screen === 'radar' && <RadarScreen onBack={backToNavegacao} />}
            {screen === 'mensagens' && (
              <MensagensScreen onBack={backToMain} messages={messages} onActivateVoice={voiceAssistant.activate} />
            )}
            {screen === 'notificacoes' && <NotificacoesScreen onBack={backToMain} notifications={notifications} />}
            {screen === 'calendario' && (
              <CalendarioScreen onBack={backToMain} onDemoNavigate={() => navigateTo('navegacao')} />
            )}
            {screen === 'configuracoes' && (
              <ConfiguracoesScreen
                onBack={backToMain}
                settings={settings}
                onOpenNotificacoes={() => navigateTo('notificacoes')}
              />
            )}
            {screen === 'paradas' && <ParadasScreen onBack={backToMain} />}
            {screen === 'diario' && <DiarioDeBordoScreen onBack={backToMain} />}
          </motion.div>
        )}
      </AnimatePresence>

      <Dock
        screen={screen}
        currentTruckBrand={currentTruckBrand}
        onOpenScreen={handleOpenScreen}
        onActivateShortcut={handleActivateShortcut}
        onToggleScreen={handleDockButton}
      />

      <ChamadasOverlay call={call} />
      <NotificationBanner notifications={notifications} onOpen={() => navigateTo('notificacoes')} />
      <VoiceAssistantOverlay assistant={voiceAssistant} showTranscript={settings.settings.assistantShowTranscript} />
      {settings.settings.assistantEnabled && (
        <VoiceAssistantButton onClick={voiceAssistant.activate} active={voiceAssistant.isActive} />
      )}
    </div>
  );
}
