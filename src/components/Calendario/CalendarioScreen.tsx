import { useMemo, useState } from 'react';
import { BackButton } from '../BackButton/BackButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { IosListGroup, IosListRow } from '../ios/IosListGroup';
import { buildAgenda, type CalendarEvent } from '../../data/calendarMock';
import './CalendarioScreen.css';

interface CalendarioScreenProps {
  onBack: () => void;
  onDemoNavigate: () => void;
}

type View = 'hoje' | 'proximos';

/**
 * App Calendário (ícone existente na Home). Estados: 1) agenda de hoje; 2)
 * próximos dias (seleção); 3) detalhe de evento; 4) ação de
 * navegação/destino DEMO (abre o módulo Navegação, sem GPS real); 5)
 * nenhum compromisso. Agenda 100% mock — sem integração com calendário
 * real; o ícone da Home usa a data real do sistema (CalendarGlyph),
 * preservado sem alterações.
 */
export function CalendarioScreen({ onBack, onDemoNavigate }: CalendarioScreenProps) {
  const agenda = useMemo(() => buildAgenda(new Date()), []);
  const [view, setView] = useState<View>('hoje');
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [navToast, setNavToast] = useState(false);

  const day = agenda[selectedOffset] ?? agenda[0];

  const openDay = (offset: number) => {
    setSelectedOffset(offset);
    setView('hoje');
  };

  const demoNavigate = () => {
    setNavToast(true);
    window.setTimeout(() => setNavToast(false), 1800);
    onDemoNavigate();
  };

  return (
    <div className="calendario-screen">
      <BackButton onClick={onBack} />

      <header className="calendario-screen__header">
        <h1 className="ios-large-title">Calendário</h1>
        <SegmentedControl
          options={[
            { id: 'hoje', label: 'Hoje' },
            { id: 'proximos', label: 'Próximos dias' },
          ]}
          value={view}
          onChange={(id) => {
            if (id === 'hoje') setSelectedOffset(0);
            setView(id as View);
          }}
        />
      </header>

      {view === 'proximos' && (
        <IosListGroup>
          {agenda.map((d) => (
            <IosListRow
              key={d.dayOffset}
              icon="🗓️"
              iconBg="var(--ios-red)"
              label={d.label}
              value={d.events.length === 0 ? 'Nenhum compromisso' : `${d.events.length} compromisso(s)`}
              chevron
              onClick={() => openDay(d.dayOffset)}
            />
          ))}
        </IosListGroup>
      )}

      {view === 'hoje' && (
        <>
          <span className="calendario-screen__day-heading ios-caption-strong">{day.label}</span>
          {day.events.length === 0 ? (
            <div className="calendario-screen__empty">
              <span className="calendario-screen__empty-icon">📅</span>
              <p className="ios-body">Nenhum compromisso neste dia.</p>
            </div>
          ) : (
            <IosListGroup>
              {day.events.map((e) => (
                <IosListRow
                  key={e.id}
                  icon="🕐"
                  iconBg="var(--ios-blue)"
                  label={e.title}
                  sublabel={e.location}
                  value={e.time}
                  chevron
                  onClick={() => setSelectedEvent(e)}
                />
              ))}
            </IosListGroup>
          )}
        </>
      )}

      {selectedEvent && (
        <div className="calendario-screen__overlay" onClick={() => setSelectedEvent(null)}>
          <div className="calendario-screen__detail" onClick={(e) => e.stopPropagation()}>
            <span className="calendario-screen__detail-time">{selectedEvent.time}</span>
            <h2 className="ios-title1">{selectedEvent.title}</h2>
            {selectedEvent.location && <p className="calendario-screen__detail-location">📍 {selectedEvent.location}</p>}
            {selectedEvent.notes && <p className="calendario-screen__detail-notes">{selectedEvent.notes}</p>}
            {selectedEvent.hasDemoNav && (
              <button type="button" className="calendario-screen__nav-action" onClick={demoNavigate}>
                🧭 Navegar até o destino (demo)
              </button>
            )}
            <button type="button" className="calendario-screen__detail-close" onClick={() => setSelectedEvent(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {navToast && <div className="calendario-screen__toast">Destino demo definido na Navegação</div>}
    </div>
  );
}
