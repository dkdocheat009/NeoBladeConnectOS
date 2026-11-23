import './EditModeBar.css';

interface EditModeBarProps {
  removedCount: number;
  onRestoreAll: () => void;
  onDone: () => void;
}

/**
 * Simple, in-scope replacement for the Home pagination while editing:
 * lets the user bring back removed shortcuts and leave edit mode. No app
 * store / extra screen is introduced.
 */
export function EditModeBar({ removedCount, onRestoreAll, onDone }: EditModeBarProps) {
  return (
    <div className="edit-bar">
      {removedCount > 0 && (
        <button type="button" className="edit-bar__pill edit-bar__pill--ghost" onClick={onRestoreAll}>
          Restaurar {removedCount} {removedCount === 1 ? 'atalho' : 'atalhos'}
        </button>
      )}
      <button type="button" className="edit-bar__pill edit-bar__pill--primary" onClick={onDone}>
        Concluir
      </button>
    </div>
  );
}
