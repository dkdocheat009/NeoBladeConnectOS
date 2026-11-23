import { useEffect, useState } from 'react';
import './CalendarGlyph.css';

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Recreates the Kalender icon's plain white squircle (the original has no
 * baked-in gradient) with the weekday/day-of-month rendered live, in
 * Portuguese, instead of the fixed "So" / "25" burned into the reference
 * crop.
 */
export function CalendarGlyph() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="calendar-glyph">
      <span className="calendar-glyph__weekday">{WEEKDAYS_PT[now.getDay()]}</span>
      <span className="calendar-glyph__day">{now.getDate()}</span>
    </div>
  );
}
