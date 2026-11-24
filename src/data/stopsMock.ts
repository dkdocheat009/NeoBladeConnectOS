export interface Stop {
  id: string;
  name: string;
  type: 'posto' | 'descanso';
  distanceKm: number;
  address: string;
  amenities: string[];
  priceDemo?: string;
  rating: number;
  hours: string;
}

// Postos e áreas de descanso 100% fictícios (estado mock/demonstração) —
// sem GPS real, sem integração com serviços de localização.
export const stopsMock: Stop[] = [
  {
    id: 's1',
    name: 'Posto Estrada Norte',
    type: 'posto',
    distanceKm: 4.2,
    address: 'BR-101, km 212',
    amenities: ['Diesel S10', 'AdBlue', 'Loja de conveniência', 'Banheiro'],
    priceDemo: 'R$ 6,19/L (demo)',
    rating: 4.3,
    hours: '24 horas',
  },
  {
    id: 's2',
    name: 'Área de Descanso Vale Verde',
    type: 'descanso',
    distanceKm: 9.8,
    address: 'BR-101, km 228',
    amenities: ['Estacionamento para caminhões', 'Chuveiros', 'Restaurante'],
    rating: 4.6,
    hours: '24 horas',
  },
  {
    id: 's3',
    name: 'Posto Rota do Sol',
    type: 'posto',
    distanceKm: 15.1,
    address: 'BR-376, km 48',
    amenities: ['Diesel comum', 'Diesel S10', 'Troca de óleo'],
    priceDemo: 'R$ 6,05/L (demo)',
    rating: 3.9,
    hours: '05h–23h',
  },
  {
    id: 's4',
    name: 'Descanso Beira Rio',
    type: 'descanso',
    distanceKm: 22.4,
    address: 'BR-376, km 61',
    amenities: ['Chuveiros', 'Praça de alimentação', 'Wi-Fi (demo)'],
    rating: 4.1,
    hours: '24 horas',
  },
  {
    id: 's5',
    name: 'Posto Serra Azul',
    type: 'posto',
    distanceKm: 31.7,
    address: 'BR-376, km 79',
    amenities: ['Diesel S10', 'AdBlue', 'Calibragem de pneus'],
    priceDemo: 'R$ 6,24/L (demo)',
    rating: 4.0,
    hours: '24 horas',
  },
];
