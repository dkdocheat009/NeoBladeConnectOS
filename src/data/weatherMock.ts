// Dados mock determinísticos para o app Clima (Fase 4). Reproduz a
// composição de wetter.png / de/weather.png (também en/weather.png) —
// sem API real nem localização real. Dias usam a data real do sistema
// apenas para rotular a semana em português (mesma lógica do Calendário),
// não para buscar previsão de verdade.

export type WeatherIcon = 'sun' | 'cloud' | 'rain' | 'moon' | 'partly';

export interface HourForecast {
  label: string;
  icon: WeatherIcon;
  tempC: number;
}

export interface DayForecast {
  label: string;
  icon: WeatherIcon;
  precipPct?: number;
  lowC: number;
  highC: number;
}

export const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const currentConditions = {
  city: 'Amsterdã',
  tempC: 11,
  condition: 'Limpo',
  highC: 14,
  lowC: 10,
  feelsLikeC: 9,
  windKmh: 14,
  note: 'clima de demonstração para Amsterdã',
};

export const hourlyForecast: HourForecast[] = [
  { label: 'Agora', icon: 'moon', tempC: 12 },
  { label: '20h', icon: 'partly', tempC: 11 },
  { label: '21h', icon: 'cloud', tempC: 11 },
  { label: '22h', icon: 'cloud', tempC: 11 },
  { label: '23h', icon: 'cloud', tempC: 11 },
  { label: '00h', icon: 'cloud', tempC: 11 },
  { label: '01h', icon: 'rain', tempC: 11 },
  { label: '02h', icon: 'rain', tempC: 10 },
  { label: '03h', icon: 'cloud', tempC: 10 },
  { label: '04h', icon: 'cloud', tempC: 11 },
  { label: '05h', icon: 'rain', tempC: 11 },
  { label: '06h', icon: 'cloud', tempC: 11 },
];

const DAILY_TEMPLATE: Array<{ icon: WeatherIcon; precipPct?: number; lowC: number; highC: number }> = [
  { icon: 'cloud', precipPct: 87, lowC: 10, highC: 14 },
  { icon: 'rain', lowC: 8, highC: 12 },
  { icon: 'cloud', lowC: 7, highC: 10 },
  { icon: 'sun', lowC: 4, highC: 9 },
  { icon: 'partly', lowC: 2, highC: 8 },
  { icon: 'rain', lowC: 0, highC: 6 },
];

export function buildDailyForecast(startDate: Date): DayForecast[] {
  return DAILY_TEMPLATE.map((entry, index) => {
    if (index === 0) {
      return { ...entry, label: 'Hoje' };
    }
    const d = new Date(startDate);
    d.setDate(d.getDate() + index);
    return { ...entry, label: WEEKDAYS_PT[d.getDay()] };
  });
}

export const CONDITION_LABELS: Record<WeatherIcon, string> = {
  sun: 'Sol',
  cloud: 'Nublado',
  rain: 'Chuva',
  moon: 'Limpo (noite)',
  partly: 'Parcialmente nublado',
};
