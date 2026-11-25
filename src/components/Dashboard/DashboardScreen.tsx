import { MapPanel } from './MapPanel';
import { NavCard } from './NavCard';
import { MusicCard } from './MusicCard';
import type { MusicPlayerState } from '../../hooks/useMusicPlayerState';
import type { NavDemoState } from '../../hooks/useNavDemoState';
import './Dashboard.css';

interface DashboardScreenProps {
  player: MusicPlayerState;
  onOpenMusic: () => void;
  nav: NavDemoState;
  onOpenNavegacao: () => void;
}

/**
 * Dashboard (CarPlay "painel") content — reached from the dock's bottom
 * button. Everything here is a demo/mock representation: there is no real
 * map, GPS, routing or music integration. O cartão de navegação (Fase 8)
 * abre a tela cheia de Navegação com o mesmo estado demonstrativo.
 */
export function DashboardScreen({ player, onOpenMusic, nav, onOpenNavegacao }: DashboardScreenProps) {
  return (
    <div className="dashboard">
      <MapPanel nav={nav} />
      <div className="dashboard__side">
        <NavCard nav={nav} onOpenNavegacao={onOpenNavegacao} />
        <MusicCard player={player} onOpenMusic={onOpenMusic} />
      </div>
    </div>
  );
}
