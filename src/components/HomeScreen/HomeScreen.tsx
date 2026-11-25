import { AppGrid } from '../AppGrid/AppGrid';
import type { AppDefinition } from '../../data/apps';
import type { TruckBrand } from '../../data/truckBrands';
import './HomeScreen.css';

interface HomeScreenProps {
  apps: AppDefinition[];
  editing: boolean;
  onExitEditing: () => void;
  badgeCounts: Record<string, number>;
  currentTruckBrand: TruckBrand;
  onActivateApp: (app: AppDefinition) => void;
  onLongPress: () => void;
  onRemoveApp: (id: string) => void;
}

/**
 * Uma página de aplicativos da Home (Fase 8: `editing`/atalhos removidos e
 * a paginação/EditModeBar viraram estado compartilhado, instanciado uma
 * vez no Shell e repassado a cada página — assim o modo de edição
 * "chacoalha" as duas páginas ao mesmo tempo, como no iOS, e tocar fora de
 * qualquer ícone em qualquer página sai do modo de edição).
 */
export function HomeScreen({
  apps,
  editing,
  onExitEditing,
  badgeCounts,
  currentTruckBrand,
  onActivateApp,
  onLongPress,
  onRemoveApp,
}: HomeScreenProps) {
  return (
    <div className="home-content">
      {editing && (
        <button
          type="button"
          className="home-content__scrim"
          aria-label="Sair do modo de edição"
          onClick={onExitEditing}
        />
      )}

      <AppGrid
        apps={apps}
        editing={editing}
        badgeCounts={badgeCounts}
        currentTruckBrand={currentTruckBrand}
        onActivateApp={onActivateApp}
        onLongPress={onLongPress}
        onRemoveApp={onRemoveApp}
      />
    </div>
  );
}
