import { useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import type { IncomingCall } from '../../hooks/useIncomingCall';
import type { NavDemoState } from '../../hooks/useNavDemoState';
import { mockRoute } from '../../data/navMock';
import './NavegacaoScreen.css';

type Theme = 'escuro' | 'claro';
type View = 'ativa' | 'geral';

interface NavegacaoScreenProps {
  onBack: () => void;
  onOpenRadar: () => void;
  call: IncomingCall;
  initialTheme?: Theme;
  nav: NavDemoState;
}

/**
 * Reproduz navi-dunkel.png / navi-hell.png (tema) e karte-3d.png (visão
 * geral, sem instrução de manobra ativa). Mapa é um mock em SVG/CSS — sem
 * GPS, TruckSimMap ou telemetria real. Botão "…" alterna tema; botão de
 * rota alterna visão geral (e também inicia/encerra a rota demonstrativa
 * compartilhada com o Dashboard — Fase 8); o selo de limite/velocidade
 * abre o módulo de Radar (ver blitzer.png, onde o mesmo selo aparece
 * ampliado). `initialTheme` vem de Ajustes > Tela e Aparência; a
 * alternância "…" continua funcionando normalmente por cima dessa
 * preferência. A manobra/distância/destino vêm de `nav` (useNavDemoState,
 * instanciado uma vez no Shell) — a mesma exibida no cartão do Dashboard.
 */
export function NavegacaoScreen({ onBack, onOpenRadar, call, initialTheme = 'escuro', nav }: NavegacaoScreenProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [view, setView] = useState<View>(nav.routeActive ? 'ativa' : 'geral');

  const isOverview = view === 'geral';

  const toggleOverview = () => {
    if (view === 'ativa') {
      setView('geral');
      nav.endRoute();
    } else {
      setView('ativa');
      nav.startRoute();
    }
  };

  return (
    <div className={`nav-screen nav-screen--${theme}`}>
      <BackButton onClick={onBack} />

      <div className="nav-screen__map" aria-hidden="true">
        <svg viewBox="0 0 1280 720" width="1280" height="720">
          <path
            className="nav-screen__road-casing"
            d="M 440 230 C 500 280 620 330 700 420 S 760 560 700 640"
            fill="none"
            strokeWidth="18"
          />
          <path
            className="nav-screen__road"
            d="M 440 230 C 500 280 620 330 700 420 S 760 560 700 640"
            fill="none"
            strokeWidth="10"
          />
          <path
            className="nav-screen__highway"
            d="M 140 285 L 440 230"
            fill="none"
            strokeWidth="5"
          />
          <path
            className="nav-screen__highway"
            d="M 760 540 C 950 480 1100 420 1260 390"
            fill="none"
            strokeWidth="5"
          />
        </svg>
      </div>

      {!isOverview && (
        <div className="nav-screen__instruction">
          <div className="nav-screen__instruction-row">
            <TurnArrow />
            <span className="nav-screen__instruction-distance">{nav.step.distanceToTurn}</span>
          </div>
          <p className="nav-screen__instruction-text">
            {nav.step.instruction} ·{' '}
            <span className="nav-screen__shield">{nav.step.roadShield}</span>{' '}
            {nav.step.roadDestination}
          </p>
          <div className="nav-screen__lanes">
            {mockRoute.upcomingLanes.map((active, i) => (
              <span key={i} className={`nav-screen__lane${active ? '' : ' is-dim'}`}>
                ↑
              </span>
            ))}
          </div>
        </div>
      )}

      {isOverview && (
        <div className="nav-screen__location-label">{mockRoute.destinationLabel}</div>
      )}

      <button
        type="button"
        className="nav-screen__speed-widget"
        onClick={onOpenRadar}
        aria-label="Abrir alertas de radar"
      >
        <span className="nav-screen__limit-sign">{mockRoute.speedLimitKmh}</span>
        <span className="nav-screen__current-speed">
          {isOverview ? 0 : mockRoute.currentSpeedKmh}
          <small>km/h</small>
        </span>
      </button>

      <div className="nav-screen__puck">
        <div className="nav-screen__puck-arrow" />
        <span className="nav-screen__puck-shield">{mockRoute.currentRoad}</span>
      </div>

      <div className="nav-screen__arrival">
        <span className="nav-screen__arrival-time">{mockRoute.arrivalTime} Chegada</span>
        <span className="nav-screen__arrival-sub">
          {mockRoute.remainingDuration} · {mockRoute.remainingDistanceKm} km
        </span>
      </div>

      <div className="nav-screen__fab-col">
        <button
          type="button"
          className="nav-screen__fab"
          aria-label="Alternar visão geral da rota"
          onClick={toggleOverview}
        >
          <RouteGlyph />
        </button>
        <button
          type="button"
          className="nav-screen__fab"
          aria-label="Mais opções (alternar tema)"
          onClick={() => setTheme((t) => (t === 'escuro' ? 'claro' : 'escuro'))}
        >
          ⋯
        </button>
      </div>

      <button type="button" className="nav-screen__call-demo" onClick={call.ring}>
        Simular chamada (teste)
      </button>
    </div>
  );
}

function TurnArrow() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M19 19 9 9M9 9v7M9 9h7"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(180 12 12)"
      />
    </svg>
  );
}

function RouteGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="6" cy="6" r="2.4" fill="#fff" />
      <circle cx="18" cy="18" r="2.4" fill="#fff" />
      <path
        d="M6 8c0 6 12 2 12 8"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
