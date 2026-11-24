import './StatBar.css';

interface StatBarProps {
  label: string;
  valueLabel: string;
  pct: number;
}

/** Linha "label + barra de progresso + valor", usada em Condição/Reboque. */
export function StatBar({ label, valueLabel, pct }: StatBarProps) {
  return (
    <div className="stat-bar">
      <span className="stat-bar__label">{label}</span>
      <div className="stat-bar__track">
        <div className="stat-bar__fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <span className="stat-bar__value">{valueLabel}</span>
    </div>
  );
}
