import { BackButton } from '../BackButton/BackButton';
import { IosListGroup, IosListRow } from '../ios/IosListGroup';
import type { NotificationsState } from '../../hooks/useNotificationsState';
import type { NotificationItem } from '../../data/notificationsMock';
import './NotificacoesScreen.css';

interface NotificacoesScreenProps {
  onBack: () => void;
  notifications: NotificationsState;
}

const GROUP_ICON: Record<string, { icon: string; color: string }> = {
  Veículo: { icon: '🚛', color: 'var(--ios-blue)' },
  Trabalho: { icon: '📦', color: 'var(--ios-orange)' },
  Esportes: { icon: '⚽', color: 'var(--ios-green)' },
  Sistema: { icon: '⚙️', color: 'var(--ios-gray)' },
};

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
        <h1 className="ios-large-title">Notificações</h1>
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
          <p className="ios-body">Nenhuma notificação.</p>
          <button type="button" className="notificacoes-screen__action" onClick={restoreDemo}>
            Repor notificações de exemplo (teste)
          </button>
        </div>
      ) : (
        <div className="notificacoes-screen__list">
          {Object.entries(groups).map(([group, groupItems]) => {
            const style = GROUP_ICON[group] ?? { icon: '🔔', color: 'var(--ios-gray)' };
            return (
              <IosListGroup key={group} header={group}>
                {groupItems.map((n) => (
                  <IosListRow
                    key={n.id}
                    icon={style.icon}
                    iconBg={style.color}
                    label={n.title}
                    sublabel={n.body}
                    value={n.time}
                    trailing={
                      <span className="notificacoes-screen__row-trailing">
                        {!n.read && <span className="notificacoes-screen__dot" aria-hidden="true" />}
                        <button
                          type="button"
                          className="notificacoes-screen__remove"
                          aria-label="Remover notificação"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearOne(n.id);
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    }
                    onClick={() => markRead(n.id)}
                  />
                ))}
              </IosListGroup>
            );
          })}
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
