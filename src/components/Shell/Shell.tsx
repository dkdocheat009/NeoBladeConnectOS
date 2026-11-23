import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Wallpaper } from '../Wallpaper/Wallpaper';
import { Dock } from '../Dock/Dock';
import { HomeScreen } from '../HomeScreen/HomeScreen';
import { DashboardScreen } from '../Dashboard/DashboardScreen';
import { useHomeMockState } from '../../hooks/useHomeMockState';
import type { Screen } from '../../types';
import './Shell.css';

const slideVariants = {
  enter: (direction: number) => ({ x: direction * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -48, opacity: 0 }),
};

export function Shell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [direction, setDirection] = useState(1);
  const { badgeCounts, currentTruckBrand, handleOpenApp } = useHomeMockState();

  const toggleScreen = () => {
    setDirection(screen === 'home' ? -1 : 1);
    setScreen((current) => (current === 'home' ? 'dashboard' : 'home'));
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
          {screen === 'home' ? (
            <HomeScreen
              badgeCounts={badgeCounts}
              currentTruckBrand={currentTruckBrand}
              onActivateApp={handleOpenApp}
            />
          ) : (
            <DashboardScreen />
          )}
        </motion.div>
      </AnimatePresence>

      <Dock
        screen={screen}
        onActivateShortcut={handleActivateShortcut}
        onToggleScreen={toggleScreen}
      />
    </div>
  );
}
