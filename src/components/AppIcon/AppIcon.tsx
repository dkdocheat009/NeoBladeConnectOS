import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLongPress } from '../../hooks/useLongPress';
import { Badge } from '../Badge/Badge';
import './AppIcon.css';

interface AppIconProps {
  label: string;
  icon?: string;
  renderGlyph?: () => ReactNode;
  badgeCount?: number;
  onActivate?: () => void;
  onLongPress?: () => void;
  editing?: boolean;
  onRemove?: () => void;
  jiggleDelay?: number;
}

export function AppIcon({
  label,
  icon,
  renderGlyph,
  badgeCount,
  onActivate,
  onLongPress,
  editing,
  onRemove,
  jiggleDelay = 0,
}: AppIconProps) {
  const press = useLongPress({
    onLongPress: () => onLongPress?.(),
    onClick: () => {
      if (!editing) onActivate?.();
    },
  });

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={label}
      className="app-icon"
      whileTap={editing ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      {...press}
    >
      <div className="app-icon__glyph-wrap">
        <div
          className={`app-icon__glyph${editing ? ' app-icon__glyph--jiggle' : ''}`}
          style={editing ? { animationDelay: `${jiggleDelay}s` } : undefined}
        >
          {renderGlyph ? renderGlyph() : <img src={icon} alt="" draggable={false} />}
        </div>

        {typeof badgeCount === 'number' && <Badge count={badgeCount} />}

        {editing && onRemove && (
          <button
            type="button"
            className="app-icon__remove"
            aria-label={`Remover ${label} da Home`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
          >
            −
          </button>
        )}
      </div>
      <span className="app-icon__label">{label}</span>
    </motion.div>
  );
}
