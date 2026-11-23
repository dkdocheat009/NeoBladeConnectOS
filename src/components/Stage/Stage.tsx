import type { PropsWithChildren } from 'react';
import './Stage.css';

/**
 * Fixed 1280x720 canvas, scaled uniformly to fit the real viewport.
 * The Home screen is always laid out at its native resolution internally,
 * which keeps every measurement in this app comparable 1:1 to home.png.
 */
export function Stage({ children }: PropsWithChildren) {
  return (
    <div className="stage-viewport">
      <div className="stage-canvas">{children}</div>
    </div>
  );
}
