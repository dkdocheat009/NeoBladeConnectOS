import { useEffect, useState } from 'react';
import { isRunningInEts2Host, subscribeToTelemetry } from './ets2Bridge';
import type { TelemetrySnapshot } from './types';

export interface Ets2TelemetryState {
  /** True only inside host/NeoBladeHost's WebView2 — never in the ordinary browser/dev server. */
  connected: boolean;
  /** Null until the first real snapshot arrives (or forever, outside the ETS2 host). */
  snapshot: TelemetrySnapshot | null;
}

/**
 * Real ETS2 telemetry when available, otherwise an honest "not connected"
 * state — never a silently-faked live value. Every screen that wants real
 * data instead of (or alongside) its existing mock hook should check
 * `connected` before trusting `snapshot`, and keep its demo state
 * available for when this is false, per "manter estado de demonstração
 * claramente identificável quando o ETS2 não está aberto" (Fase 10 task,
 * section 6).
 */
export function useEts2Telemetry(): Ets2TelemetryState {
  const [state, setState] = useState<Ets2TelemetryState>(() => ({
    connected: isRunningInEts2Host(),
    snapshot: null,
  }));

  useEffect(() => {
    const unsubscribe = subscribeToTelemetry((snapshot) => {
      setState({ connected: true, snapshot });
    });
    return unsubscribe;
  }, []);

  return state;
}
