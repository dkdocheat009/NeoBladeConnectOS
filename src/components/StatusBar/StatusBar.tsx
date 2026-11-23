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
          viewBox="0 0 18 13"
          width="18"
          height="13"
          aria-hidden="true"
        >
          <rect x="0" y="8" width="3" height="5" rx="0.6" fill="#fff" />
          <rect x="5" y="5.5" width="3" height="7.5" rx="0.6" fill="#fff" />
          <rect x="10" y="3" width="3" height="10" rx="0.6" fill="#fff" />
          <rect x="15" y="0" width="3" height="13" rx="0.6" fill="#fff" />
        </svg>
        <span className="status-bar__network">5G</span>
      </div>

      <svg
        className="status-bar__battery"
        viewBox="0 0 25 13"
        width="25"
        height="13"
        aria-hidden="true"
      >
        <rect
          x="0.75"
          y="0.75"
          width="20.5"
          height="11.5"
          rx="3"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <rect x="2.25" y="2.25" width="16.3" height="8.5" rx="1.8" fill="#34c759" />
        <rect x="22.5" y="4" width="1.8" height="5" rx="0.9" fill="#ffffff" fillOpacity="0.5" />
        <path d="M11.8 2.6 7.6 7.3h2.7l-1 3.1 4.3-4.9h-2.7z" fill="#0b3d0f" />
      </svg>
    </div>
  );
}
