import googleMaps from '../assets/icons/google-maps.png';
import spotify from '../assets/icons/spotify.png';
import radio from '../assets/icons/radio.png';
import auftrag from '../assets/icons/auftrag.png';
import tankenRasten from '../assets/icons/tanken-rasten.png';
import fahrtenbuch from '../assets/icons/fahrtenbuch.png';

export interface AppDefinition {
  id: string;
  label: string;
  /** Static icon image. Omitted for apps rendered with a dynamic glyph (see AppGrid). */
  icon?: string;
}

// Legendas traduzidas para português (Fase 2). Google Maps e Spotify são
// nomes de marca e foram preservados. Ícones são recortes da referência
// local; mitteilungen/nachrichten/fahrzeug/kalender são renderizados com
// glyphs dinâmicos (SVG ou estado mock) — ver AppGrid.
export const homeApps: AppDefinition[] = [
  { id: 'google-maps', label: 'Google Maps', icon: googleMaps },
  { id: 'spotify', label: 'Spotify', icon: spotify },
  { id: 'radio', label: 'Rádio', icon: radio },
  { id: 'fahrzeug', label: 'Veículo' }, // ícone dinâmico: marca selecionada (ver AppGrid)
  { id: 'auftrag', label: 'Trabalho', icon: auftrag },
  { id: 'mitteilungen', label: 'Notificações' }, // ícone SVG + badge real (ver AppGrid)
  { id: 'nachrichten', label: 'Mensagens' }, // ícone SVG + badge real (ver AppGrid)
  { id: 'tanken-rasten', label: 'Abastecer e Descansar', icon: tankenRasten },
  { id: 'fahrtenbuch', label: 'Diário de Bordo', icon: fahrtenbuch },
  { id: 'kalender', label: 'Calendário' }, // ícone dinâmico: data do sistema (ver AppGrid)
  { id: 'esportes', label: 'Esportes' }, // ícone SVG (ver AppGrid) — Fase 4
];
