export interface MessageItem {
  id: string;
  sender: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  replied?: string;
}

// Conteúdo 100% fictício (estado local/mock) — sem integração real com
// SMS/WhatsApp/contatos. Nomes e textos são apenas de demonstração.
export const initialMessages: MessageItem[] = [
  {
    id: 'm1',
    sender: 'Disponente',
    preview: 'Confirma a chegada em Amsterdã amanhã?',
    body: 'Confirma a chegada em Amsterdã amanhã de manhã? O cliente quer saber se precisa reorganizar a doca de descarga.',
    time: '08:12',
    read: false,
  },
  {
    id: 'm2',
    sender: 'Oficina Central',
    preview: 'Revisão agendada para sexta-feira',
    body: 'A revisão preventiva do cavalo mecânico ficou agendada para sexta-feira às 14h. Avise se precisar remarcar.',
    time: '07:40',
    read: false,
  },
  {
    id: 'm3',
    sender: 'Spedition Nord',
    preview: 'Novo frete disponível na rota de retorno',
    body: 'Surgiu um frete de retorno saindo de Rotterdam, carga geral, 18 paletes. Quer que eu reserve?',
    time: 'Ontem 19:05',
    read: true,
  },
  {
    id: 'm4',
    sender: 'Disponente',
    preview: 'Documentos da carga enviados',
    body: 'Os documentos da carga (CMR e nota fiscal) já foram enviados para o seu e-mail cadastrado.',
    time: 'Ontem 16:22',
    read: true,
  },
];
