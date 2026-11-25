import type { NavDemoState } from '../../hooks/useNavDemoState';
import './NavCard.css';

interface NavCardProps {
  nav: NavDemoState;
  onOpenNavegacao: () => void;
}

/**
 * Cartão de instrução de navegação do Dashboard — Fase 8: deixou de ser
 * decorativo. Tocar no corpo do cartão abre a tela cheia de Navegação com
 * a MESMA manobra/distância/destino (estado compartilhado via
 * `useNavDemoState`, instanciado uma vez no Shell). Os "três pontos" à
 * direita (que já existiam como indicador visual) agora são um botão real
 * que avança para a próxima manobra de demonstração — o equivalente ao
 * botão de opções "⋯" citado na referência. Sem GPS/rota real.
 */
export function NavCard({ nav, onOpenNavegacao }: NavCardProps) {
  if (!nav.routeActive) {
    return (
      <div className="nav-card nav-card--inactive">
        <button type="button" className="nav-card__open-hit" onClick={onOpenNavegacao} aria-label="Abrir Navegação">
          <span className="nav-card__inactive-text">Sem rota ativa</span>
        </button>
        <button type="button" className="nav-card__start-btn" onClick={nav.startRoute}>
          Iniciar rota (demo)
        </button>
      </div>
    );
  }

  return (
    <div className="nav-card">
      <button type="button" className="nav-card__open-hit" onClick={onOpenNavegacao} aria-label="Abrir Navegação">
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
          <span className="nav-card__distance">{nav.step.distanceToTurn}</span>
          <span className="nav-card__instruction">{nav.step.instruction}</span>
          <span className="nav-card__road">
            <span className="nav-card__shield">{nav.step.roadShield}</span>
            {nav.step.roadDestination}
          </span>
        </div>
      </button>

      <button
        type="button"
        className="nav-card__steps"
        aria-label="Próxima manobra de demonstração"
        onClick={(e) => {
          e.stopPropagation();
          nav.nextInstruction();
        }}
      >
        {Array.from({ length: nav.totalSteps }).map((_, i) => (
          <span key={i} className={i === nav.stepIndex ? 'is-active' : ''} />
        ))}
      </button>
    </div>
  );
}
