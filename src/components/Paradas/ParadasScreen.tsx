import { useEffect, useMemo, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { IosSearchField } from '../ios/IosSearchField';
import { stopsMock, type Stop } from '../../data/stopsMock';
import './ParadasScreen.css';

interface ParadasScreenProps {
  onBack: () => void;
}

type Filter = 'todos' | 'posto' | 'descanso';

const FAVORITES_KEY = 'neoblade:favoriteStops';

function loadFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * App Abastecer e Descansar (atalho `tanken-rasten`, antes inerte).
 * Estados: 1) lista com busca/filtro Todos/Postos/Descanso; 2) detalhe de
 * uma parada; 3) favoritos; 4) busca sem resultado; 5) favoritos vazio.
 * 100% mock/demonstração — sem GPS real, sem localização ao vivo, sem
 * preços reais de combustível.
 */
export function ParadasScreen({ onBack }: ParadasScreenProps) {
  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [selected, setSelected] = useState<Stop | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // segue só em memória se localStorage falhar
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stopsMock
      .filter((s) => filter === 'todos' || s.type === filter)
      .filter((s) => !onlyFavorites || favorites.includes(s.id))
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filter, onlyFavorites, favorites, query]);

  return (
    <div className="paradas-screen">
      <BackButton onClick={onBack} />

      <header className="paradas-screen__header">
        <h1 className="ios-large-title">Abastecer e Descansar</h1>
        <div className="paradas-screen__controls">
          <SegmentedControl
            options={[
              { id: 'todos', label: 'Todos' },
              { id: 'posto', label: 'Postos' },
              { id: 'descanso', label: 'Descanso' },
            ]}
            value={filter}
            onChange={(id) => setFilter(id as Filter)}
          />
          <button
            type="button"
            className={`paradas-screen__fav-toggle${onlyFavorites ? ' is-active' : ''}`}
            onClick={() => setOnlyFavorites((v) => !v)}
          >
            ★ Favoritos
          </button>
        </div>
        <IosSearchField value={query} onChange={setQuery} placeholder="Buscar posto ou área de descanso" />
      </header>

      <div className="paradas-screen__list">
        {filtered.length === 0 && (
          <div className="paradas-screen__empty">
            <span className="paradas-screen__empty-icon">⛽</span>
            <p className="ios-body">
              {onlyFavorites ? 'Nenhuma parada favoritada ainda.' : 'Nenhuma parada encontrada para esta busca.'}
            </p>
          </div>
        )}
        {filtered.map((s) => (
          <button type="button" key={s.id} className="paradas-screen__card" onClick={() => setSelected(s)}>
            <span className={`paradas-screen__type-badge paradas-screen__type-badge--${s.type}`}>
              {s.type === 'posto' ? '⛽' : '🛏️'}
            </span>
            <div className="paradas-screen__card-body">
              <span className="paradas-screen__card-name">{s.name}</span>
              <span className="paradas-screen__card-address">{s.address}</span>
            </div>
            <div className="paradas-screen__card-meta">
              <span className="paradas-screen__card-distance">{s.distanceKm.toFixed(1)} km</span>
              {s.priceDemo && <span className="paradas-screen__card-price">{s.priceDemo}</span>}
            </div>
            <span
              className={`paradas-screen__star${favorites.includes(s.id) ? ' is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(s.id);
              }}
            >
              ★
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="paradas-screen__overlay" onClick={() => setSelected(null)}>
          <div className="paradas-screen__detail" onClick={(e) => e.stopPropagation()}>
            <span className={`paradas-screen__type-badge paradas-screen__type-badge--${selected.type}`}>
              {selected.type === 'posto' ? '⛽' : '🛏️'}
            </span>
            <h2 className="ios-title1">{selected.name}</h2>
            <p className="ios-subheadline">{selected.address} · {selected.distanceKm.toFixed(1)} km · {selected.hours}</p>
            {selected.priceDemo && <p className="paradas-screen__detail-price">{selected.priceDemo}</p>}
            <div className="paradas-screen__amenities">
              {selected.amenities.map((a) => (
                <span key={a} className="paradas-screen__amenity">
                  {a}
                </span>
              ))}
            </div>
            <div className="paradas-screen__detail-actions">
              <button type="button" onClick={() => toggleFavorite(selected.id)}>
                {favorites.includes(selected.id) ? '★ Remover dos favoritos' : '☆ Favoritar'}
              </button>
              <button type="button" className="is-secondary" onClick={() => setSelected(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
