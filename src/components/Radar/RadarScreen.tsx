import { useEffect, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { RadarGlyph } from '../AppIcon/RadarGlyph';
import { mockRoute, mockRadarAhead } from '../../data/navMock';
import './RadarScreen.css';

type RadarState = 'livre' | 'alerta' | 'reportado';

interface RadarScreenProps {
  onBack: () => void;
}

/**
 * Reproduz blitzer.png — módulo de alertas de radar/velocidade. Estados:
 * 1) estrada livre; 2) radar à frente; 3) confirmação de "reportar radar"
 * (mock, sem publicação real); retorno preserva a tela de Navegação de
 * onde veio. Sem chamadas a serviço real de radar — tudo mock/fictício.
 */
export function RadarScreen({ onBack }: RadarScreenProps) {
  const [state, setState] = useState<RadarState>('livre');
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (state !== 'reportado') return;
    const id = window.setTimeout(() => setState('livre'), 2200);
    return () => window.clearTimeout(id);
  }, [state]);

  const isAlert = state === 'alerta';

  return (
    <div className="radar-screen">
      <BackButton onClick={onBack} />

      <section className="radar-screen__left">
        <header className="radar-screen__header">
          <RadarGlyph size={22} />
          <span className="radar-screen__title">Blitzer</span>
          <span className={`radar-screen__live${isAlert ? ' is-alert' : ''}`}>
            {isAlert ? 'ALERTA' : 'LIVE'}
          </span>
        </header>

        <div className="radar-screen__gauge-row">
          <div className={`radar-screen__gauge${isAlert ? ' radar-screen__gauge--alert' : ''}`}>
            <span className="radar-screen__gauge-value">{mockRoute.currentSpeedKmh}</span>
            <span className="radar-screen__gauge-unit">km/h</span>
          </div>
          <div className="radar-screen__sign">
            <span>{mockRoute.speedLimitKmh}</span>
          </div>
        </div>

        {state === 'livre' && (
          <div className="radar-screen__status radar-screen__status--ok">
            <RadarGlyph size={18} />
            <div>
              <strong>Estrada livre</strong>
              <span>Nenhum radar à frente</span>
            </div>
          </div>
        )}

        {isAlert && (
          <div className="radar-screen__status radar-screen__status--alert">
            <RadarGlyph size={18} />
            <div>
              <strong>Radar à frente</strong>
              <span>
                {mockRadarAhead.type} · em {mockRadarAhead.distanceM} m
              </span>
            </div>
          </div>
        )}

        {state === 'reportado' && (
          <div className="radar-screen__status radar-screen__status--ok">
            <RadarGlyph size={18} />
            <div>
              <strong>Obrigado!</strong>
              <span>Radar reportado (demonstração)</span>
            </div>
          </div>
        )}

        <div className="radar-screen__actions">
          <button
            type="button"
            className="radar-screen__report"
            onClick={() => setState('reportado')}
          >
            🎥 Reportar radar
          </button>
          <button
            type="button"
            className={`radar-screen__mute${muted ? ' is-active' : ''}`}
            aria-label={muted ? 'Reativar avisos sonoros' : 'Silenciar avisos'}
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? '🔇' : '🔈'}
          </button>
        </div>

        <button
          type="button"
          className="radar-screen__demo-toggle"
          onClick={() => setState((s) => (s === 'alerta' ? 'livre' : 'alerta'))}
        >
          {isAlert ? 'Simular estrada livre (teste)' : 'Simular radar à frente (teste)'}
        </button>
      </section>

      <section className="radar-screen__right">
        <div className="radar-screen__right-header">
          <span className="radar-screen__right-title">Voraus</span>
          <span className="radar-screen__right-sub">na rota</span>
        </div>
        {isAlert ? (
          <p className="radar-screen__right-text">
            {mockRadarAhead.type} detectado a {mockRadarAhead.distanceM} m, limite de{' '}
            {mockRadarAhead.speedLimitKmh} km/h. Reduza a velocidade com antecedência.
          </p>
        ) : (
          <p className="radar-screen__right-text">
            Nada no seu caminho. Com rota ativa, o app verifica até 15 km à frente; sem rota, apenas
            em linha reta nesta via. Radares reportados aqui são guardados somente nesta demonstração.
          </p>
        )}
      </section>
    </div>
  );
}
