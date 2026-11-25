import albumArt from '../../assets/icons/album-art.png';
import type { MusicPlayerState } from '../../hooks/useMusicPlayerState';
import './MusicCard.css';

interface MusicCardProps {
  player: MusicPlayerState;
  onOpenMusic: () => void;
}

/**
 * Mock music player card — dados demonstrativos, sem player real. Reflete
 * o mesmo estado (faixa/play/progresso) da tela Música em tela cheia.
 */
export function MusicCard({ player, onOpenMusic }: MusicCardProps) {
  const { track, isPlaying, progress, prev, next, togglePlay } = player;

  return (
    <div
      role="button"
      tabIndex={0}
      className="music-card"
      onClick={onOpenMusic}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpenMusic();
      }}
      aria-label="Abrir Música"
    >
      <img className="music-card__art" src={albumArt} alt="" />
      <span className="music-card__title">{track.title}</span>
      <span className="music-card__artist">{track.artist}</span>

      <div className="music-card__progress">
        <div className="music-card__progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="music-card__controls">
        <button
          type="button"
          aria-label="Faixa anterior"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 5h2.4v14H6zM19 5 9 12l10 7z" style={{ fill: 'var(--music-text)' }} />
          </svg>
        </button>
        <button
          type="button"
          className="music-card__play"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect x="6" y="5" width="4.5" height="14" rx="1" style={{ fill: 'var(--music-text)' }} />
              <rect x="13.5" y="5" width="4.5" height="14" rx="1" style={{ fill: 'var(--music-text)' }} />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M7 5v14l12-7z" style={{ fill: 'var(--music-text)' }} />
            </svg>
          )}
        </button>
        <button
          type="button"
          aria-label="Próxima faixa"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M15.6 5H18v14h-2.4zM5 5l10 7-10 7z" style={{ fill: 'var(--music-text)' }} />
          </svg>
        </button>
      </div>
    </div>
  );
}
