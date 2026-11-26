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
import { useEts2Telemetry } from '../../integrations/ets2/useEts2Telemetry';
import { speedKmh } from '../../integrations/ets2/types';
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
 * Fase 10: velocidade/marcha/rotação/piloto automático/tanque/alcance/
 * setas/luzes/retarder/freio de estacionamento e os 5 percentuais de
 * desgaste (painel Condição) usam telemetria real via useEts2Telemetry()
 * quando o host NeoBladeConnectOS-ETS2 está conectado E o caminhão está em
 * jogo (não pausado) — ver o selo "ETS2 ao vivo". Sem o host, tudo
 * continua mock/determinístico como antes. Capacidade do tanque/AdBlue,
 * Cavalo Mecânico, Reboque e óleo/água/consumo médio/odômetro continuam
 * sempre mock (o SDK SCS não expõe esses canais).
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

  // Fase 10: quando o host ETS2 está conectado E o caminhão está em jogo
  // (nao pausado/menu), estes campos refletem telemetria real em vez da
  // demonstracao — tanque/AdBlue continuam a capacidade mock (o SDK SCS
  // não expõe a capacidade máxima do tanque, só o volume atual/alcance).
  const { connected, snapshot } = useEts2Telemetry();
  const liveTruck = connected && snapshot?.truck.valid ? snapshot.truck : null;
  const overview = liveTruck
    ? {
        ...vehicleOverview,
        speedKmh: Math.round(Math.abs(speedKmh(liveTruck))),
        gear: liveTruck.displayedGear,
        rpm: Math.round(liveTruck.engineRpm),
        cruiseKmh: liveTruck.cruiseControlMs > 0 ? Math.round(liveTruck.cruiseControlMs * 3.6) : null,
        tankLiters: Math.round(liveTruck.fuelLiters),
        rangeKm: Math.round(liveTruck.fuelRangeKm),
        blinker: liveTruck.blinkerLeft ? ('left' as const) : liveTruck.blinkerRight ? ('right' as const) : null,
        lightsOn: liveTruck.lightsBeamLow || liveTruck.lightsBeamHigh,
        retarder: liveTruck.retarderLevel,
        handbrakeOn: liveTruck.parkingBrake,
      }
    : vehicleOverview;
  const condition = liveTruck
    ? {
        ...vehicleCondition,
        motorPct: Math.round((1 - liveTruck.engineDamage) * 100),
        gearboxPct: Math.round((1 - liveTruck.transmissionDamage) * 100),
        cabinPct: Math.round((1 - liveTruck.cabinDamage) * 100),
        chassisPct: Math.round((1 - liveTruck.chassisDamage) * 100),
        wheelsPct: Math.round((1 - liveTruck.wheelsDamage) * 100),
      }
    : vehicleCondition;

  const tankPct = Math.round((overview.tankLiters / vehicleOverview.tankCapacity) * 100);
  const adBluePct = Math.round(
    (vehicleOverview.adBlueLiters / vehicleOverview.adBlueCapacity) * 100,
  );

  return (
    <div className="veiculo-screen">
      <BackButton onClick={onBack} />

      <section className="veiculo-screen__panel veiculo-screen__overview">
        {liveTruck && <span className="veiculo-screen__live-badge">ETS2 ao vivo</span>}
        <div className="veiculo-screen__speed">
          <span className="veiculo-screen__speed-value">{overview.speedKmh}</span>
          <span className="veiculo-screen__speed-unit">km/h</span>
        </div>

        <div className="veiculo-screen__meta-row">
          <div>
            <span className="veiculo-screen__meta-label">MARCHA</span>
            <span className="veiculo-screen__meta-value">{overview.gear}</span>
          </div>
          <div>
            <span className="veiculo-screen__meta-label">ROTAÇÃO</span>
            <span className="veiculo-screen__meta-value">
              {overview.rpm.toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="veiculo-screen__meta-label">PILOTO AUTOMÁTICO</span>
            <span className="veiculo-screen__meta-value">
              {overview.cruiseKmh ? `${overview.cruiseKmh} km/h` : 'desl.'}
            </span>
          </div>
        </div>

        <div className="veiculo-screen__gauges">
          <StatBar label="Tanque" valueLabel={`${overview.tankLiters} l · ≈${overview.rangeKm} km`} pct={tankPct} />
          <StatBar label="AdBlue" valueLabel={`${vehicleOverview.adBlueLiters} l`} pct={adBluePct} />
        </div>

        <div className="veiculo-screen__badges">
          <span className={`veiculo-screen__pill${overview.blinker ? ' is-on' : ''}`}>
            Seta {overview.blinker === 'right' ? '▶' : overview.blinker === 'left' ? '◀' : ''}
          </span>
          <span className={`veiculo-screen__pill${overview.lightsOn ? ' is-on' : ''}`}>Luz</span>
          <span className="veiculo-screen__pill">Retarder {overview.retarder}</span>
        </div>

        <div className="veiculo-screen__footer-row">
          <span className="veiculo-screen__model">{info.model}</span>
          {overview.handbrakeOn && (
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
              <StatBar label="Motor" valueLabel={`${condition.motorPct} %`} pct={condition.motorPct} />
              <StatBar label="Transmissão" valueLabel={`${condition.gearboxPct} %`} pct={condition.gearboxPct} />
              <StatBar label="Cabine" valueLabel={`${condition.cabinPct} %`} pct={condition.cabinPct} />
              <StatBar label="Chassi" valueLabel={`${condition.chassisPct} %`} pct={condition.chassisPct} />
              <StatBar label="Rodas" valueLabel={`${condition.wheelsPct} %`} pct={condition.wheelsPct} />
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
