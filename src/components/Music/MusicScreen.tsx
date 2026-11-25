import { useState, type MouseEvent } from 'react';
import albumArt from '../../assets/icons/album-art.png';
import { BackButton } from '../BackButton/BackButton';
import type { MusicPlayerState } from '../../hooks/useMusicPlayerState';
import './MusicScreen.css';

interface MusicScreenProps {
  player: MusicPlayerState;
  onBack: () => void;
}

/**
 * Reproduz de.bilder/music.png (também en/music.png): tela cheia do
 * Spotify mock. "Letra"/"Fila"/"Adicionar à biblioteca" são apenas visuais —
 * sem conteúdo real, ver README. Em vez de ficar silencioso (Fase 8),
 * mostram um aviso honesto na tela em vez de só um console.info.
 * Shuffle/repeat/seek são estados de demonstração.
 */
export function MusicScreen({ player, onBack }: MusicScreenProps) {
  const [unavailableToast, setUnavailableToast] = useState<string | null>(null);
  const showUnavailable = (label: string) => {
    setUnavailableToast(`"${label}" ainda não disponível nesta versão.`);
    window.setTimeout(() => setUnavailableToast(null), 1800);
  };

  const {
    track,
    isPlaying,
    shuffle,
    repeat,
    progress,
    elapsedLabel,
    remainingLabel,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    seek,
    next,
    prev,
  } = player;

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    seek((event.clientX - rect.left) / rect.width);
  };

  return (
    <div className="music-screen">
      <BackButton onClick={onBack} />

      <div className="music-screen__info">
        <h1 className="music-screen__title">{track.title}</h1>
        <p className="music-screen__artist">{track.artist}</p>
        <p className="music-screen__album">{track.album}</p>
      </div>

      <div className="music-screen__aux-actions">
        <button
          type="button"
          className="music-screen__pill"
          onClick={() => showUnavailable('Letra')}
        >
          <span aria-hidden="true">"</span> Letra
        </button>
        <button
          type="button"
          className="music-screen__pill"
          onClick={() => showUnavailable('Fila')}
        >
          Fila
        </button>
      </div>

      <img className="music-screen__art" src={albumArt} alt="" />

      <div className="music-screen__transport">
        <button type="button" aria-label="Faixa anterior" onClick={prev}>
          <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
            <path d="M9 7h4v22H9zM28 7 11 18l17 11z" fill="#fff" />
          </svg>
        </button>
        <button
          type="button"
          className="music-screen__play"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <svg viewBox="0 0 36 36" width="30" height="30" aria-hidden="true">
              <rect x="9" y="6" width="7" height="24" rx="1.5" fill="#fff" />
              <rect x="20" y="6" width="7" height="24" rx="1.5" fill="#fff" />
            </svg>
          ) : (
            <svg viewBox="0 0 36 36" width="30" height="30" aria-hidden="true">
              <path d="M10 6v24l20-12z" fill="#fff" />
            </svg>
          )}
        </button>
        <button type="button" aria-label="Próxima faixa" onClick={next}>
          <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
            <path d="M23 7h4v22h-4zM8 7l17 11-17 11z" fill="#fff" />
          </svg>
        </button>
      </div>

      <div className="music-screen__seek-row">
        <span>{elapsedLabel}</span>
        <div className="music-screen__seek-track" onClick={handleSeek}>
          <div className="music-screen__seek-fill" style={{ width: `${progress * 100}%` }} />
          <div className="music-screen__seek-thumb" style={{ left: `${progress * 100}%` }} />
        </div>
        <span>{remainingLabel}</span>
      </div>

      <div className="music-screen__secondary">
        <button
          type="button"
          aria-label="Adicionar à biblioteca"
          onClick={() => showUnavailable('Adicionar à biblioteca')}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="#fff" strokeWidth="1.6" />
            <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Aleatório"
          aria-pressed={shuffle}
          className={shuffle ? 'is-active' : ''}
          onClick={toggleShuffle}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M3 6h3.5L15 17h3M3 17h3.5L10 12.5M18 6h-3l-1.2 1.6M18 6l-2-2m2 2-2 2M18 17l-2 2m2-2-2-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Repetir"
          aria-pressed={repeat}
          className={repeat ? 'is-active' : ''}
          onClick={toggleRepeat}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 7h13a3 3 0 0 1 3 3v2M20 17H7a3 3 0 0 1-3-3v-2M7 4 4 7l3 3M17 20l3-3-3-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Fila de reprodução"
          onClick={() => showUnavailable('Fila de reprodução')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 6h12M4 12h12M4 18h8M18 9v10m0 0 3-3m-3 3-3-3"
              fill="none"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {unavailableToast && <div className="music-screen__toast">{unavailableToast}</div>}
    </div>
  );
}
