import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Wallpaper } from '../Wallpaper/Wallpaper';
import { Dock } from '../Dock/Dock';
import { HomeScreen } from '../HomeScreen/HomeScreen';
import { DashboardScreen } from '../Dashboard/DashboardScreen';
import { MusicScreen } from '../Music/MusicScreen';
import { RadioScreen } from '../Radio/RadioScreen';
import { useHomeMockState } from '../../hooks/useHomeMockState';
import { useMusicPlayerState } from '../../hooks/useMusicPlayerState';
import type { MainScreen, Screen } from '../../types';
import './Shell.css';

const slideVariants = {
  enter: (direction: number) => ({ x: direction * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -48, opacity: 0 }),
};

export function Shell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [direction, setDirection] = useState(1);
  const player = useMusicPlayerState();

  const openMusic = () => {
    setDirection(1);
    setScreen('music');
  };
  const openRadio = () => {
    setDirection(1);
    setScreen('radio');
  };

  const { badgeCounts, currentTruckBrand, handleOpenApp } = useHomeMockState({
    onOpenMusic: openMusic,
    onOpenRadio: openRadio,
  });

  const backToMain = () => {
    setDirection(-1);
    setScreen(mainScreen);
  };

  // Botão inferior do dock: a partir de Música/Rádio volta direto para a
  // Home; na Home abre o Dashboard; no Dashboard volta para a Home.
  const handleDockButton = () => {
    if (screen === 'music' || screen === 'radio') {
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

  const handleActivateShortcut = (id: string) => {
    if (id === 'dock-spotify') {
      openMusic();
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
          {screen === 'dashboard' && <DashboardScreen player={player} onOpenMusic={openMusic} />}
          {screen === 'music' && <MusicScreen player={player} onBack={backToMain} />}
          {screen === 'radio' && <RadioScreen onBack={backToMain} />}
        </motion.div>
      </AnimatePresence>

      <Dock
        screen={screen}
        onActivateShortcut={handleActivateShortcut}
        onToggleScreen={handleDockButton}
      />
    </div>
  );
}
