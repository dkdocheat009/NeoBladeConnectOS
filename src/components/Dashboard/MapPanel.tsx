import './MapPanel.css';

/**
 * Decorative, non-functional stand-in for the navigation map seen in the
 * dashboard reference capture: stylised land shapes, a route line and a
 * position marker drawn in SVG. It is a demo representation only — no real
 * map/GPS data is used or implied (ver CLAUDE.md / tarefa da Fase 2).
 */
export function MapPanel() {
  return (
    <div className="map-panel">
      <svg
        className="map-panel__art"
        viewBox="0 0 732 696"
        width="732"
        height="696"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#07192f" />
            <stop offset="100%" stopColor="#0a2440" />
          </linearGradient>
          <linearGradient id="map-land" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f5f66" />
            <stop offset="100%" stopColor="#0a4750" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="732" height="696" fill="url(#map-bg)" />

        <path
          d="M -20,40 C 120,10 220,70 300,40 C 420,0 520,60 560,160
             C 600,260 520,300 560,380 C 600,460 520,520 420,560
             C 320,600 260,560 180,600 C 100,640 20,600 -20,640 Z"
          fill="url(#map-land)"
          opacity="0.55"
        />
        <path
          d="M 752,120 C 640,140 600,220 560,300 C 520,380 460,420 380,460
             C 300,500 260,560 230,620 C 210,660 180,680 140,696 L 752,696 Z"
          fill="url(#map-land)"
          opacity="0.4"
        />

        <g fill="none" stroke="rgba(150,180,205,0.4)" strokeWidth="3">
          <path d="M -20,150 C 160,70 260,150 340,150 C 420,150 480,90 560,70" />
          <path d="M 420,0 C 440,120 380,140 300,210 C 220,280 260,360 340,420" />
          <path d="M 732,420 C 620,440 540,500 460,560 C 400,604 340,630 260,650" />
        </g>

        <path
          className="map-panel__route"
          d="M -10,120 C 160,50 240,140 330,150 C 420,160 470,90 540,75
             C 580,68 600,95 580,120 C 540,165 430,150 380,210
             C 330,270 300,340 330,420 C 350,470 365,500 365,540"
          fill="none"
          stroke="#2fd9e8"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <g transform="translate(365,540)">
          <circle r="16" fill="#2f7bff" stroke="#eaf4ff" strokeWidth="2.5" />
          <path d="M0,-8 L6,6 L0,2 L-6,6 Z" fill="#ffffff" />
        </g>
      </svg>

      <div className="map-panel__badge map-panel__badge--a" style={{ left: 172, top: 142 }}>
        A50
      </div>
      <div className="map-panel__badge map-panel__badge--b" style={{ left: 300, top: 430 }}>
        A12
      </div>

      <div className="map-panel__speed">
        <div className="map-panel__sign" aria-label="Limite de velocidade 90 km/h">
          <span>90</span>
        </div>
        <div className="map-panel__speed-now">
          <span className="map-panel__speed-value">87</span>
          <span className="map-panel__speed-unit">km/h</span>
        </div>
      </div>

      <div className="map-panel__eta">
        <span className="map-panel__eta-time">19:49 Chegada</span>
        <span className="map-panel__eta-duration">5 h 43 min</span>
        <span className="map-panel__eta-distance">412 km</span>
      </div>
    </div>
  );
}
