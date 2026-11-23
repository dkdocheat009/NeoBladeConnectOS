import { useState } from 'react';
import albumArt from '../../assets/icons/album-art.png';
import './MusicCard.css';

interface Track {
  title: string;
  artist: string;
  progress: number;
}

const MOCK_PLAYLIST: Track[] = [
  { title: 'Highway Nights', artist: 'The Long Haulers', progress: 0.38 },
  { title: 'Diesel & Dust', artist: 'Roadbound', progress: 0.12 },
  { title: 'Midnight Convoy', artist: 'The Long Haulers', progress: 0.64 },
];

/** Mock music player card — dados demonstrativos, sem player real. */
export function MusicCard() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const track = MOCK_PLAYLIST[trackIndex];
  const changeTrack = (delta: number) => {
    setTrackIndex((index) => (index + delta + MOCK_PLAYLIST.length) % MOCK_PLAYLIST.length);
  };

  return (
    <div className="music-card">
      <img className="music-card__art" src={albumArt} alt="" />
      <span className="music-card__title">{track.title}</span>
      <span className="music-card__artist">{track.artist}</span>

      <div className="music-card__progress">
        <div className="music-card__progress-fill" style={{ width: `${track.progress * 100}%` }} />
      </div>

      <div className="music-card__controls">
        <button type="button" aria-label="Faixa anterior" onClick={() => changeTrack(-1)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 5h2.4v14H6zM19 5 9 12l10 7z" fill="#fff" />
          </svg>
        </button>
        <button
          type="button"
          className="music-card__play"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          onClick={() => setIsPlaying((p) => !p)}
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
        <button type="button" aria-label="Próxima faixa" onClick={() => changeTrack(1)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M15.6 5H18v14h-2.4zM5 5l10 7-10 7z" fill="#fff" />
          </svg>
        </button>
      </div>
    </div>
  );
}
