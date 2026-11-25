import { useRef, useState } from 'react';
import { initialNotifications, simulatedNotification, type NotificationItem } from '../data/notificationsMock';
import { playNotificationBeep } from '../data/beep';

interface NotificationAudioOptions {
  soundEnabled: boolean;
  volume: number;
  /** Tempo de permanência do banner transitório, em ms (Ajustes > Notificações). */
  bannerDurationMs?: number;
}

/**
 * Estado local (em memória) das Notificações — compartilhado entre a Home
 * (badge), o banner transitório (sobre qualquer app) e a tela
 * Notificações. "Simular notificação" adiciona um item novo e aciona o
 * banner, para demonstrar o estado sem depender de eventos reais do
 * sistema. O aviso sonoro respeita as preferências de Configurações.
 */
export function useNotificationsState(
  audio: NotificationAudioOptions = { soundEnabled: true, volume: 80, bannerDurationMs: 4200 },
) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [banner, setBanner] = useState<NotificationItem | null>(null);
  const bannerTimer = useRef<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dismissBanner = () => {
    if (bannerTimer.current !== null) {
      window.clearTimeout(bannerTimer.current);
      bannerTimer.current = null;
    }
    setBanner(null);
  };

  const showBanner = (item: NotificationItem) => {
    setBanner(item);
    if (audio.soundEnabled) playNotificationBeep(audio.volume);
    if (bannerTimer.current !== null) window.clearTimeout(bannerTimer.current);
    bannerTimer.current = window.setTimeout(() => setBanner(null), audio.bannerDurationMs ?? 4200);
  };

  const simulateIncoming = () => {
    const item: NotificationItem = { ...simulatedNotification, id: `n-sim-${Date.now()}` };
    setNotifications((prev) => [item, ...prev]);
    showBanner(item);
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearOne = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => setNotifications([]);

  const restoreDemo = () => setNotifications(initialNotifications);

  return {
    notifications,
    unreadCount,
    banner,
    dismissBanner,
    simulateIncoming,
    markRead,
    markAllRead,
    clearOne,
    clearAll,
    restoreDemo,
  };
}

export type NotificationsState = ReturnType<typeof useNotificationsState>;
