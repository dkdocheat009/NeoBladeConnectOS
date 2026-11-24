import { useMemo, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { WeatherIconGlyph } from './WeatherIconGlyph';
import {
  currentConditions,
  hourlyForecast,
  buildDailyForecast,
  CONDITION_LABELS,
} from '../../data/weatherMock';
import './ClimaScreen.css';

interface ClimaScreenProps {
  onBack: () => void;
}

/**
 * Reproduz wetter.png / de/weather.png (também en/weather.png). Views:
 * 1) condição atual; 2) previsão horária (seleção); 3) previsão de 6 dias;
 * 4) detalhes do dia/hora selecionado, reaproveitando o painel esquerdo.
 * Dados mock determinísticos — sem API nem localização real.
 */
export function ClimaScreen({ onBack }: ClimaScreenProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const daily = useMemo(() => buildDailyForecast(new Date()), []);

  const selectHour = (index: number) => {
    setSelectedHour(index);
    setSelectedDay(null);
  };
  const selectDay = (index: number) => {
    setSelectedDay(index);
    setSelectedHour(null);
  };

  let heading: string;
  let bigIcon: typeof hourlyForecast[number]['icon'];
  let bigTemp: number;
  let subtitle: string;
  let footer: string;

  if (selectedHour !== null) {
    const h = hourlyForecast[selectedHour];
    heading = `Amsterdã · ${h.label}`;
    bigIcon = h.icon;
    bigTemp = h.tempC;
    subtitle = CONDITION_LABELS[h.icon];
    footer = 'Previsão por hora (seleção)';
  } else if (selectedDay !== null) {
    const d = daily[selectedDay];
    heading = `Amsterdã · ${d.label}`;
    bigIcon = d.icon;
    bigTemp = d.highC;
    subtitle = CONDITION_LABELS[d.icon];
    footer = `Mín. ${d.lowC}° · Máx. ${d.highC}°`;
  } else {
    heading = currentConditions.city;
    bigIcon = hourlyForecast[0].icon;
    bigTemp = currentConditions.tempC;
    subtitle = currentConditions.condition;
    footer = `Máx: ${currentConditions.highC}° Mín: ${currentConditions.lowC}°`;
  }

  return (
    <div className="clima-screen">
      <BackButton onClick={onBack} />

      <section className="clima-screen__current">
        <span className="clima-screen__city">{heading}</span>
        <div className="clima-screen__big">
          <WeatherIconGlyph icon={bigIcon} size={56} />
          <span className="clima-screen__temp">{bigTemp}°</span>
        </div>
        <span className="clima-screen__condition">{subtitle}</span>
        <span className="clima-screen__footer">{footer}</span>
        {selectedHour === null && selectedDay === null && (
          <span className="clima-screen__note">
            Sensação {currentConditions.feelsLikeC}° · Vento {currentConditions.windKmh} km/h ·{' '}
            {currentConditions.note}
          </span>
        )}
      </section>

      <section className="clima-screen__panel clima-screen__hourly">
        <div className="clima-screen__panel-title">
          <span>⏱ POR HORA</span>
        </div>
        <div className="clima-screen__hour-row">
          {hourlyForecast.map((h, index) => (
            <button
              key={h.label}
              type="button"
              className={`clima-screen__hour${index === selectedHour ? ' is-active' : ''}`}
              onClick={() => selectHour(index)}
            >
              <span className="clima-screen__hour-label">{h.label}</span>
              <WeatherIconGlyph icon={h.icon} size={20} />
              <span className="clima-screen__hour-temp">{h.tempC}°</span>
            </button>
          ))}
        </div>
      </section>

      <section className="clima-screen__panel clima-screen__daily">
        <div className="clima-screen__panel-title">
          <span>📅 PREVISÃO DE 6 DIAS</span>
        </div>
        <div className="clima-screen__day-list">
          {daily.map((d, index) => {
            const lowGlobal = Math.min(...daily.map((x) => x.lowC));
            const highGlobal = Math.max(...daily.map((x) => x.highC));
            const span = highGlobal - lowGlobal || 1;
            const left = ((d.lowC - lowGlobal) / span) * 100;
            const width = ((d.highC - d.lowC) / span) * 100;
            return (
              <button
                key={d.label}
                type="button"
                className={`clima-screen__day${index === selectedDay ? ' is-active' : ''}`}
                onClick={() => selectDay(index)}
              >
                <span className="clima-screen__day-label">{d.label}</span>
                <WeatherIconGlyph icon={d.icon} size={20} />
                <span className="clima-screen__day-precip">
                  {d.precipPct !== undefined ? `${d.precipPct} %` : ''}
                </span>
                <span className="clima-screen__day-low">{d.lowC}°</span>
                <div className="clima-screen__day-track">
                  <div
                    className="clima-screen__day-fill"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="clima-screen__day-high">{d.highC}°</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
