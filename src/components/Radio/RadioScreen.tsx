import { useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { StationLogo } from './StationLogo';
import { radioCategories, radioStations } from '../../data/radioStations';
import './RadioScreen.css';

interface RadioScreenProps {
  onBack: () => void;
}

/**
 * Reproduz de.bilder/radio.png (também en/radio.png). Estações, categorias
 * e volume são 100% mock/demo — sem emissoras reais, API, streaming ou
 * dados ETS2/ATS reais, conforme a tarefa da fase.
 */
export function RadioScreen({ onBack }: RadioScreenProps) {
  const [categoryId, setCategoryId] = useState('de');
  const [stationId, setStationId] = useState<string | null>('radio-eins');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  const stationsInCategory = radioStations.filter((s) => s.categoryId === categoryId);
  const currentStation = radioStations.find((s) => s.id === stationId) ?? null;

  const selectStation = (id: string) => {
    setStationId(id);
    setIsPlaying(true);
  };

  const changeStation = (delta: number) => {
    if (!currentStation) return;
    const list = radioStations.filter((s) => s.categoryId === currentStation.categoryId);
    const index = list.findIndex((s) => s.id === currentStation.id);
    const next = list[(index + delta + list.length) % list.length];
    selectStation(next.id);
  };

  return (
    <div className="radio-screen">
      <BackButton onClick={onBack} />

      <div className="radio-screen__player">
        {currentStation ? (
          <div className="radio-screen__art" style={{ background: currentStation.color }}>
            <span>{currentStation.initials}</span>
          </div>
        ) : (
          <div className="radio-screen__art radio-screen__art--empty">
            <span>Selecione uma estação</span>
          </div>
        )}

        <div className="radio-screen__status-row">
          <span className="radio-screen__tag">FM</span>
          <span className="radio-screen__status">
            {currentStation ? (isPlaying ? 'Tocando' : 'Pausado') : '—'}
          </span>
        </div>

        <h1 className="radio-screen__name">{currentStation?.name ?? 'Nenhuma estação'}</h1>
        <p className="radio-screen__hint">
          {currentStation ? 'Toque para reproduzir' : 'Escolha uma estação na lista'}
        </p>

        <div className="radio-screen__transport">
          <button type="button" aria-label="Estação anterior" onClick={() => changeStation(-1)} disabled={!currentStation}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M6 5h2.4v14H6zM19 5 9 12l10 7z" style={{ fill: 'var(--radio-text)' }} />
            </svg>
          </button>
          <button
            type="button"
            className="radio-screen__play"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            onClick={() => setIsPlaying((p) => !p)}
            disabled={!currentStation}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <rect x="6" y="5" width="4.5" height="14" rx="1" fill="#fff" />
                <rect x="13.5" y="5" width="4.5" height="14" rx="1" fill="#fff" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M7 5v14l12-7z" fill="#fff" />
              </svg>
            )}
          </button>
          <button type="button" aria-label="Próxima estação" onClick={() => changeStation(1)} disabled={!currentStation}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M15.6 5H18v14h-2.4zM5 5l10 7-10 7z" style={{ fill: 'var(--radio-text)' }} />
            </svg>
          </button>
        </div>

        <div className="radio-screen__volume">
          <button
            type="button"
            aria-label="Diminuir volume"
            onClick={() => setVolume((v) => Math.max(0, v - 10))}
          >
            −
          </button>
          <div className="radio-screen__volume-track">
            <div className="radio-screen__volume-fill" style={{ width: `${volume}%` }} />
          </div>
          <button
            type="button"
            aria-label="Aumentar volume"
            onClick={() => setVolume((v) => Math.min(100, v + 10))}
          >
            +
          </button>
          <span className="radio-screen__volume-value">{volume}%</span>
        </div>
      </div>

      <div className="radio-screen__browser">
        <div className="radio-screen__tabs">
          {radioCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`radio-screen__tab${cat.id === categoryId ? ' is-active' : ''}`}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="radio-screen__list">
          {stationsInCategory.length === 0 && (
            <p className="radio-screen__empty">Nenhuma estação salva ainda.</p>
          )}
          {stationsInCategory.map((station) => (
            <button
              key={station.id}
              type="button"
              className={`radio-screen__row${station.id === stationId ? ' is-active' : ''}`}
              onClick={() => selectStation(station.id)}
            >
              <StationLogo station={station} />
              <span className="radio-screen__row-name">{station.name}</span>
              {station.id === stationId && isPlaying && (
                <span className="radio-screen__row-live">Tocando</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
