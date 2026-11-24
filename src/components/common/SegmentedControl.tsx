import './SegmentedControl.css';

interface SegmentedOption {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
}

/** Pílula de alternância (ex.: Zugmaschine/Anhänger, Spiele/Tabelle). */
export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="segmented">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`segmented__option${opt.id === value ? ' is-active' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
