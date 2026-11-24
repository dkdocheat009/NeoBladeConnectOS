import { useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { StatCard } from '../common/StatCard';
import { activeJob } from '../../data/jobMock';
import './TrabalhoScreen.css';

type RightTab = 'progresso' | 'parada' | 'detalhes';

interface TrabalhoScreenProps {
  onBack: () => void;
}

/**
 * Reproduz auftrag.png / de/job.png (também en/job.png). Views: 1) Trabalho
 * atual (painel esquerdo, sempre visível); 2) Progresso; 3) Próxima
 * parada; 4) Detalhes de carga/viagem (abas no painel direito); 5) estado
 * sem trabalho/concluído (alterna a tela inteira, mesmo sistema visual).
 * Tudo mock — sem fretes reais nem telemetria.
 */
export function TrabalhoScreen({ onBack }: TrabalhoScreenProps) {
  const [tab, setTab] = useState<RightTab>('progresso');
  const [hasJob, setHasJob] = useState(true);

  const job = activeJob;
  const progressPct = Math.round(((job.distanceKm - job.remainingKm) / job.distanceKm) * 100);
  const net = job.payEUR - job.costsEUR;

  if (!hasJob) {
    return (
      <div className="trabalho-screen">
        <BackButton onClick={onBack} />
        <div className="trabalho-screen__empty-panel">
          <span className="trabalho-screen__empty-icon">📦</span>
          <p>Nenhum trabalho ativo no momento.</p>
          <button type="button" className="trabalho-screen__action" onClick={() => setHasJob(true)}>
            Aceitar novo trabalho (teste)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trabalho-screen">
      <BackButton onClick={onBack} />

      <section className="trabalho-screen__panel trabalho-screen__current">
        <div className="trabalho-screen__header">
          <span className="trabalho-screen__header-title">Trabalho</span>
          <span className="trabalho-screen__market">{job.marketLabel}</span>
        </div>

        <div className="trabalho-screen__route">
          <div className="trabalho-screen__place">
            <span className="trabalho-screen__city">{job.origin}</span>
            <span className="trabalho-screen__company">{job.originCompany}</span>
          </div>
          <span className="trabalho-screen__arrow">→</span>
          <div className="trabalho-screen__place trabalho-screen__place--end">
            <span className="trabalho-screen__city">{job.destination}</span>
            <span className="trabalho-screen__company">{job.destinationCompany}</span>
          </div>
        </div>

        <div className="trabalho-screen__cargo">
          <span className="trabalho-screen__cargo-name">{job.cargoName}</span>
          <span className="trabalho-screen__cargo-weight">{job.cargoWeightT.toLocaleString('pt-BR')} t</span>
        </div>

        <div className="trabalho-screen__financials">
          <div className="trabalho-screen__fin-row">
            <span>Pagamento</span>
            <strong>{job.payEUR.toLocaleString('pt-BR')} €</strong>
          </div>
          <div className="trabalho-screen__fin-row">
            <span>Custos na viagem</span>
            <strong>{job.costsEUR.toLocaleString('pt-BR')} €</strong>
          </div>
          <div className="trabalho-screen__fin-row trabalho-screen__fin-row--net">
            <span>Líquido</span>
            <strong>{net.toLocaleString('pt-BR')} €</strong>
          </div>
          <div className="trabalho-screen__fin-row">
            <span>Distância</span>
            <strong>{job.distanceKm} km</strong>
          </div>
          <div className="trabalho-screen__fin-row">
            <span>Avaria da carga</span>
            <strong>{job.cargoDamagePct} %</strong>
          </div>
        </div>

        <button type="button" className="trabalho-screen__action" onClick={() => setHasJob(false)}>
          Concluir entrega (teste)
        </button>
      </section>

      <section className="trabalho-screen__panel trabalho-screen__right">
        <div className="trabalho-screen__right-header">
          <span className="trabalho-screen__right-title">
            {tab === 'progresso' ? 'Progresso' : tab === 'parada' ? 'Próxima parada' : 'Detalhes'}
          </span>
          <SegmentedControl
            options={[
              { id: 'progresso', label: 'Progresso' },
              { id: 'parada', label: 'Parada' },
              { id: 'detalhes', label: 'Detalhes' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as RightTab)}
          />
        </div>

        {tab === 'progresso' && (
          <>
            <span className="trabalho-screen__remaining">ainda {job.remainingKm} km</span>
            <div className="trabalho-screen__progress-track">
              <div
                className="trabalho-screen__progress-fill"
                style={{ width: `${Math.max(4, progressPct)}%` }}
              />
            </div>
            <div className="trabalho-screen__row-with-badge">
              <span>Chegada {job.arrival}</span>
              {job.onTime && <span className="trabalho-screen__badge">no prazo</span>}
            </div>
            <div className="trabalho-screen__kv">
              <span>Prazo</span>
              <strong>{job.deadline}</strong>
            </div>
            <div className="trabalho-screen__kv">
              <span>Margem</span>
              <strong>{job.bufferLabel}</strong>
            </div>
          </>
        )}

        {tab === 'parada' && (
          <div className="trabalho-screen__stop-detail">
            <div className="trabalho-screen__stop-header">
              <span className="trabalho-screen__stop-icon">☕</span>
              <div>
                <span className="trabalho-screen__stop-title">Próxima parada em {job.nextBreak.label}</span>
                <span className="trabalho-screen__stop-sub">
                  {job.nextBreak.place} · {job.nextBreak.distanceKm} km · {job.nextBreak.etaTime}
                </span>
              </div>
            </div>
            <div className="trabalho-screen__amenities">
              {job.nextBreak.amenities.map((a) => (
                <span key={a} className="trabalho-screen__amenity">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'detalhes' && (
          <div className="trabalho-screen__cards">
            <StatCard label="Carga" value={job.cargoName} />
            <StatCard label="Peso" value={`${job.cargoWeightT} t`} />
            <StatCard label="Reboque" value={job.trailerType} />
            <StatCard label="Origem" value={`${job.origin} · ${job.originCompany}`} />
            <StatCard label="Destino" value={`${job.destination} · ${job.destinationCompany}`} />
            <StatCard label="Distância total" value={`${job.distanceKm} km`} />
          </div>
        )}
      </section>
    </div>
  );
}
