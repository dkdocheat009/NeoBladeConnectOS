export interface Trip {
  id: string;
  dateLabel: string;
  period: 'semana' | 'mes';
  origin: string;
  destination: string;
  distanceKm: number;
  durationMin: number;
  fuelL: number;
  avgConsumption: number;
  notes?: string;
}

// Histórico de viagens 100% fictício (dados locais de exemplo) — sem GPS
// real nem integração com o ETS2. Datas/rótulos são apenas ilustrativos.
export const tripsMock: Trip[] = [
  {
    id: 't1',
    dateLabel: 'Hoje',
    period: 'semana',
    origin: 'Rotterdam',
    destination: 'Frankfurt am Main',
    distanceKm: 412,
    durationMin: 343,
    fuelL: 132,
    avgConsumption: 3.12,
    notes: 'Entrega no cliente com empilhadeira própria.',
  },
  {
    id: 't2',
    dateLabel: 'Ontem',
    period: 'semana',
    origin: 'Antuérpia',
    destination: 'Rotterdam',
    distanceKm: 98,
    durationMin: 85,
    fuelL: 29,
    avgConsumption: 2.96,
  },
  {
    id: 't3',
    dateLabel: 'Esta semana',
    period: 'semana',
    origin: 'Amsterdã',
    destination: 'Antuérpia',
    distanceKm: 161,
    durationMin: 120,
    fuelL: 47,
    avgConsumption: 2.92,
    notes: 'Coleta no porto, 18 paletes.',
  },
  {
    id: 't4',
    dateLabel: 'Este mês',
    period: 'mes',
    origin: 'Hamburgo',
    destination: 'Amsterdã',
    distanceKm: 453,
    durationMin: 365,
    fuelL: 140,
    avgConsumption: 3.09,
  },
  {
    id: 't5',
    dateLabel: 'Este mês',
    period: 'mes',
    origin: 'Munique',
    destination: 'Hamburgo',
    distanceKm: 612,
    durationMin: 470,
    fuelL: 189,
    avgConsumption: 3.09,
  },
];
