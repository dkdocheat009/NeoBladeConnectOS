import './IosSearchField.css';

interface IosSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Campo de busca estilo iOS (lupa + cápsula translúcida). */
export function IosSearchField({ value, onChange, placeholder = 'Buscar' }: IosSearchFieldProps) {
  return (
    <div className="ios-search">
      <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" className="ios-search__icon">
        <circle cx="8.5" cy="8.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <line x1="13.2" y1="13.2" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        className="ios-search__input"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="ios-search__clear" aria-label="Limpar busca" onClick={() => onChange('')}>
          ✕
        </button>
      )}
    </div>
  );
}
