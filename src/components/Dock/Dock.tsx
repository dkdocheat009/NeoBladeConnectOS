import { motion } from 'motion/react';
import { StatusBar } from '../StatusBar/StatusBar';
import dockMaps from '../../assets/icons/dock-maps.png';
import dockSpotify from '../../assets/icons/dock-spotify.png';
import dockSettings from '../../assets/icons/dock-settings.png';
import dockWeather from '../../assets/icons/dock-weather.png';
import './Dock.css';

const DOCK_SHORTCUTS = [
  { id: 'dock-maps', icon: dockMaps, label: 'Google Maps' },
  { id: 'dock-spotify', icon: dockSpotify, label: 'Spotify' },
  { id: 'dock-settings', icon: dockSettings, label: 'Einstellungen' },
  { id: 'dock-weather', icon: dockWeather, label: 'Wetter' },
];

const SHORTCUT_TOPS = [231, 303, 375, 447];

interface DockProps {
  onActivateShortcut: (id: string) => void;
  onHome: () => void;
}

export function Dock({ onActivateShortcut, onHome }: DockProps) {
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
        aria-label="Home"
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={onHome}
      >
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
      </motion.button>
    </div>
  );
}
