import { BackButton } from '../BackButton/BackButton';
import type { NotificationsState } from '../../hooks/useNotificationsState';
import type { NotificationItem } from '../../data/notificationsMock';
import './NotificacoesScreen.css';

interface NotificacoesScreenProps {
  onBack: () => void;
  notifications: NotificationsState;
}

/**
 * App Notificações (dock/Home). Estados: 1) lista agrupada por app; 2)
 * banner transitório sobre outros apps (ver NotificationBanner, acionado
 * aqui por "Simular notificação"); 3) marcar como lida (reflete no badge);
 * 4) apagar/limpar; 5) estado vazio. Tudo em store comum — nenhuma
 * notificação fica embutida permanentemente nos ícones.
 */
export function NotificacoesScreen({ onBack, notifications }: NotificacoesScreenProps) {
  const { notifications: items, markRead, markAllRead, clearOne, clearAll, restoreDemo, simulateIncoming } =
    notifications;

  const groups = groupBy(items);

  return (
    <div className="notificacoes-screen">
      <BackButton onClick={onBack} />

      <header className="notificacoes-screen__header">
        <h1 className="notificacoes-screen__title">Notificações</h1>
        <div className="notificacoes-screen__actions">
          <button type="button" onClick={simulateIncoming}>
            Simular notificação (teste)
          </button>
          <button type="button" onClick={markAllRead} disabled={items.length === 0}>
            Marcar todas como lidas
          </button>
          <button type="button" className="is-danger" onClick={clearAll} disabled={items.length === 0}>
            Limpar tudo
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="notificacoes-screen__empty">
          <span className="notificacoes-screen__empty-icon">🔔</span>
          <p>Nenhuma notificação.</p>
          <button type="button" className="notificacoes-screen__action" onClick={restoreDemo}>
            Repor notificações de exemplo (teste)
          </button>
        </div>
      ) : (
        <div className="notificacoes-screen__list">
          {Object.entries(groups).map(([group, groupItems]) => (
            <section key={group} className="notificacoes-screen__group">
              <h2 className="notificacoes-screen__group-title">{group}</h2>
              {groupItems.map((n) => (
                <div key={n.id} className={`notificacoes-screen__item${n.read ? '' : ' is-unread'}`}>
                  {!n.read && <span className="notificacoes-screen__dot" aria-hidden="true" />}
                  <div className="notificacoes-screen__item-body" onClick={() => markRead(n.id)}>
                    <span className="notificacoes-screen__item-title">{n.title}</span>
                    <span className="notificacoes-screen__item-text">{n.body}</span>
                    <span className="notificacoes-screen__item-time">{n.time}</span>
                  </div>
                  <button
                    type="button"
                    className="notificacoes-screen__remove"
                    aria-label="Remover notificação"
                    onClick={() => clearOne(n.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupBy(items: NotificationItem[]): Record<string, NotificationItem[]> {
  const out: Record<string, NotificationItem[]> = {};
  for (const item of items) {
    (out[item.group] ??= []).push(item);
  }
  return out;
}
