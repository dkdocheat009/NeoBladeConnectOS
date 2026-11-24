import './IosToggle.css';

interface IosToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/** Switch estilo iOS — reutilizado por Ajustes e qualquer tela com opção on/off. */
export function IosToggle({ checked, onChange, disabled }: IosToggleProps) {
  return (
    <button
      type="button"
      className={`ios-toggle${checked ? ' is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="ios-toggle__knob" />
    </button>
  );
}
