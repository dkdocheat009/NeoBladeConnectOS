import { useEffect, useState } from 'react';
import './StatusBar.css';

function formatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="status-bar">
      <div className="status-bar__clock">{formatTime(now)}</div>

      <div className="status-bar__signal">
        <svg
          className="status-bar__bars"
          viewBox="0 0 37 18"
          width="37"
          height="18"
          aria-hidden="true"
        >
          <rect x="0" y="12" width="7" height="6" rx="1.2" fill="#fff" />
          <rect x="10" y="8" width="7" height="10" rx="1.2" fill="#fff" />
          <rect x="20" y="4" width="7" height="14" rx="1.2" fill="#fff" />
          <rect x="30" y="0" width="7" height="18" rx="1.2" fill="#fff" />
        </svg>
        <span className="status-bar__network">5G</span>
      </div>

      {/* Bateria: centralizada horizontalmente no dock (ver README/CLAUDE.md
          — Fase 5, correção do dock), não alinhada à mesma borda do
          relógio/sinal. Tamanho medido em home.png (~46×22px reais). */}
      <svg
        className="status-bar__battery"
        viewBox="0 0 46 22"
        width="46"
        height="22"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="battery-body-clip">
            <rect x="0" y="1" width="40" height="20" rx="10" />
          </clipPath>
        </defs>
        <rect x="0" y="1" width="40" height="20" rx="10" fill="#67707d" />
        <rect x="0" y="1" width="34" height="20" fill="#34c759" clipPath="url(#battery-body-clip)" />
        <rect x="42" y="7" width="4" height="8" rx="2" fill="#67707d" />
        <path
          d="M21.7 4.8 L14 13.4 l5 0 l-1.8 5.7 l7.9 -9 h-5 Z"
          fill="#ffffff"
          stroke="#2a3b2e"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
