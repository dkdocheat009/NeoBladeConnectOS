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
import { useHomeMockState } from '../../hooks/useHomeMockState';
import { useMusicPlayerState } from '../../hooks/useMusicPlayerState';
import type { MainScreen, Screen } from '../../types';
import './Shell.css';

const slideVariants = {
  enter: (direction: number) => ({ x: direction * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -48, opacity: 0 }),
};

// Telas "overlay": abrem por cima de Home/Dashboard e voltam para a tela
// principal de onde o usuário veio (ver backToMain / mainScreen).
const OVERLAY_SCREENS: Screen[] = ['music', 'radio', 'veiculo', 'trabalho', 'clima', 'esportes'];

export function Shell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [direction, setDirection] = useState(1);
  const player = useMusicPlayerState();

  const openScreen = (next: Screen) => {
    setDirection(1);
    setScreen(next);
  };

  const { badgeCounts, currentTruckBrand, cycleTruckBrand, handleOpenApp } = useHomeMockState({
    onOpenMusic: () => openScreen('music'),
    onOpenRadio: () => openScreen('radio'),
    onOpenVeiculo: () => openScreen('veiculo'),
    onOpenTrabalho: () => openScreen('trabalho'),
    onOpenEsportes: () => openScreen('esportes'),
  });

  const backToMain = () => {
    setDirection(-1);
    setScreen(mainScreen);
  };

  // Botão inferior do dock: a partir de qualquer tela "overlay" volta
  // direto para a Home; na Home abre o Dashboard; no Dashboard volta para
  // a Home.
  const handleDockButton = () => {
    if (OVERLAY_SCREENS.includes(screen)) {
      setDirection(-1);
      setMainScreen('home');
      setScreen('home');
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
      openScreen(next);
    }
  };

  const handleActivateShortcut = (id: string) => {
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
          {screen === 'dashboard' && <DashboardScreen player={player} onOpenMusic={() => openScreen('music')} />}
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
        </motion.div>
      </AnimatePresence>

      <Dock
        screen={screen}
        currentTruckBrand={currentTruckBrand}
        onOpenScreen={handleOpenScreen}
        onActivateShortcut={handleActivateShortcut}
        onToggleScreen={handleDockButton}
      />
    </div>
  );
}
