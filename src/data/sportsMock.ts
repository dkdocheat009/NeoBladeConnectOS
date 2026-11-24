// Dados 100% fictícios para o app Esportes (Fase 4). Reproduz a
// composição de sport.png / de/sports.png (também en/sports.png): seletor
// de ligas, grade de partidas, alternância Jogos/Tabela. Ligas, clubes,
// datas e placares são inventados — sem API esportiva real. Os "escudos"
// são apenas iniciais em um círculo colorido (não imitam escudos oficiais).

export interface Club {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface Scorer {
  clubId: string;
  player: string;
  minute: number;
}

export interface Match {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  scorers: Scorer[];
}

export interface League {
  id: string;
  name: string;
  code: string;
  color: string;
  matchday: string;
  matches: Match[];
}

const club = (id: string, name: string, code: string, color: string): Club => ({
  id,
  name,
  code,
  color,
});

export const clubs: Club[] = [
  club('porto-vermelho', 'Porto Vermelho', 'PV', '#d1333f'),
  club('uniao-central', 'União Central', 'UC', '#2d5fb0'),
  club('atletico-norte', 'Atlético Norte', 'AN', '#1f9d55'),
  club('estrela-azul', 'Estrela Azul', 'EA', '#2c6ed5'),
  club('dragoes', 'Dragões FC', 'DR', '#8e3fd1'),
  club('leoes-do-vale', 'Leões do Vale', 'LV', '#d19a2d'),
  club('real-fronteira', 'Real Fronteira', 'RF', '#1b1b1f'),
  club('gremio-litoral', 'Grêmio Litoral', 'GL', '#17a085'),
  club('ferroviario', 'Ferroviário', 'FE', '#6b7280'),
  club('independente', 'Independente', 'IN', '#d1333f'),
  club('vila-nova', 'Vila Nova AC', 'VN', '#2d8f3f'),
  club('montanha-fc', 'Montanha FC', 'MF', '#4a4ad1'),
  club('costa-dourada', 'Costa Dourada', 'CD', '#d19a2d'),
  club('rio-grande-ec', 'Rio Grande EC', 'RG', '#1f9d9d'),
  club('cruzeiro-norte', 'Cruzeiro Norte', 'CN', '#2d5fb0'),
  club('alvinegro', 'Alvinegro EC', 'AL', '#2b2b2b'),
  club('tempestade-fc', 'Tempestade FC', 'TF', '#5a5ad6'),
  club('uniao-vermelha', 'União Vermelha', 'UV', '#c23048'),
  club('sol-nascente', 'Sol Nascente', 'SN', '#d1a62d'),
  club('bastiao-fc', 'Bastião FC', 'BA', '#3f8f6d'),
];

function clubById(id: string): Club {
  const found = clubs.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown mock club id: ${id}`);
  return found;
}

function match(
  id: string,
  home: string,
  away: string,
  homeScore: number | null,
  awayScore: number | null,
  status: string,
  scorers: Scorer[] = [],
): Match {
  return { id, home, away, homeScore, awayScore, status, scorers };
}

export const leagues: League[] = [
  {
    id: 'nacional',
    name: 'Liga Nacional',
    code: 'LN',
    color: '#d1333f',
    matchday: '8ª Rodada',
    matches: [
      match('n1', 'porto-vermelho', 'uniao-central', 4, 1, 'Fim · 1ºT 3:0', [
        { clubId: 'porto-vermelho', player: 'Mota', minute: 46 },
        { clubId: 'uniao-central', player: 'Campos', minute: 91 },
      ]),
      match('n2', 'estrela-azul', 'leoes-do-vale', 2, 4, 'Fim · 1ºT 1:2', []),
      match('n3', 'atletico-norte', 'dragoes', 1, 2, 'Fim · 1ºT 1:0', []),
      match('n4', 'real-fronteira', 'gremio-litoral', 0, 0, 'Fim · 1ºT 0:0', []),
      match('n5', 'ferroviario', 'independente', 2, 0, 'Fim · 1ºT 0:0', []),
      match('n6', 'vila-nova', 'montanha-fc', 0, 2, 'Fim · 1ºT 0:0', []),
      match('n7', 'costa-dourada', 'rio-grande-ec', 1, 1, 'Fim · 1ºT 1:0', []),
      match('n8', 'cruzeiro-norte', 'alvinegro', 3, 1, 'Fim · 1ºT 1:0', []),
      match('n9', 'tempestade-fc', 'uniao-vermelha', 1, 1, 'Fim · 1ºT 1:0', []),
      match('n10', 'sol-nascente', 'bastiao-fc', 2, 2, 'Hoje 21:00', []),
    ],
  },
  {
    id: 'nacional2',
    name: 'Liga Nacional 2',
    code: 'LN2',
    color: '#6b7280',
    matchday: '6ª Rodada',
    matches: [
      match('n2-1', 'alvinegro', 'bastiao-fc', 1, 0, 'Fim · 1ºT 0:0', []),
      match('n2-2', 'montanha-fc', 'uniao-vermelha', 2, 2, 'Fim · 1ºT 1:1', []),
      match('n2-3', 'rio-grande-ec', 'sol-nascente', 0, 1, 'Fim · 1ºT 0:0', []),
      match('n2-4', 'ferroviario', 'vila-nova', 3, 2, 'Fim · 1ºT 2:1', []),
    ],
  },
  {
    id: 'campeoes',
    name: 'Copa dos Campeões',
    code: 'CC',
    color: '#2c3e75',
    matchday: 'Fase de Grupos · Rodada 3',
    matches: [
      match('c1', 'porto-vermelho', 'dragoes', 2, 2, 'Fim · 1ºT 1:1', []),
      match('c2', 'estrela-azul', 'cruzeiro-norte', 1, 0, 'Fim · 1ºT 0:0', []),
      match('c3', 'gremio-litoral', 'tempestade-fc', 0, 3, 'Fim · 1ºT 0:2', []),
      match('c4', 'leoes-do-vale', 'real-fronteira', 2, 1, 'Fim · 1ºT 1:1', []),
    ],
  },
  {
    id: 'continental',
    name: 'Copa Continental',
    code: 'CON',
    color: '#e67e22',
    matchday: 'Fase de Grupos · Rodada 3',
    matches: [
      match('co1', 'independente', 'costa-dourada', 1, 1, 'Fim · 1ºT 1:0', []),
      match('co2', 'vila-nova', 'uniao-central', 0, 2, 'Fim · 1ºT 0:1', []),
      match('co3', 'atletico-norte', 'sol-nascente', 3, 0, 'Fim · 1ºT 2:0', []),
      match('co4', 'montanha-fc', 'alvinegro', 1, 2, 'Fim · 1ºT 0:1', []),
    ],
  },
  {
    id: 'federal',
    name: 'Copa Federal',
    code: 'CF',
    color: '#27ae60',
    matchday: 'Oitavas de Final',
    matches: [
      match('f1', 'bastiao-fc', 'porto-vermelho', 0, 3, 'Fim · 1ºT 0:2', []),
      match('f2', 'uniao-vermelha', 'estrela-azul', 1, 1, 'Fim · 1ºT 0:0', []),
      match('f3', 'rio-grande-ec', 'dragoes', 2, 2, 'Fim · 1ºT 1:1', []),
      match('f4', 'ferroviario', 'leoes-do-vale', 0, 1, 'Fim · 1ºT 0:0', []),
    ],
  },
  {
    id: 'insular',
    name: 'Liga Insular',
    code: 'LI',
    color: '#c2347d',
    matchday: '12ª Rodada',
    matches: [
      match('i1', 'cruzeiro-norte', 'tempestade-fc', 2, 0, 'Fim · 1ºT 1:0', []),
      match('i2', 'gremio-litoral', 'real-fronteira', 1, 2, 'Fim · 1ºT 0:1', []),
      match('i3', 'costa-dourada', 'independente', 0, 0, 'Fim · 1ºT 0:0', []),
      match('i4', 'sol-nascente', 'atletico-norte', 1, 3, 'Fim · 1ºT 1:1', []),
    ],
  },
  {
    id: 'americano',
    name: 'Liga das Américas',
    code: 'LA',
    color: '#1f3a5f',
    matchday: 'Semana 9',
    matches: [
      match('a1', 'alvinegro', 'montanha-fc', 1, 1, 'Fim · 1ºT 1:0', []),
      match('a2', 'uniao-vermelha', 'bastiao-fc', 2, 1, 'Fim · 1ºT 1:1', []),
      match('a3', 'vila-nova', 'rio-grande-ec', 0, 1, 'Fim · 1ºT 0:0', []),
      match('a4', 'dragoes', 'ferroviario', null, null, 'Hoje 21:30', []),
    ],
  },
  {
    id: 'atlantica',
    name: 'Liga Atlântica',
    code: 'LAT',
    color: '#16a085',
    matchday: '4ª Rodada',
    matches: [
      match('at1', 'real-fronteira', 'costa-dourada', 2, 0, 'Fim · 1ºT 1:0', []),
      match('at2', 'leoes-do-vale', 'sol-nascente', 1, 1, 'Fim · 1ºT 1:0', []),
      match('at3', 'independente', 'gremio-litoral', 0, 2, 'Fim · 1ºT 0:1', []),
      match('at4', 'estrela-azul', 'porto-vermelho', 1, 1, 'Fim · 1ºT 0:1', []),
    ],
  },
];

export interface StandingRow {
  club: Club;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

/** Tabela derivada deterministicamente das partidas já finalizadas da liga. */
export function buildStandings(league: League): StandingRow[] {
  const table = new Map<string, StandingRow>();

  const ensure = (id: string) => {
    if (!table.has(id)) {
      table.set(id, {
        club: clubById(id),
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      });
    }
    return table.get(id)!;
  };

  for (const m of league.matches) {
    if (m.homeScore === null || m.awayScore === null) continue;
    const home = ensure(m.home);
    const away = ensure(m.away);
    home.played += 1;
    away.played += 1;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (m.homeScore < m.awayScore) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return [...table.values()].sort(
    (a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst),
  );
}

export { clubById };
