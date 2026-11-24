import { useEffect, useRef, useState } from 'react';

export type CallState = 'idle' | 'ringing' | 'active' | 'ended';

/**
 * Estado mock de chamada (módulo Chamadas, reproduz call.png). Sem
 * telefonia real: "ring"/"accept"/"decline"/"hangUp" são apenas
 * transições de UI controladas pelo próprio app (ver botão "Simular
 * chamada" em NavegacaoScreen).
 */
export function useIncomingCall() {
  const [state, setState] = useState<CallState>('idle');
  const [muted, setMuted] = useState(false);
  const [elapsedS, setElapsedS] = useState(0);
  const endedTimeout = useRef<number | null>(null);
  const tickInterval = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (endedTimeout.current) window.clearTimeout(endedTimeout.current);
      if (tickInterval.current) window.clearInterval(tickInterval.current);
    },
    [],
  );

  const ring = () => {
    setState('ringing');
    setMuted(false);
    setElapsedS(0);
  };

  const accept = () => {
    setState('active');
    tickInterval.current = window.setInterval(() => setElapsedS((s) => s + 1), 1000);
  };

  const finish = () => {
    if (tickInterval.current) {
      window.clearInterval(tickInterval.current);
      tickInterval.current = null;
    }
    setState('ended');
    endedTimeout.current = window.setTimeout(() => setState('idle'), 1800);
  };

  const toggleMute = () => setMuted((m) => !m);

  return { state, muted, elapsedS, ring, accept, decline: finish, hangUp: finish, toggleMute };
}

export type IncomingCall = ReturnType<typeof useIncomingCall>;
