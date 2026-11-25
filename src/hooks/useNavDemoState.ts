import { useState } from 'react';

export interface NavStep {
  instruction: string;
  distanceToTurn: string;
  roadShield: string;
  roadDestination: string;
}

// Manobras 100% fictícias (estado de demonstração) — compartilhadas entre
// o MapPanel/NavCard do Dashboard e a tela cheia de Navegação, para que os
// três sempre mostrem a mesma manobra/distância/destino. Sem GPS real.
export const NAV_STEPS: NavStep[] = [
  { instruction: 'Saída à direita', distanceToTurn: '1,5 km', roadShield: 'A50', roadDestination: 'Amsterdam' },
  { instruction: 'Mantenha-se à esquerda', distanceToTurn: '1,4 km', roadShield: 'E35', roadDestination: 'Amsterdã' },
  { instruction: 'Siga em frente', distanceToTurn: '3,2 km', roadShield: 'A1', roadDestination: 'Amsterdã' },
];

/**
 * Estado demonstrativo de navegação compartilhado (Fase 8) — o cartão do
 * Dashboard (`NavCard`) e a tela cheia (`NavegacaoScreen`) consomem o
 * mesmo `step`/`routeActive`, então iniciar/encerrar a rota ou avançar a
 * manobra em qualquer um dos dois reflete no outro. Continua inteiramente
 * mock: nenhuma integração com GPS/TruckSimMap/ETS2.
 */
export function useNavDemoState() {
  const [stepIndex, setStepIndex] = useState(0);
  const [routeActive, setRouteActive] = useState(true);

  const nextInstruction = () => setStepIndex((i) => (i + 1) % NAV_STEPS.length);
  const startRoute = () => setRouteActive(true);
  const endRoute = () => setRouteActive(false);

  return {
    step: NAV_STEPS[stepIndex],
    stepIndex,
    totalSteps: NAV_STEPS.length,
    routeActive,
    nextInstruction,
    startRoute,
    endRoute,
  };
}

export type NavDemoState = ReturnType<typeof useNavDemoState>;
