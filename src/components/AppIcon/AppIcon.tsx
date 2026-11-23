import { motion } from 'motion/react';
import './AppIcon.css';

interface AppIconProps {
  label: string;
  icon: string;
  onActivate?: () => void;
}

export function AppIcon({ label, icon, onActivate }: AppIconProps) {
  return (
    <button type="button" className="app-icon" onClick={onActivate}>
      <motion.img
        src={icon}
        alt={label}
        className="app-icon__glyph"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        draggable={false}
      />
      <span className="app-icon__label">{label}</span>
    </button>
  );
}
