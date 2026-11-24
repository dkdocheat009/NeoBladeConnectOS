export interface NotificationItem {
  id: string;
  group: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// Conteúdo 100% fictício (estado local/mock) — reflete eventos dos outros
// apps de demonstração (Veículo/Trabalho/Esportes), nunca alertas reais do
// sistema operacional ou do caminhão.
export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    group: 'Veículo',
    title: 'Revisão em breve',
    body: 'Faltam 1.200 km para a próxima revisão preventiva.',
    time: '07:55',
    read: false,
  },
  {
    id: 'n2',
    group: 'Trabalho',
    title: 'Parada recomendada',
    body: 'Próxima parada de descanso em 45 km, dentro do limite legal de direção.',
    time: '07:10',
    read: false,
  },
  {
    id: 'n3',
    group: 'Esportes',
    title: 'Partida de hoje',
    body: 'Seu time acompanhado joga hoje às 21h (ver app Esportes).',
    time: 'Ontem 20:00',
    read: true,
  },
  {
    id: 'n4',
    group: 'Sistema',
    title: 'Atualização aplicada',
    body: 'O NeoBladeConnectOS foi atualizado para a versão mais recente.',
    time: 'Ontem 09:00',
    read: true,
  },
];

export const simulatedNotification: NotificationItem = {
  id: 'n-sim',
  group: 'Veículo',
  title: 'Alerta de combustível',
  body: 'Nível de combustível abaixo de 20% — próximo posto em 12 km.',
  time: 'Agora',
  read: false,
};
