import { useEffect, useState } from 'react';

export interface Track {
  title: string;
  artist: string;
  album: string;
  durationSec: number;
}

export const MOCK_PLAYLIST: Track[] = [
  { title: 'Highway Nights', artist: 'The Long Haulers', album: 'Autobahn Sessions', durationSec: 204 },
  { title: 'Diesel & Dust', artist: 'Roadbound', album: 'Diesel & Dust', durationSec: 187 },
  { title: 'Midnight Convoy', artist: 'The Long Haulers', album: 'Autobahn Sessions', durationSec: 231 },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Mock/demo player state shared between the Dashboard music card and the
 * full Música screen, so both reflect the same track/estado — sem API do
 * Spotify, sem stream real nesta fase.
 */
export function useMusicPlayerState() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [progress, setProgress] = useState(0.32); // 0..1, mock

  const track = MOCK_PLAYLIST[trackIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setProgress((p) => (p + 1 / track.durationSec >= 1 ? 0 : p + 1 / track.durationSec));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, track.durationSec]);

  const next = () => {
    setTrackIndex((i) => (i + 1) % MOCK_PLAYLIST.length);
    setProgress(0);
  };
  const prev = () => {
    setTrackIndex((i) => (i - 1 + MOCK_PLAYLIST.length) % MOCK_PLAYLIST.length);
    setProgress(0);
  };

  return {
    track,
    isPlaying,
    shuffle,
    repeat,
    progress,
    elapsedLabel: formatTime(progress * track.durationSec),
    remainingLabel: `-${formatTime((1 - progress) * track.durationSec)}`,
    togglePlay: () => setIsPlaying((p) => !p),
    toggleShuffle: () => setShuffle((s) => !s),
    toggleRepeat: () => setRepeat((r) => !r),
    seek: (ratio: number) => setProgress(Math.min(1, Math.max(0, ratio))),
    next,
    prev,
  };
}

export type MusicPlayerState = ReturnType<typeof useMusicPlayerState>;
