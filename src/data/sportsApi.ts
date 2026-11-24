// Cliente para a football-data.org (https://www.football-data.org/, docs
// docs.football-data.org/general/v4/) — fonte real de dados para o módulo
// Esportes (Fase 5). O token NUNCA chega ao navegador: toda chamada vai
// para "/api/football/..." (mesma origem), que o proxy de dev/preview do
// Vite (ver vite.config.ts) repassa para a API acrescentando o header
// X-Auth-Token a partir de uma variável de ambiente do servidor. Plano
// gratuito: 10 chamadas/min — por isso o cache abaixo evita refazer a
// mesma consulta com frequência.
export interface SportsCompetition {
  code: 'BSA' | 'CL';
  name: string;
}

export const SPORTS_COMPETITIONS: SportsCompetition[] = [
  { code: 'BSA', name: 'Campeonato Brasileiro Série A' },
  { code: 'CL', name: 'UEFA Champions League' },
];

export interface ApiTeam {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | POSTPONED | SUSPENDED | CANCELLED
  matchday: number | null;
  stage: string | null;
  group: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
  };
}

export interface ApiStandingRow {
  position: number;
  team: ApiTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface ApiStandingGroup {
  stage: string;
  type: string;
  group: string | null;
  table: ApiStandingRow[];
}

export interface CompetitionData {
  competitionName: string;
  season: string | null;
  lastUpdatedAt: string;
}

export type SportsResult<T> =
  | { status: 'ok'; data: T; meta: CompetitionData }
  | { status: 'no-key' }
  | { status: 'rate-limited' }
  | { status: 'empty'; meta: CompetitionData }
  | { status: 'error'; message: string };

const CACHE_TTL_MS = 90_000;
const cache = new Map<string, { at: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

async function fetchWithCache<T>(path: string): Promise<SportsResult<T>> {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value as SportsResult<T>;
  }
  const pending = inFlight.get(path);
  if (pending) return pending as Promise<SportsResult<T>>;

  const promise = (async (): Promise<SportsResult<T>> => {
    let response: Response;
    try {
      response = await fetch(`/api/football${path}`);
    } catch {
      return { status: 'error', message: 'Sem conexão com a internet.' };
    }

    if (response.status === 503) return { status: 'no-key' };
    if (response.status === 429) return { status: 'rate-limited' };
    if (!response.ok) {
      return { status: 'error', message: `Falha ao consultar resultados (HTTP ${response.status}).` };
    }

    const body = (await response.json()) as T & Parameters<typeof extractMeta>[0];
    const result: SportsResult<T> = { status: 'ok', data: body, meta: extractMeta(body) };
    cache.set(path, { at: Date.now(), value: result });
    return result;
  })();

  inFlight.set(path, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(path);
  }
}

function extractMeta(body: { competition?: { name?: string }; season?: { startDate?: string; endDate?: string } }): CompetitionData {
  const season = body.season ? `${body.season.startDate?.slice(0, 4)}/${body.season.endDate?.slice(0, 4)}` : null;
  return {
    competitionName: body.competition?.name ?? '',
    season,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export async function getCompetitionMatches(code: string): Promise<SportsResult<ApiMatch[]>> {
  const result = await fetchWithCache<{ matches: ApiMatch[] } & Parameters<typeof extractMeta>[0]>(
    `/competitions/${code}/matches`,
  );
  if (result.status !== 'ok') return result;
  const matches = result.data.matches ?? [];
  if (matches.length === 0) return { status: 'empty', meta: result.meta };
  return { status: 'ok', data: matches, meta: result.meta };
}

export async function getCompetitionStandings(code: string): Promise<SportsResult<ApiStandingGroup[]>> {
  const result = await fetchWithCache<{ standings: ApiStandingGroup[] } & Parameters<typeof extractMeta>[0]>(
    `/competitions/${code}/standings`,
  );
  if (result.status !== 'ok') return result;
  const standings = result.data.standings ?? [];
  if (standings.length === 0) return { status: 'empty', meta: result.meta };
  return { status: 'ok', data: standings, meta: result.meta };
}
