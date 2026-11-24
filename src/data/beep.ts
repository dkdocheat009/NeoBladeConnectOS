// Bipe curtíssimo gerado via Web Audio API (sem asset de áudio) para o
// aviso sonoro das Notificações — controlado por Configurações (Fase 6):
// volume mestre e o interruptor "sons de notificação".
export function playNotificationBeep(volumePercent: number) {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const peak = Math.max(0, Math.min(1, volumePercent / 100)) * 0.18;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
    osc.onended = () => ctx.close().catch(() => {});
  } catch {
    // Sem suporte a Web Audio — segue sem som, sem quebrar a notificação.
  }
}
