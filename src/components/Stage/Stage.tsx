import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import './Stage.css';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

/**
 * Fixed 1280x720 canvas, scaled uniformly (via CSS transform) to fit
 * whatever real viewport/display the app runs on — a smaller window or a
 * different ETS2/monitor resolution shrinks or grows the whole stage
 * without reflowing it like a responsive mobile site. The Home screen is
 * always laid out at its native resolution internally, which keeps every
 * measurement in this app comparable 1:1 to home.png (Fase 9: the scale
 * factor used to be a stale claim in this comment with no code behind it —
 * `stage-canvas` was only ever centered at a fixed 1280x720, never scaled).
 */
export function Stage({ children }: PropsWithChildren) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      setScale(Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stage-viewport" ref={viewportRef}>
      <div className="stage-canvas" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
