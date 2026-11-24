import { useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { ClubBadge } from './ClubBadge';
import { SPORTS_COMPETITIONS, type ApiMatch, type ApiStandingRow } from '../../data/sportsApi';
import { useSportsData } from '../../hooks/useSportsData';
import { translateStatus, isLiveStatus, formatMatchDate } from '../../data/sportsFormat';
import './EsportesScreen.css';

interface EsportesScreenProps {
  onBack: () => void;
}

/**
 * Reproduz sport.png / de/sports.png (também en/sports.png). Fase 6: só
 * competições REAIS (Campeonato Brasileiro Série A e UEFA Champions
 * League, via football-data.org — ver src/data/sportsApi.ts). A seção de
 * ligas fictícias da Fase 4/5 foi removida por completo: nenhum dado
 * simulado é exibido ou misturado aos resultados reais. Sem chave de API
 * configurada, ou em caso de erro/indisponibilidade, a tela mostra um
 * estado honesto de configuração — nunca um placar ou tabela inventados.
 */
export function EsportesScreen({ onBack }: EsportesScreenProps) {
  const [code, setCode] = useState(SPORTS_COMPETITIONS[0].code);
  const [view, setView] = useState<'jogos' | 'tabela'>('jogos');
  const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);

  return (
    <div className="esportes-screen">
      <BackButton onClick={onBack} />

      <nav className="esportes-screen__sidebar">
        <span className="esportes-screen__section-label">Competições</span>
        {SPORTS_COMPETITIONS.map((c) => (
          <button
            key={c.code}
            type="button"
            className={`esportes-screen__league${code === c.code ? ' is-active' : ''}`}
            onClick={() => {
              setCode(c.code);
              setSelectedMatch(null);
            }}
          >
            <span className="esportes-screen__league-code" style={{ background: '#1f6feb' }}>
              {c.code}
            </span>
            {c.name}
          </button>
        ))}
      </nav>

      <CompetitionPanel code={code} view={view} onChangeView={setView} onSelectMatch={setSelectedMatch} />

      {selectedMatch && (
        <div className="esportes-screen__overlay" onClick={() => setSelectedMatch(null)}>
          <div className="esportes-screen__detail" onClick={(e) => e.stopPropagation()}>
            <div className="esportes-screen__detail-teams">
              <div className="esportes-screen__detail-team">
                <ClubBadge
                  name={selectedMatch.homeTeam.name}
                  code={selectedMatch.homeTeam.tla ?? '?'}
                  crestUrl={selectedMatch.homeTeam.crest}
                  size={56}
                />
                <span>{selectedMatch.homeTeam.shortName ?? selectedMatch.homeTeam.name}</span>
              </div>
              <span className="esportes-screen__detail-score">
                {selectedMatch.score.fullTime.home !== null
                  ? `${selectedMatch.score.fullTime.home} – ${selectedMatch.score.fullTime.away}`
                  : 'a definir'}
              </span>
              <div className="esportes-screen__detail-team">
                <ClubBadge
                  name={selectedMatch.awayTeam.name}
                  code={selectedMatch.awayTeam.tla ?? '?'}
                  crestUrl={selectedMatch.awayTeam.crest}
                  size={56}
                />
                <span>{selectedMatch.awayTeam.shortName ?? selectedMatch.awayTeam.name}</span>
              </div>
            </div>
            <p className="esportes-screen__detail-status">
              {translateStatus(selectedMatch.status)}
              {selectedMatch.stage ? ` · ${selectedMatch.stage}` : ''}
              {' · '}
              {formatMatchDate(selectedMatch.utcDate)}
            </p>
            <button type="button" className="esportes-screen__detail-close" onClick={() => setSelectedMatch(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CompetitionPanelProps {
  code: string;
  view: 'jogos' | 'tabela';
  onChangeView: (v: 'jogos' | 'tabela') => void;
  onSelectMatch: (m: ApiMatch) => void;
}

function CompetitionPanel({ code, view, onChangeView, onSelectMatch }: CompetitionPanelProps) {
  const { matches, standings, loading, reload } = useSportsData(code);
  const competition = SPORTS_COMPETITIONS.find((c) => c.code === code);

  const result = view === 'jogos' ? matches : standings;

  return (
    <section className="esportes-screen__main">
      <div className="esportes-screen__header">
        <div>
          <h1 className="esportes-screen__title">{competition?.name}</h1>
          <span className="esportes-screen__matchday">
            {result?.status === 'ok' && result.meta.season ? `Temporada ${result.meta.season}` : 'football-data.org'}
          </span>
        </div>
        <SegmentedControl
          options={[
            { id: 'jogos', label: 'Jogos' },
            { id: 'tabela', label: 'Tabela' },
          ]}
          value={view}
          onChange={(id) => onChangeView(id as 'jogos' | 'tabela')}
        />
      </div>

      {loading && <div className="esportes-screen__empty">Carregando…</div>}

      {!loading && result?.status === 'no-key' && (
        <div className="esportes-screen__empty">
          <strong>Conecte a fonte de resultados</strong>
          <p>
            Registre uma chave gratuita em{' '}
            <a href="https://www.football-data.org/client/register" target="_blank" rel="noreferrer">
              football-data.org/client/register
            </a>
            , copie <code>.env.example</code> para <code>.env</code>, preencha{' '}
            <code>FOOTBALL_DATA_API_KEY</code> e reinicie <code>npm run dev</code>.
          </p>
          <button type="button" className="esportes-screen__reload" onClick={reload}>
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && (result?.status === 'empty' || result?.status === 'error' || result?.status === 'rate-limited') && (
        <div className="esportes-screen__empty">
          <strong>Sem dados disponíveis</strong>
          <p>
            {result.status === 'rate-limited'
              ? 'Limite de requisições da football-data.org atingido — tente novamente em instantes.'
              : result.status === 'error'
                ? result.message
                : 'A football-data.org não retornou dados para esta consulta agora.'}
          </p>
          <button type="button" className="esportes-screen__reload" onClick={reload}>
            Recarregar
          </button>
        </div>
      )}

      {!loading && view === 'jogos' && matches?.status === 'ok' && (
        <div className="esportes-screen__grid">
          {matches.data.map((m) => (
            <button type="button" key={m.id} className="esportes-screen__match" onClick={() => onSelectMatch(m)}>
              <div className="esportes-screen__team">
                <ClubBadge name={m.homeTeam.name} code={m.homeTeam.tla ?? '?'} crestUrl={m.homeTeam.crest} />
                <span>{m.homeTeam.shortName ?? m.homeTeam.name}</span>
              </div>
              <div className="esportes-screen__score-block">
                <span className="esportes-screen__score">
                  {m.score.fullTime.home !== null ? `${m.score.fullTime.home} – ${m.score.fullTime.away}` : '—'}
                </span>
                <span className={`esportes-screen__status${isLiveStatus(m.status) ? ' is-live' : ''}`}>
                  {isLiveStatus(m.status) ? '● Ao vivo' : translateStatus(m.status)}
                </span>
              </div>
              <div className="esportes-screen__team esportes-screen__team--away">
                <span>{m.awayTeam.shortName ?? m.awayTeam.name}</span>
                <ClubBadge name={m.awayTeam.name} code={m.awayTeam.tla ?? '?'} crestUrl={m.awayTeam.crest} />
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && view === 'tabela' && standings?.status === 'ok' && <StandingsTable groups={standings.data} />}
    </section>
  );
}

function StandingsTable({ groups }: { groups: { stage: string; group: string | null; table: ApiStandingRow[] }[] }) {
  return (
    <div className="esportes-screen__standings-scroll">
      {groups.map((g, gi) => (
        <div key={gi} className="esportes-screen__table" style={{ marginBottom: 14 }}>
          {g.group && <div className="esportes-screen__table-group">{g.group}</div>}
          <div className="esportes-screen__table-head">
            <span className="esportes-screen__table-club">Clube</span>
            <span>J</span>
            <span>V</span>
            <span>E</span>
            <span>D</span>
            <span>SG</span>
            <span>Pts</span>
          </div>
          {g.table.map((row) => (
            <div key={row.team.id} className="esportes-screen__table-row">
              <span className="esportes-screen__table-pos">{row.position}</span>
              <span className="esportes-screen__table-club">
                <ClubBadge name={row.team.name} code={row.team.tla ?? '?'} crestUrl={row.team.crest} size={26} />
                {row.team.shortName ?? row.team.name}
              </span>
              <span>{row.playedGames}</span>
              <span>{row.won}</span>
              <span>{row.draw}</span>
              <span>{row.lost}</span>
              <span>{row.goalDifference}</span>
              <span className="esportes-screen__table-pts">{row.points}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
