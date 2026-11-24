import { useMemo, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { IosListGroup, IosListRow } from '../ios/IosListGroup';
import { IosSearchField } from '../ios/IosSearchField';
import { tripsMock, type Trip } from '../../data/logbookMock';
import './DiarioDeBordoScreen.css';

interface DiarioDeBordoScreenProps {
  onBack: () => void;
}

type View = 'viagens' | 'resumo';
type Period = 'tudo' | 'semana' | 'mes';

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} h ${m.toString().padStart(2, '0')} min`;
}

/**
 * App Diário de Bordo (atalho `fahrtenbuch`, antes inerte). Estados: 1)
 * lista de viagens com filtro por período; 2) detalhe de viagem; 3) resumo
 * com estatísticas agregadas; 4) busca sem resultado (vazio). Dados locais
 * de exemplo, explicitamente fictícios — sem GPS real nem leitura do ETS2.
 */
export function DiarioDeBordoScreen({ onBack }: DiarioDeBordoScreenProps) {
  const [view, setView] = useState<View>('viagens');
  const [period, setPeriod] = useState<Period>('tudo');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Trip | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tripsMock
      .filter((t) => period === 'tudo' || t.period === period)
      .filter((t) => !q || t.origin.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q));
  }, [period, query]);

  const totals = useMemo(() => {
    const km = tripsMock.reduce((sum, t) => sum + t.distanceKm, 0);
    const min = tripsMock.reduce((sum, t) => sum + t.durationMin, 0);
    const fuel = tripsMock.reduce((sum, t) => sum + t.fuelL, 0);
    const avgConsumption = km / fuel;
    return { km, min, fuel, avgConsumption };
  }, []);

  return (
    <div className="diario-screen">
      <BackButton onClick={onBack} />

      <header className="diario-screen__header">
        <h1 className="ios-large-title">Diário de Bordo</h1>
        <SegmentedControl
          options={[
            { id: 'viagens', label: 'Viagens' },
            { id: 'resumo', label: 'Resumo' },
          ]}
          value={view}
          onChange={(id) => setView(id as View)}
        />
      </header>

      {view === 'viagens' && (
        <div className="diario-screen__body">
          <div className="diario-screen__filters">
            <SegmentedControl
              options={[
                { id: 'tudo', label: 'Tudo' },
                { id: 'semana', label: 'Esta semana' },
                { id: 'mes', label: 'Este mês' },
              ]}
              value={period}
              onChange={(id) => setPeriod(id as Period)}
            />
          </div>
          <IosSearchField value={query} onChange={setQuery} placeholder="Buscar por origem ou destino" />

          {filtered.length === 0 ? (
            <div className="diario-screen__empty">
              <span className="diario-screen__empty-icon">🧾</span>
              <p className="ios-body">Nenhuma viagem encontrada para este filtro.</p>
            </div>
          ) : (
            <IosListGroup>
              {filtered.map((t) => (
                <IosListRow
                  key={t.id}
                  icon="🚚"
                  iconBg="var(--ios-blue)"
                  label={`${t.origin} → ${t.destination}`}
                  value={`${t.distanceKm} km`}
                  chevron
                  onClick={() => setSelected(t)}
                />
              ))}
            </IosListGroup>
          )}
        </div>
      )}

      {view === 'resumo' && (
        <div className="diario-screen__body">
          <div className="diario-screen__stats-grid">
            <div className="diario-screen__stat">
              <span className="ios-footnote">DISTÂNCIA TOTAL</span>
              <span className="ios-title1">{totals.km.toLocaleString('pt-BR')} km</span>
            </div>
            <div className="diario-screen__stat">
              <span className="ios-footnote">TEMPO DE VIAGEM</span>
              <span className="ios-title1">{formatDuration(totals.min)}</span>
            </div>
            <div className="diario-screen__stat">
              <span className="ios-footnote">COMBUSTÍVEL</span>
              <span className="ios-title1">{totals.fuel.toLocaleString('pt-BR')} L</span>
            </div>
            <div className="diario-screen__stat">
              <span className="ios-footnote">CONSUMO MÉDIO</span>
              <span className="ios-title1">{totals.avgConsumption.toFixed(2)} km/L</span>
            </div>
          </div>
          <IosListGroup header="Viagens registradas" footer="Dados locais de exemplo — sem integração com GPS ou telemetria do ETS2.">
            <IosListRow label="Total de viagens" value={String(tripsMock.length)} />
          </IosListGroup>
        </div>
      )}

      {selected && (
        <div className="diario-screen__overlay" onClick={() => setSelected(null)}>
          <div className="diario-screen__detail" onClick={(e) => e.stopPropagation()}>
            <h2 className="ios-title1">
              {selected.origin} → {selected.destination}
            </h2>
            <p className="ios-subheadline">{selected.dateLabel}</p>
            <IosListGroup>
              <IosListRow label="Distância" value={`${selected.distanceKm} km`} />
              <IosListRow label="Duração" value={formatDuration(selected.durationMin)} />
              <IosListRow label="Combustível usado" value={`${selected.fuelL} L`} />
              <IosListRow label="Consumo médio" value={`${selected.avgConsumption.toFixed(2)} km/L`} />
            </IosListGroup>
            {selected.notes && <p className="diario-screen__notes ios-body">{selected.notes}</p>}
            <button type="button" className="diario-screen__close" onClick={() => setSelected(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
