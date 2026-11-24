import { useState } from 'react';
import { initialMessages, type MessageItem } from '../data/messagesMock';

/**
 * Estado local (em memória, não persistido) das Mensagens — compartilhado
 * entre a Home (badge) e a tela Mensagens. Sem integração real com
 * SMS/WhatsApp/contatos; "enviar" uma resposta é só uma confirmação
 * simulada (ver MensagensScreen).
 */
export function useMessagesState() {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);

  const unreadCount = messages.filter((m) => !m.read).length;

  const markRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAll = () => setMessages([]);

  const restoreDemo = () => setMessages(initialMessages);

  const replySimulated = (id: string, text: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, replied: text, read: true } : m)));
  };

  return { messages, unreadCount, markRead, markAllRead, deleteMessage, clearAll, restoreDemo, replySimulated };
}

export type MessagesState = ReturnType<typeof useMessagesState>;
