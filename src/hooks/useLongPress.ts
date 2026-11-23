import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

/**
 * Detects a press-and-hold (mouse or touch) without blocking a normal
 * short click. If the hold lasts `delay` ms, onLongPress fires and the
 * following click is suppressed; otherwise onClick fires as usual.
 */
export function useLongPress({ onLongPress, onClick, delay = 600 }: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    firedRef.current = false;
    clear();
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, delay);
  }, [clear, delay, onLongPress]);

  const cancel = useCallback(() => {
    clear();
  }, [clear]);

  const handleClick = useCallback(() => {
    if (firedRef.current) {
      // The press already triggered long-press behaviour; swallow the click
      // that browsers/touch screens fire right after pointerup.
      firedRef.current = false;
      return;
    }
    onClick?.();
  }, [onClick]);

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onClick: handleClick,
  };
}
