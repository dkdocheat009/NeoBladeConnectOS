import { MapPanel } from './MapPanel';
import { NavCard } from './NavCard';
import { MusicCard } from './MusicCard';
import './Dashboard.css';

/**
 * Dashboard (CarPlay "painel") content — reached from the dock's bottom
 * button. Everything here is a demo/mock representation: there is no real
 * map, GPS, routing or music integration (fora de escopo da Fase 2).
 */
export function DashboardScreen() {
  return (
    <div className="dashboard">
      <MapPanel />
      <div className="dashboard__side">
        <NavCard />
        <MusicCard />
      </div>
    </div>
  );
}
