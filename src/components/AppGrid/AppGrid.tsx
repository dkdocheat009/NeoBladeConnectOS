import type { ReactNode } from 'react';
import { AppIcon } from '../AppIcon/AppIcon';
import { CalendarGlyph } from '../AppIcon/CalendarGlyph';
import { BrandLogoGlyph } from '../AppIcon/BrandLogoGlyph';
import { NotificationGlyph } from '../AppIcon/NotificationGlyph';
import { MessageGlyph } from '../AppIcon/MessageGlyph';
import { EsportesGlyph } from '../AppIcon/EsportesGlyph';
import type { AppDefinition } from '../../data/apps';
import type { TruckBrand } from '../../data/truckBrands';
import './AppGrid.css';

const COLUMNS = 5;
const COLUMN_CENTERS = [248, 473, 698, 923, 1148];
const ROW_TOPS = [171, 363, 540];

interface AppGridProps {
  apps: AppDefinition[];
  editing: boolean;
  badgeCounts: Record<string, number>;
  currentTruckBrand: TruckBrand;
  onActivateApp: (app: AppDefinition) => void;
  onLongPress: () => void;
  onRemoveApp: (id: string) => void;
}

export function AppGrid({
  apps,
  editing,
  badgeCounts,
  currentTruckBrand,
  onActivateApp,
  onLongPress,
  onRemoveApp,
}: AppGridProps) {
  return (
    <div className="app-grid">
      {apps.map((app, index) => {
        const col = index % COLUMNS;
        const row = Math.floor(index / COLUMNS);
        const left = COLUMN_CENTERS[col];
        const top = ROW_TOPS[row];

        let icon = app.icon;
        let renderGlyph: (() => ReactNode) | undefined;

        if (app.id === 'kalender') {
          renderGlyph = () => <CalendarGlyph />;
        } else if (app.id === 'mitteilungen') {
          renderGlyph = () => <NotificationGlyph />;
        } else if (app.id === 'nachrichten') {
          renderGlyph = () => <MessageGlyph />;
        } else if (app.id === 'fahrzeug') {
          renderGlyph = () => <BrandLogoGlyph brand={currentTruckBrand} />;
        } else if (app.id === 'esportes') {
          renderGlyph = () => <EsportesGlyph />;
        }

        return (
          <div key={app.id} className="app-grid__slot" style={{ left, top }}>
            <AppIcon
              label={app.label}
              icon={icon}
              renderGlyph={renderGlyph}
              badgeCount={badgeCounts[app.id]}
              editing={editing}
              onActivate={() => onActivateApp(app)}
              onLongPress={onLongPress}
              onRemove={() => onRemoveApp(app.id)}
              jiggleDelay={(index % 2) * -0.12}
            />
          </div>
        );
      })}
    </div>
  );
}
