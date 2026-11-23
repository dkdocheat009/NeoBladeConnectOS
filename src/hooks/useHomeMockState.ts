import { useState } from 'react';
import type { AppDefinition } from '../data/apps';
import { truckBrands } from '../data/truckBrands';

const MOCK_BADGE_CYCLE = [0, 1, 2, 5];

/**
 * Mock/demo state for the Home shortcuts that need it (badges, marca do
 * veículo). Lives above HomeScreen (in Shell) so it survives switching to
 * the Dashboard and back — only the edit-mode UI itself resets per visit.
 */
export function useHomeMockState() {
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({
    mitteilungen: 0,
    nachrichten: 2,
  });
  const [truckBrandIndex, setTruckBrandIndex] = useState(0);

  const cycleBadge = (id: string) => {
    setBadgeCounts((prev) => {
      const current = prev[id] ?? 0;
      const idx = MOCK_BADGE_CYCLE.indexOf(current);
      const next = MOCK_BADGE_CYCLE[(idx + 1) % MOCK_BADGE_CYCLE.length];
      return { ...prev, [id]: next };
    });
  };

  const handleOpenApp = (app: AppDefinition) => {
    if (app.id === 'fahrzeug') {
      setTruckBrandIndex((index) => (index + 1) % truckBrands.length);
      return;
    }
    if (app.id === 'mitteilungen' || app.id === 'nachrichten') {
      cycleBadge(app.id);
      return;
    }
    // Fase 2: nenhuma outra tela/app foi implementada ainda — apenas o
    // feedback de toque (ver AppIcon) acontece, sem navegar para telas
    // inventadas.
    console.info(`[NeoBladeConnectOS] "${app.label}" ainda não implementado.`);
  };

  return {
    badgeCounts,
    currentTruckBrand: truckBrands[truckBrandIndex],
    handleOpenApp,
  };
}
