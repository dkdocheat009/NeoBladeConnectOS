import { AppIcon } from '../AppIcon/AppIcon';
import type { AppDefinition } from '../../data/apps';
import './AppGrid.css';

const COLUMNS = 5;
const COLUMN_CENTERS = [248, 473, 698, 923, 1148];
const ROW_TOPS = [171, 363];

interface AppGridProps {
  apps: AppDefinition[];
  onOpenApp: (app: AppDefinition) => void;
}

export function AppGrid({ apps, onOpenApp }: AppGridProps) {
  return (
    <div className="app-grid">
      {apps.map((app, index) => {
        const col = index % COLUMNS;
        const row = Math.floor(index / COLUMNS);
        const left = COLUMN_CENTERS[col];
        const top = ROW_TOPS[row];
        return (
          <div key={app.id} className="app-grid__slot" style={{ left, top }}>
            <AppIcon
              label={app.label}
              icon={app.icon}
              onActivate={() => onOpenApp(app)}
            />
          </div>
        );
      })}
    </div>
  );
}
