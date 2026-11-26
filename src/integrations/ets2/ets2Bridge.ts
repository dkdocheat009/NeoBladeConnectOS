import type { TelemetrySnapshot } from './types';
import { isTelemetrySnapshot } from './types';

// Narrow declaration for the one WebView2 global this file touches — the
// full typing lives in the @types/... package host/NeoBladeHost would need
// if it were TypeScript; this app only ever reads window.chrome.webview.
declare global {
  interface Window {
    chrome?: {
      webview?: {
        addEventListener(type: 'message', listener: (event: MessageEvent<string>) => void): void;
        removeEventListener(type: 'message', listener: (event: MessageEvent<string>) => void): void;
        postMessage(message: unknown): void;
      };
    };
  }
}

export type TelemetryListener = (snapshot: TelemetrySnapshot) => void;

/**
 * True only when this page is actually running inside host/NeoBladeHost's
 * WebView2 (see MainForm.cs's `EnsureCoreWebView2Async` — that's what
 * creates `window.chrome.webview`). In the ordinary browser/dev-server
 * case this is false and every consumer must fall back to its own
 * existing mock state, per "interface mock desacoplada para continuar
 * testável fora do jogo" (Fase 10 task, section 3).
 */
export function isRunningInEts2Host(): boolean {
  return typeof window !== 'undefined' && !!window.chrome?.webview;
}

/**
 * Subscribes to real telemetry snapshots forwarded by MainForm.cs's
 * `PostWebMessageAsJson`. Returns a no-op unsubscribe function when not
 * running inside the ETS2 host — callers can always call this
 * unconditionally and only act on it when isRunningInEts2Host() is true,
 * or simply rely on the listener never firing outside the host.
 */
export function subscribeToTelemetry(listener: TelemetryListener): () => void {
  if (!isRunningInEts2Host()) return () => {};

  const handler = (event: MessageEvent<string>) => {
    try {
      const parsed: unknown = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (isTelemetrySnapshot(parsed)) listener(parsed);
    } catch {
      // Malformed message from the host — ignore this one frame rather
      // than throw inside a global event listener.
    }
  };

  window.chrome!.webview!.addEventListener('message', handler);
  return () => window.chrome?.webview?.removeEventListener('message', handler);
}

/** Fire-and-forget message to the host (MainForm.cs's WebMessageReceived). */
export function sendToHost(message: unknown): void {
  if (!isRunningInEts2Host()) return;
  window.chrome!.webview!.postMessage(message);
}
