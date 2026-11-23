import './NavCard.css';

/** Mock next-turn instruction card — dados demonstrativos, sem GPS real. */
export function NavCard() {
  return (
    <div className="nav-card">
      <svg className="nav-card__arrow" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <path
          d="M10 34 L10 20 Q10 10 20 10 L34 10"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M24 4 L40 10 L24 18 Z" fill="#fff" />
      </svg>

      <div className="nav-card__info">
        <span className="nav-card__distance">1,5 km</span>
        <span className="nav-card__instruction">Saída à direita</span>
        <span className="nav-card__road">
          <span className="nav-card__shield">A50</span>
          Amsterdam
        </span>
      </div>

      <div className="nav-card__steps" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
