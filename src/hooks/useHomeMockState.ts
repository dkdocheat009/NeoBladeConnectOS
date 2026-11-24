import { useState } from 'react';
import type { AppDefinition } from '../data/apps';
import { truckBrands } from '../data/truckBrands';

interface UseHomeMockStateOptions {
  onOpenMusic: () => void;
  onOpenRadio: () => void;
  onOpenVeiculo: () => void;
  onOpenTrabalho: () => void;
  onOpenEsportes: () => void;
  onOpenNavegacao: () => void;
  onOpenMensagens: () => void;
  onOpenNotificacoes: () => void;
  onOpenCalendario: () => void;
  onOpenParadas: () => void;
  onOpenDiario: () => void;
}

/**
 * Mock/demo state for the Home shortcuts that need it (marca do veículo).
 * Lives above HomeScreen (in Shell) so it survives switching to the
 * Dashboard and back. Badges de Mensagens/Notificações agora vêm dos
 * stores reais (useMessagesState/useNotificationsState, lifted no Shell) —
 * não há mais um ciclo de contagem mock aqui (Fase 6).
 */
export function useHomeMockState({
  onOpenMusic,
  onOpenRadio,
  onOpenVeiculo,
  onOpenTrabalho,
  onOpenEsportes,
  onOpenNavegacao,
  onOpenMensagens,
  onOpenNotificacoes,
  onOpenCalendario,
  onOpenParadas,
  onOpenDiario,
}: UseHomeMockStateOptions) {
  const [truckBrandIndex, setTruckBrandIndex] = useState(0);

  const cycleTruckBrand = () => {
    setTruckBrandIndex((index) => (index + 1) % truckBrands.length);
  };

  const handleOpenApp = (app: AppDefinition) => {
    if (app.id === 'google-maps') {
      onOpenNavegacao();
      return;
    }
    if (app.id === 'spotify') {
      onOpenMusic();
      return;
    }
    if (app.id === 'radio') {
      onOpenRadio();
      return;
    }
    if (app.id === 'fahrzeug') {
      onOpenVeiculo();
      return;
    }
    if (app.id === 'auftrag') {
      onOpenTrabalho();
      return;
    }
    if (app.id === 'esportes') {
      onOpenEsportes();
      return;
    }
    if (app.id === 'nachrichten') {
      onOpenMensagens();
      return;
    }
    if (app.id === 'mitteilungen') {
      onOpenNotificacoes();
      return;
    }
    if (app.id === 'kalender') {
      onOpenCalendario();
      return;
    }
    if (app.id === 'tanken-rasten') {
      onOpenParadas();
      return;
    }
    if (app.id === 'fahrtenbuch') {
      onOpenDiario();
      return;
    }
    // Nenhuma outra tela/app foi implementada ainda — apenas o feedback de
    // toque (ver AppIcon) acontece, sem navegar para telas inventadas.
    console.info(`[NeoBladeConnectOS] "${app.label}" ainda não implementado.`);
  };

  return {
    currentTruckBrand: truckBrands[truckBrandIndex],
    cycleTruckBrand,
    handleOpenApp,
  };
}
