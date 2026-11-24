import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string;
}

/** Cartão pequeno "label em cima, valor grande embaixo" (Óleo/Água/etc). */
export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
    </div>
  );
}
