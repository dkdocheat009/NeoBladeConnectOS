import { useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { ClubBadge } from './ClubBadge';
import { leagues, buildStandings, clubById, type Match } from '../../data/sportsMock';
import './EsportesScreen.css';

interface EsportesScreenProps {
  onBack: () => void;
}

/**
 * Reproduz sport.png / de/sports.png (também en/sports.png). Views:
 * 1) seletor lateral de campeonatos; 2) partidas/resultados da liga; 3)
 * alternância Jogos/Tabela; 4) detalhe de uma partida. Ligas, clubes e
 * placares são 100% fictícios — sem API esportiva, sem escudos oficiais.
 */
export function EsportesScreen({ onBack }: EsportesScreenProps) {
  const [leagueId, setLeagueId] = useState(leagues[0].id);
  const [view, setView] = useState<'jogos' | 'tabela'>('jogos');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const league = leagues.find((l) => l.id === leagueId) ?? leagues[0];
  const standings = view === 'tabela' ? buildStandings(league) : [];

  return (
    <div className="esportes-screen">
      <BackButton onClick={onBack} />

      <nav className="esportes-screen__sidebar">
        {leagues.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`esportes-screen__league${l.id === leagueId ? ' is-active' : ''}`}
            onClick={() => {
              setLeagueId(l.id);
              setSelectedMatch(null);
            }}
          >
            <span className="esportes-screen__league-code" style={{ background: l.color }}>
              {l.code}
            </span>
            {l.name}
          </button>
        ))}
      </nav>

      <section className="esportes-screen__main">
        <div className="esportes-screen__header">
          <div>
            <h1 className="esportes-screen__title">{league.name}</h1>
            <span className="esportes-screen__matchday">{league.matchday}</span>
          </div>
          <SegmentedControl
            options={[
              { id: 'jogos', label: 'Jogos' },
              { id: 'tabela', label: 'Tabela' },
            ]}
            value={view}
            onChange={(id) => setView(id as 'jogos' | 'tabela')}
          />
        </div>

        {view === 'jogos' && (
          <div className="esportes-screen__grid">
            {league.matches.map((m) => {
              const home = clubById(m.home);
              const away = clubById(m.away);
              const played = m.homeScore !== null;
              return (
                <button
                  type="button"
                  key={m.id}
                  className="esportes-screen__match"
                  onClick={() => setSelectedMatch(m)}
                >
                  <div className="esportes-screen__team">
                    <ClubBadge club={home} />
                    <span>{home.name}</span>
                  </div>
                  <div className="esportes-screen__score-block">
                    <span className="esportes-screen__score">
                      {played ? `${m.homeScore} – ${m.awayScore}` : '—'}
                    </span>
                    <span className="esportes-screen__status">{m.status}</span>
                  </div>
                  <div className="esportes-screen__team esportes-screen__team--away">
                    <span>{away.name}</span>
                    <ClubBadge club={away} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {view === 'tabela' && (
          <div className="esportes-screen__table">
            <div className="esportes-screen__table-head">
              <span className="esportes-screen__table-club">Clube</span>
              <span>J</span>
              <span>V</span>
              <span>E</span>
              <span>D</span>
              <span>SG</span>
              <span>Pts</span>
            </div>
            {standings.map((row, index) => (
              <div key={row.club.id} className="esportes-screen__table-row">
                <span className="esportes-screen__table-pos">{index + 1}</span>
                <span className="esportes-screen__table-club">
                  <ClubBadge club={row.club} size={26} />
                  {row.club.name}
                </span>
                <span>{row.played}</span>
                <span>{row.wins}</span>
                <span>{row.draws}</span>
                <span>{row.losses}</span>
                <span>{row.goalsFor - row.goalsAgainst}</span>
                <span className="esportes-screen__table-pts">{row.points}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedMatch && (
        <div className="esportes-screen__overlay" onClick={() => setSelectedMatch(null)}>
          <div className="esportes-screen__detail" onClick={(e) => e.stopPropagation()}>
            <div className="esportes-screen__detail-teams">
              <div className="esportes-screen__detail-team">
                <ClubBadge club={clubById(selectedMatch.home)} size={56} />
                <span>{clubById(selectedMatch.home).name}</span>
              </div>
              <span className="esportes-screen__detail-score">
                {selectedMatch.homeScore !== null
                  ? `${selectedMatch.homeScore} – ${selectedMatch.awayScore}`
                  : 'a definir'}
              </span>
              <div className="esportes-screen__detail-team">
                <ClubBadge club={clubById(selectedMatch.away)} size={56} />
                <span>{clubById(selectedMatch.away).name}</span>
              </div>
            </div>
            <p className="esportes-screen__detail-status">{selectedMatch.status}</p>
            {selectedMatch.scorers.length > 0 && (
              <ul className="esportes-screen__detail-scorers">
                {selectedMatch.scorers.map((s, i) => (
                  <li key={i}>
                    ⚽ {s.player} ({clubById(s.clubId).code}) {s.minute}'
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="esportes-screen__detail-close" onClick={() => setSelectedMatch(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
