import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Wallpaper } from '../Wallpaper/Wallpaper';
import { Dock } from '../Dock/Dock';
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
import { VoiceAssistantOverlay } from '../VoiceAssistant/VoiceAssistantOverlay';
import { VoiceAssistantButton } from '../VoiceAssistant/VoiceAssistantButton';
import { useHomeMockState } from '../../hooks/useHomeMockState';
import { useMusicPlayerState } from '../../hooks/useMusicPlayerState';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useIncomingCall } from '../../hooks/useIncomingCall';
import { useMessagesState } from '../../hooks/useMessagesState';
import { useNotificationsState } from '../../hooks/useNotificationsState';
import { useSettingsState } from '../../hooks/useSettingsState';
import type { MainScreen, Screen } from '../../types';
import './Shell.css';

const slideVariants = {
  enter: (direction: number) => ({ x: direction * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -48, opacity: 0 }),
};

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
];

export function Shell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [direction, setDirection] = useState(1);
  const player = useMusicPlayerState();
  const call = useIncomingCall();
  const messages = useMessagesState();
  const settings = useSettingsState();
  const notifications = useNotificationsState({
    soundEnabled: settings.settings.notificationSound,
    volume: settings.settings.masterVolume,
  });

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

  // Botão inferior do dock: a partir de qualquer tela "overlay" volta
  // direto para a Home; na Home abre o Dashboard; no Dashboard volta para
  // a Home.
  const handleDockButton = () => {
    if (OVERLAY_SCREENS.includes(screen)) {
      goHome();
      return;
    }
    const next: MainScreen = screen === 'home' ? 'dashboard' : 'home';
    setDirection(screen === 'home' ? -1 : 1);
    setMainScreen(next);
    setScreen(next);
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

      <AnimatePresence mode="wait" custom={direction} initial={false}>
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
          {screen === 'home' && (
            <HomeScreen
              badgeCounts={badgeCounts}
              currentTruckBrand={currentTruckBrand}
              onActivateApp={handleOpenApp}
            />
          )}
          {screen === 'dashboard' && <DashboardScreen player={player} onOpenMusic={() => navigateTo('music')} />}
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
              initialTheme={settings.settings.theme}
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
          {screen === 'configuracoes' && <ConfiguracoesScreen onBack={backToMain} settings={settings} />}
        </motion.div>
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
