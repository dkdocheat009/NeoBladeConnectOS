// Dados 100% mock/determinísticos para o app Trabalho (Fase 4). Reproduz
// os campos vistos em auftrag.png / de/job.png (também en/job.png) — sem
// fretes reais nem telemetria.

export interface ActiveJob {
  marketLabel: string;
  origin: string;
  originCompany: string;
  destination: string;
  destinationCompany: string;
  cargoName: string;
  cargoWeightT: number;
  payEUR: number;
  costsEUR: number;
  distanceKm: number;
  cargoDamagePct: number;
  remainingKm: number;
  arrival: string;
  onTime: boolean;
  deadline: string;
  bufferLabel: string;
  trailerType: string;
  nextBreak: {
    label: string;
    distanceKm: number;
    etaTime: string;
    place: string;
    amenities: string[];
  };
}

export const activeJob: ActiveJob = {
  marketLabel: 'Mercado de Fretes',
  origin: 'Duisburg',
  originCompany: 'Kaarfor',
  destination: 'Amsterdam',
  destinationCompany: 'Tree-ET',
  cargoName: 'Iogurte (refrigerado)',
  cargoWeightT: 18.2,
  payEUR: 18450,
  costsEUR: 0,
  distanceKm: 430,
  cargoDamagePct: 1,
  remainingKm: 411,
  arrival: 'Qua 19:49',
  onTime: true,
  deadline: 'Qua 23:30',
  bufferLabel: '3 h 40 min',
  trailerType: 'Semirreboque Frigorífico',
  nextBreak: {
    label: '5 h 12 min',
    distanceKm: 67,
    etaTime: '15:02',
    place: 'Área de descanso em Amsterdam',
    amenities: ['Combustível', 'Restaurante', 'Chuveiros'],
  },
};
