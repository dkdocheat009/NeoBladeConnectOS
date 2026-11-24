export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  location?: string;
  notes?: string;
  hasDemoNav?: boolean;
}

export interface CalendarDay {
  dayOffset: number;
  label: string;
  events: CalendarEvent[];
}

const WEEKDAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Agenda 100% fictícia (estado mock) — o dia 0 é sempre "hoje" (data real
// do sistema); o offset +2 é deliberadamente vazio para demonstrar o
// estado "nenhum compromisso" de forma determinística.
const SEED: Record<number, CalendarEvent[]> = {
  0: [
    { id: 'e1', time: '09:00', title: 'Carregamento — Depósito Central', location: 'Rotterdam', notes: 'Doca 4, chegar 15 min antes.' },
    {
      id: 'e2',
      time: '19:00',
      title: 'Entrega — Cliente Frankfurt',
      location: 'Frankfurt am Main',
      notes: 'Descarga com empilhadeira própria do cliente.',
      hasDemoNav: true,
    },
  ],
  1: [
    { id: 'e3', time: '08:00', title: 'Revisão preventiva', location: 'Oficina Central', notes: 'Troca de óleo e filtros.' },
  ],
  2: [],
  3: [
    {
      id: 'e4',
      time: '14:30',
      title: 'Coleta — Porto de Amsterdã',
      location: 'Amsterdã',
      notes: 'Carga: 18 paletes, documentação CMR já emitida.',
      hasDemoNav: true,
    },
  ],
  4: [{ id: 'e5', time: '10:00', title: 'Inspeção de segurança anual', location: 'Posto de fiscalização' }],
};

export function buildAgenda(today: Date): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let offset = 0; offset <= 4; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const label = offset === 0 ? 'Hoje' : offset === 1 ? 'Amanhã' : WEEKDAYS_PT[d.getDay()];
    days.push({ dayOffset: offset, label, events: SEED[offset] ?? [] });
  }
  return days;
}
