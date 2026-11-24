import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { StatusBar } from '../StatusBar/StatusBar';
import { BrandLogoGlyph } from '../AppIcon/BrandLogoGlyph';
import { EsportesGlyph } from '../AppIcon/EsportesGlyph';
import { RadarGlyph } from '../AppIcon/RadarGlyph';
import dockMaps from '../../assets/icons/dock-maps.png';
import dockSpotify from '../../assets/icons/dock-spotify.png';
import dockSettings from '../../assets/icons/dock-settings.png';
import dockWeather from '../../assets/icons/dock-weather.png';
import radioIcon from '../../assets/icons/radio.png';
import auftragIcon from '../../assets/icons/auftrag.png';
import type { Screen } from '../../types';
import type { TruckBrand } from '../../data/truckBrands';
import './Dock.css';

const SHORTCUT_TOPS = [231, 303, 375, 447];

// Apps que, quando abertos, assumem o 4º slot (contextual) do dock em vez
// do Clima padrão — reproduz o comportamento visto nas referências
// (fahrzeug.png, de/job.png, de/sports.png): o dock sempre mostra 4
// ícones, e o 4º reflete o app atualmente aberto, com um ponto indicador.
const CONTEXTUAL_SCREENS: Screen[] = ['radio', 'veiculo', 'trabalho', 'esportes', 'radar'];

interface DockProps {
  screen: Screen;
  currentTruckBrand: TruckBrand;
  onOpenScreen: (screen: Screen) => void;
  onActivateShortcut: (id: string) => void;
  onToggleScreen: () => void;
}

export function Dock({
  screen,
  currentTruckBrand,
  onOpenScreen,
  onActivateShortcut,
  onToggleScreen,
}: DockProps) {
  const isContextual = CONTEXTUAL_SCREENS.includes(screen);
  const slot4Target: Screen = isContextual ? screen : 'clima';
  const slot4Active = isContextual || screen === 'clima';
  const slot1Active = screen === 'navegacao';
  const slot2Active = screen === 'music';
  const slot3Active = screen === 'configuracoes';

  let slot4Content: ReactNode;
  let slot4Label = 'Clima';
  if (screen === 'radio') {
    slot4Content = <img src={radioIcon} alt="" draggable={false} />;
    slot4Label = 'Rádio';
  } else if (screen === 'veiculo') {
    slot4Content = <BrandLogoGlyph brand={currentTruckBrand} size={61} />;
    slot4Label = 'Veículo';
  } else if (screen === 'trabalho') {
    slot4Content = <img src={auftragIcon} alt="" draggable={false} />;
    slot4Label = 'Trabalho';
  } else if (screen === 'esportes') {
    slot4Content = <EsportesGlyph size={61} />;
    slot4Label = 'Esportes';
  } else if (screen === 'radar') {
    slot4Content = <RadarGlyph size={61} />;
    slot4Label = 'Radar';
  } else {
    slot4Content = <img src={dockWeather} alt="" draggable={false} />;
  }

  return (
    <div className="dock">
      <StatusBar />

      <motion.button
        type="button"
        className="dock__shortcut"
        style={{ top: SHORTCUT_TOPS[0] }}
        aria-label="Google Maps"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={() => onActivateShortcut('dock-maps')}
      >
        <img src={dockMaps} alt="" draggable={false} />
      </motion.button>
      {slot1Active && <span className="dock__dot" style={{ top: SHORTCUT_TOPS[0] + 30 }} />}

      <motion.button
        type="button"
        className="dock__shortcut"
        style={{ top: SHORTCUT_TOPS[1] }}
        aria-label="Spotify"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={() => onOpenScreen('music')}
      >
        <img src={dockSpotify} alt="" draggable={false} />
      </motion.button>
      {slot2Active && <span className="dock__dot" style={{ top: SHORTCUT_TOPS[1] + 30 }} />}

      <motion.button
        type="button"
        className="dock__shortcut"
        style={{ top: SHORTCUT_TOPS[2] }}
        aria-label="Ajustes"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={() => onActivateShortcut('dock-settings')}
      >
        <img src={dockSettings} alt="" draggable={false} />
      </motion.button>
      {slot3Active && <span className="dock__dot" style={{ top: SHORTCUT_TOPS[2] + 30 }} />}

      <motion.button
        type="button"
        className="dock__shortcut"
        style={{ top: SHORTCUT_TOPS[3] }}
        aria-label={slot4Label}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={() => onOpenScreen(slot4Target)}
      >
        {slot4Content}
      </motion.button>
      {slot4Active && <span className="dock__dot" style={{ top: SHORTCUT_TOPS[3] + 30 }} />}

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
