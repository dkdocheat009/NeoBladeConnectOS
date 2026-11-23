import { MapPanel } from './MapPanel';
import { NavCard } from './NavCard';
import { MusicCard } from './MusicCard';
import type { MusicPlayerState } from '../../hooks/useMusicPlayerState';
import './Dashboard.css';

interface DashboardScreenProps {
  player: MusicPlayerState;
  onOpenMusic: () => void;
}

/**
 * Dashboard (CarPlay "painel") content — reached from the dock's bottom
 * button. Everything here is a demo/mock representation: there is no real
 * map, GPS, routing or music integration.
 */
export function DashboardScreen({ player, onOpenMusic }: DashboardScreenProps) {
  return (
    <div className="dashboard">
      <MapPanel />
      <div className="dashboard__side">
        <NavCard />
        <MusicCard player={player} onOpenMusic={onOpenMusic} />
      </div>
    </div>
  );
}
