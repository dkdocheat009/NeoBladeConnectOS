import './Pagination.css';

interface PaginationProps {
  /** 0 = Dashboard; 1..total = páginas de aplicativos da Home. */
  position: number;
  /** Número de páginas de aplicativos (não conta o Dashboard). */
  total: number;
  onSelect: (position: number) => void;
}

/**
 * Indicadores reais (Fase 8): o primeiro (quadrado) abre o Dashboard; os
 * demais levam à página de aplicativos correspondente. Clicáveis, com o
 * indicador ativo sincronizado à posição atual do carrossel — nunca mais
 * puramente decorativos.
 */
export function Pagination({ position, total, onSelect }: PaginationProps) {
  return (
    <div className="pagination">
      <button
        type="button"
        className={`pagination__dot pagination__dot--square${position === 0 ? ' pagination__dot--active' : ''}`}
        aria-label="Abrir Dashboard"
        onClick={() => onSelect(0)}
      />
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`pagination__dot${position === i + 1 ? ' pagination__dot--active' : ''}`}
          aria-label={`Página ${i + 1} de aplicativos`}
          onClick={() => onSelect(i + 1)}
        />
      ))}
    </div>
  );
}
