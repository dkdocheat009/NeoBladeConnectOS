import { useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { StatBar } from '../common/StatBar';
import { StatCard } from '../common/StatCard';
import { SegmentedControl } from '../common/SegmentedControl';
import { BrandLogoGlyph } from '../AppIcon/BrandLogoGlyph';
import type { TruckBrand } from '../../data/truckBrands';
import {
  vehicleOverview,
  vehicleCondition,
  trailerAttached,
  trailerEmpty,
  brandModelById,
} from '../../data/vehicleMock';
import './VeiculoScreen.css';

type RightTab = 'cavalo' | 'condicao' | 'reboque';

interface VeiculoScreenProps {
  onBack: () => void;
  currentTruckBrand: TruckBrand;
  onCycleBrand: () => void;
}

/**
 * Reproduz fahrzeug.png / de/truck.png (também en/truck.png). 4 visões:
 * 1) Visão geral (painel esquerdo, sempre visível); 2) Condição; 3) Cavalo
 * Mecânico; 4) Reboque — as 3 últimas no mesmo painel direito, alternadas
 * por abas (extensão do controle Zugmaschine/Anhänger da referência).
 * Tudo mock/determinístico — sem telemetria real nem ETS2.
 */
export function VeiculoScreen({ onBack, currentTruckBrand, onCycleBrand }: VeiculoScreenProps) {
  const [tab, setTab] = useState<RightTab>('condicao');
  const [trailerOn, setTrailerOn] = useState(true);
  const trailer = trailerOn ? trailerAttached : trailerEmpty;
  const info = brandModelById[currentTruckBrand.id] ?? {
    model: currentTruckBrand.name,
    plate: '—',
    powerHp: 0,
    year: 0,
  };

  const tankPct = Math.round((vehicleOverview.tankLiters / vehicleOverview.tankCapacity) * 100);
  const adBluePct = Math.round(
    (vehicleOverview.adBlueLiters / vehicleOverview.adBlueCapacity) * 100,
  );

  return (
    <div className="veiculo-screen">
      <BackButton onClick={onBack} />

      <section className="veiculo-screen__panel veiculo-screen__overview">
        <div className="veiculo-screen__speed">
          <span className="veiculo-screen__speed-value">{vehicleOverview.speedKmh}</span>
          <span className="veiculo-screen__speed-unit">km/h</span>
        </div>

        <div className="veiculo-screen__meta-row">
          <div>
            <span className="veiculo-screen__meta-label">MARCHA</span>
            <span className="veiculo-screen__meta-value">{vehicleOverview.gear}</span>
          </div>
          <div>
            <span className="veiculo-screen__meta-label">ROTAÇÃO</span>
            <span className="veiculo-screen__meta-value">
              {vehicleOverview.rpm.toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="veiculo-screen__meta-label">PILOTO AUTOMÁTICO</span>
            <span className="veiculo-screen__meta-value">
              {vehicleOverview.cruiseKmh ? `${vehicleOverview.cruiseKmh} km/h` : 'desl.'}
            </span>
          </div>
        </div>

        <div className="veiculo-screen__gauges">
          <StatBar label="Tanque" valueLabel={`${vehicleOverview.tankLiters} l · ≈${vehicleOverview.rangeKm} km`} pct={tankPct} />
          <StatBar label="AdBlue" valueLabel={`${vehicleOverview.adBlueLiters} l`} pct={adBluePct} />
        </div>

        <div className="veiculo-screen__badges">
          <span className={`veiculo-screen__pill${vehicleOverview.blinker ? ' is-on' : ''}`}>
            Seta {vehicleOverview.blinker === 'right' ? '▶' : vehicleOverview.blinker === 'left' ? '◀' : ''}
          </span>
          <span className={`veiculo-screen__pill${vehicleOverview.lightsOn ? ' is-on' : ''}`}>Luz</span>
          <span className="veiculo-screen__pill">Retarder {vehicleOverview.retarder}</span>
        </div>

        <div className="veiculo-screen__footer-row">
          <span className="veiculo-screen__model">{info.model}</span>
          {vehicleOverview.handbrakeOn && (
            <span className="veiculo-screen__pill is-on">Freio de estacionamento</span>
          )}
        </div>
      </section>

      <section className="veiculo-screen__panel veiculo-screen__right">
        <div className="veiculo-screen__right-header">
          <span className="veiculo-screen__right-title">Estado</span>
          <SegmentedControl
            options={[
              { id: 'cavalo', label: 'Cavalo Mecânico' },
              { id: 'condicao', label: 'Condição' },
              { id: 'reboque', label: 'Reboque' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as RightTab)}
          />
        </div>

        {tab === 'condicao' && (
          <>
            <div className="veiculo-screen__bars">
              <StatBar label="Motor" valueLabel={`${vehicleCondition.motorPct} %`} pct={vehicleCondition.motorPct} />
              <StatBar label="Transmissão" valueLabel={`${vehicleCondition.gearboxPct} %`} pct={vehicleCondition.gearboxPct} />
              <StatBar label="Cabine" valueLabel={`${vehicleCondition.cabinPct} %`} pct={vehicleCondition.cabinPct} />
              <StatBar label="Chassi" valueLabel={`${vehicleCondition.chassisPct} %`} pct={vehicleCondition.chassisPct} />
              <StatBar label="Rodas" valueLabel={`${vehicleCondition.wheelsPct} %`} pct={vehicleCondition.wheelsPct} />
            </div>
            <div className="veiculo-screen__cards">
              <StatCard label="Óleo" value={`${vehicleCondition.oilTempC} °C`} />
              <StatCard label="Água" value={`${vehicleCondition.waterTempC} °C`} />
              <StatCard label="Consumo médio" value={vehicleCondition.avgConsumption} />
              <StatCard label="Quilometragem" value={`${vehicleCondition.odometerKm.toLocaleString('pt-BR')} km`} />
            </div>
          </>
        )}

        {tab === 'cavalo' && (
          <div className="veiculo-screen__brand">
            <BrandLogoGlyph brand={currentTruckBrand} size={84} />
            <div className="veiculo-screen__brand-info">
              <span className="veiculo-screen__brand-name">{currentTruckBrand.name}</span>
              <span className="veiculo-screen__brand-model">{info.model}</span>
            </div>
            <div className="veiculo-screen__cards">
              <StatCard label="Placa" value={info.plate} />
              <StatCard label="Potência" value={`${info.powerHp} cv`} />
              <StatCard label="Ano" value={String(info.year)} />
              <StatCard label="Marca" value={currentTruckBrand.name} />
            </div>
            <button type="button" className="veiculo-screen__action" onClick={onCycleBrand}>
              Trocar marca (teste) →
            </button>
          </div>
        )}

        {tab === 'reboque' && trailer.attached && (
          <>
            <p className="veiculo-screen__trailer-name">{trailer.name}</p>
            <div className="veiculo-screen__bars">
              <StatBar label="Carga" valueLabel={`${trailer.cargoPct} %`} pct={trailer.cargoPct ?? 0} />
              <StatBar label="Freios" valueLabel={`${trailer.brakesPct} %`} pct={trailer.brakesPct ?? 0} />
              <StatBar label="Pneus" valueLabel={`${trailer.tiresPct} %`} pct={trailer.tiresPct ?? 0} />
              <StatBar label="Iluminação" valueLabel={`${trailer.lightsPct} %`} pct={trailer.lightsPct ?? 0} />
            </div>
            <div className="veiculo-screen__cards">
              <StatCard label="Peso" value={`${trailer.weightT} t`} />
              <StatCard label="Eixos" value={String(trailer.axles)} />
            </div>
            <button type="button" className="veiculo-screen__action" onClick={() => setTrailerOn(false)}>
              Simular desacoplamento (teste)
            </button>
          </>
        )}

        {tab === 'reboque' && !trailer.attached && (
          <div className="veiculo-screen__empty">
            <p>Nenhum reboque acoplado.</p>
            <button type="button" className="veiculo-screen__action" onClick={() => setTrailerOn(true)}>
              Simular acoplamento (teste)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
