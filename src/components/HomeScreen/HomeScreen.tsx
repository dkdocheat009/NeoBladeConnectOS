import { Wallpaper } from '../Wallpaper/Wallpaper';
import { Dock } from '../Dock/Dock';
import { AppGrid } from '../AppGrid/AppGrid';
import { Pagination } from '../Pagination/Pagination';
import { homeApps, type AppDefinition } from '../../data/apps';
import './HomeScreen.css';

export function HomeScreen() {
  // Fase 1: nenhum app/tela foi implementado ainda. Um toque apenas
  // reproduz o feedback visual de toque, sem navegar para telas inventadas.
  const handleOpenApp = (app: AppDefinition) => {
    console.info(`[NeoBladeConnectOS] "${app.label}" ainda não implementado.`);
  };

  const handleActivateShortcut = (id: string) => {
    console.info(`[NeoBladeConnectOS] atalho "${id}" ainda não implementado.`);
  };

  const handleHome = () => {
    // já estamos na Home; não há outras telas na Fase 1.
  };

  return (
    <div className="home-screen">
      <Wallpaper />
      <Dock onActivateShortcut={handleActivateShortcut} onHome={handleHome} />
      <AppGrid apps={homeApps} onOpenApp={handleOpenApp} />
      <Pagination />
    </div>
  );
}
