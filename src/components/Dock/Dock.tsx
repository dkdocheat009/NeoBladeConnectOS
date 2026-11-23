import { motion } from 'motion/react';
import { StatusBar } from '../StatusBar/StatusBar';
import dockMaps from '../../assets/icons/dock-maps.png';
import dockSpotify from '../../assets/icons/dock-spotify.png';
import dockSettings from '../../assets/icons/dock-settings.png';
import dockWeather from '../../assets/icons/dock-weather.png';
import type { Screen } from '../../types';
import './Dock.css';

const DOCK_SHORTCUTS = [
  { id: 'dock-maps', icon: dockMaps, label: 'Google Maps' },
  { id: 'dock-spotify', icon: dockSpotify, label: 'Spotify' },
  { id: 'dock-settings', icon: dockSettings, label: 'Einstellungen' },
  { id: 'dock-weather', icon: dockWeather, label: 'Wetter' },
];

const SHORTCUT_TOPS = [231, 303, 375, 447];

interface DockProps {
  screen: Screen;
  onActivateShortcut: (id: string) => void;
  onToggleScreen: () => void;
}

export function Dock({ screen, onActivateShortcut, onToggleScreen }: DockProps) {
  return (
    <div className="dock">
      <StatusBar />

      {DOCK_SHORTCUTS.map((shortcut, index) => (
        <motion.button
          key={shortcut.id}
          type="button"
          className="dock__shortcut"
          style={{ top: SHORTCUT_TOPS[index] }}
          aria-label={shortcut.label}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          onClick={() => onActivateShortcut(shortcut.id)}
        >
          <img src={shortcut.icon} alt={shortcut.label} draggable={false} />
        </motion.button>
      ))}

      <motion.button
        type="button"
        className="dock__home"
        aria-label={screen === 'home' ? 'Abrir Dashboard' : 'Abrir Home'}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={onToggleScreen}
      >
        {screen === 'home' ? (
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <rect
              x="1.5"
              y="1.5"
              width="17"
              height="17"
              rx="5.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            {[0, 1, 2].flatMap((row) =>
              [0, 1, 2].map((col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={3 + col * 7}
                  cy={3 + row * 7}
                  r="1.8"
                  fill="#ffffff"
                />
              )),
            )}
          </svg>
        )}
      </motion.button>
    </div>
  );
}
