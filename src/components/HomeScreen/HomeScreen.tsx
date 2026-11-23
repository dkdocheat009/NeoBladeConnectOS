import { useState } from 'react';
import { AppGrid } from '../AppGrid/AppGrid';
import { Pagination } from '../Pagination/Pagination';
import { EditModeBar } from '../EditModeBar/EditModeBar';
import { homeApps, type AppDefinition } from '../../data/apps';
import type { TruckBrand } from '../../data/truckBrands';
import { useRemovedApps } from '../../hooks/useRemovedApps';
import './HomeScreen.css';

interface HomeScreenProps {
  badgeCounts: Record<string, number>;
  currentTruckBrand: TruckBrand;
  onActivateApp: (app: AppDefinition) => void;
}

export function HomeScreen({ badgeCounts, currentTruckBrand, onActivateApp }: HomeScreenProps) {
  const [editing, setEditing] = useState(false);
  const { removedIds, removeApp, restoreAll } = useRemovedApps();

  const visibleApps = homeApps.filter((app) => !removedIds.includes(app.id));

  return (
    <div className="home-content">
      {editing && (
        <button
          type="button"
          className="home-content__scrim"
          aria-label="Sair do modo de edição"
          onClick={() => setEditing(false)}
        />
      )}

      <AppGrid
        apps={visibleApps}
        editing={editing}
        badgeCounts={badgeCounts}
        currentTruckBrand={currentTruckBrand}
        onActivateApp={onActivateApp}
        onLongPress={() => setEditing(true)}
        onRemoveApp={removeApp}
      />

      {editing ? (
        <EditModeBar
          removedCount={removedIds.length}
          onRestoreAll={restoreAll}
          onDone={() => setEditing(false)}
        />
      ) : (
        <Pagination />
      )}
    </div>
  );
}
