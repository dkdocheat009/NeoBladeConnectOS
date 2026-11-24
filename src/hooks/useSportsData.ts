import { useEffect, useState } from 'react';
import {
  getCompetitionMatches,
  getCompetitionStandings,
  type ApiMatch,
  type ApiStandingGroup,
  type SportsResult,
} from '../data/sportsApi';

/**
 * Busca jogos + tabela de uma competição real (BSA/CL) via
 * src/data/sportsApi.ts. Estados honestos (sem chave/sem dados/erro) são
 * repassados como vieram da API — o chamador (EsportesScreen) decide como
 * exibi-los, nunca inventa um estado "ao vivo" ou placar por conta própria.
 */
export function useSportsData(code: string) {
  const [matches, setMatches] = useState<SportsResult<ApiMatch[]> | null>(null);
  const [standings, setStandings] = useState<SportsResult<ApiStandingGroup[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMatches(null);
    setStandings(null);

    Promise.all([getCompetitionMatches(code), getCompetitionStandings(code)]).then(([m, s]) => {
      if (cancelled) return;
      setMatches(m);
      setStandings(s);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [code, reloadToken]);

  return { matches, standings, loading, reload: () => setReloadToken((t) => t + 1) };
}
