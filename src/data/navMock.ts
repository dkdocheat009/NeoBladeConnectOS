// Dados 100% fictícios para o módulo de Navegação (reproduz
// navi-dunkel.png / navi-hell.png / karte-3d.png). Não há GPS, mapa real
// nem integração com TruckSimMap/ETS2 — apenas uma rota mock fixa usada
// para desenhar o traçado em SVG e preencher os cartões de instrução.
export const mockRoute = {
  instruction: 'Mantenha-se à esquerda',
  instructionIcon: 'left' as const,
  distanceToTurn: '1,4 km',
  roadShield: 'E35',
  roadDestination: 'Amsterdã',
  upcomingLanes: [true, true, false] as const,
  nextShields: ['E19', 'E35'],
  currentRoad: 'A1',
  sideShield: 'E231',
  speedLimitKmh: 90,
  currentSpeedKmh: 88,
  arrivalTime: '19:49',
  remainingDuration: '5 h 43 min',
  remainingDistanceKm: 412,
  destinationLabel: 'Frankfurt am Main',
};

export interface RadarAlert {
  distanceM: number;
  type: string;
  speedLimitKmh: number;
}

// Estado "radar à frente" — ativado manualmente para demonstração (ver
// RadarScreen). Nenhum serviço real de radar é consultado.
export const mockRadarAhead: RadarAlert = {
  distanceM: 650,
  type: 'Radar fixo',
  speedLimitKmh: 90,
};
