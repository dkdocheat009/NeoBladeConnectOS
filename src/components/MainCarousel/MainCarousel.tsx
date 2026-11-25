import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent as ReactWheelEvent } from 'react';
import { Pagination } from '../Pagination/Pagination';
import { EditModeBar } from '../EditModeBar/EditModeBar';
import './MainCarousel.css';

interface MainCarouselProps {
  position: number;
  totalHomePages: number;
  onChangePosition: (next: number) => void;
  dashboard: ReactNode;
  homePages: ReactNode[];
  editing: boolean;
  onExitEditing: () => void;
  removedCount: number;
  onRestoreAll: () => void;
}

const DRAG_THRESHOLD = 10; // px antes de considerar um arraste horizontal real
const COMMIT_THRESHOLD = 90; // px para confirmar a troca de página ao soltar
const STAGE_WIDTH = 1280;

/**
 * Carrossel horizontal Dashboard/Home (Fase 8) — substitui a transição
 * "trocar tela inteira" por um track deslizante real: arraste por
 * ponteiro/mouse (com limiar, resistência nas pontas e proteção contra
 * clique acidental via `setPointerCapture`, que cancela o long-press do
 * ícone de origem emitindo `pointercancel`), cliques nos indicadores,
 * setas do teclado e roda do mouse horizontal/trackpad (Fase 9 — só reage
 * a `deltaX` real ou "Shift + roda", nunca à rolagem vertical comum de uma
 * lista interna). O long-press/jiggle da Home continua funcionando
 * normalmente: só é interrompido quando o arraste realmente ultrapassa o
 * limiar horizontal.
 */
export function MainCarousel({
  position,
  totalHomePages,
  onChangePosition,
  dashboard,
  homePages,
  editing,
  onExitEditing,
  removedCount,
  onRestoreAll,
}: MainCarouselProps) {
  const total = 1 + totalHomePages;
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; active: boolean } | null>(null);
  const wheelLockRef = useRef(false);

  const clamp = (n: number) => Math.max(0, Math.min(total - 1, n));

  const applyResistance = (dx: number) => {
    if ((position === 0 && dx > 0) || (position === total - 1 && dx < 0)) {
      return dx * 0.35;
    }
    return dx;
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, active: false };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.active) {
      if (Math.abs(dx) < DRAG_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
      drag.active = true;
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore - alguns navegadores podem recusar em certas condições
      }
    }
    setDragX(applyResistance(dx));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>, commit: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.active && commit && Math.abs(dragX) > COMMIT_THRESHOLD) {
      onChangePosition(clamp(position + (dragX < 0 ? 1 : -1)));
    }
    dragRef.current = null;
    setDragging(false);
    setDragX(0);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    // Scroll horizontal real (trackpad ou "shift + roda") — ignora rolagem
    // vertical comum (listas internas de um app continuam rolando normal).
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (horizontal === 0 || wheelLockRef.current) return;
    if (Math.abs(horizontal) < 24) return;
    wheelLockRef.current = true;
    onChangePosition(clamp(position + (horizontal > 0 ? 1 : -1)));
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 380);
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onChangePosition(clamp(position + 1));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onChangePosition(clamp(position - 1));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, total]);

  const baseOffset = -(position * STAGE_WIDTH);

  return (
    <div
      className="main-carousel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => endDrag(e, true)}
      onPointerCancel={(e) => endDrag(e, false)}
      onWheel={handleWheel}
    >
      <div
        className="main-carousel__track"
        style={{
          width: STAGE_WIDTH * total,
          transform: `translateX(${baseOffset + dragX}px)`,
          transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 0.8, 0.2, 1)',
        }}
      >
        <div className="main-carousel__slide">{dashboard}</div>
        {homePages.map((page, i) => (
          <div className="main-carousel__slide" key={i}>
            {page}
          </div>
        ))}
      </div>

      {editing ? (
        <EditModeBar removedCount={removedCount} onRestoreAll={onRestoreAll} onDone={onExitEditing} />
      ) : (
        <Pagination position={position} total={totalHomePages} onSelect={onChangePosition} />
      )}
    </div>
  );
}
