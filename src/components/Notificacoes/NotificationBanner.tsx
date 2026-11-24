import { NotificationGlyph } from '../AppIcon/NotificationGlyph';
import type { NotificationsState } from '../../hooks/useNotificationsState';
import './NotificationBanner.css';

interface NotificationBannerProps {
  notifications: NotificationsState;
  onOpen: () => void;
}

/**
 * Banner não intrusivo (reproduz o comportamento de uma notificação de
 * CarPlay): aparece no topo do stage sobre qualquer app, sem bloquear a
 * interação por baixo, e some sozinho. Distinto do cartão do Assistente de
 * Voz (ver VoiceAssistantOverlay) — este é só para Notificações.
 */
export function NotificationBanner({ notifications, onOpen }: NotificationBannerProps) {
  const { banner, dismissBanner } = notifications;
  if (!banner) return null;

  return (
    <button type="button" className="notification-banner" onClick={dismissBanner}>
      <NotificationGlyph />
      <div className="notification-banner__body">
        <span className="notification-banner__title">{banner.title}</span>
        <span className="notification-banner__text">{banner.body}</span>
      </div>
      <span
        className="notification-banner__open"
        onClick={(e) => {
          e.stopPropagation();
          dismissBanner();
          onOpen();
        }}
      >
        Ver
      </span>
    </button>
  );
}
