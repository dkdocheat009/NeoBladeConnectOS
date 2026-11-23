import googleMaps from '../assets/icons/google-maps.png';
import spotify from '../assets/icons/spotify.png';
import radio from '../assets/icons/radio.png';
import auftrag from '../assets/icons/auftrag.png';
import mitteilungen from '../assets/icons/mitteilungen-clean.png';
import nachrichten from '../assets/icons/nachrichten-clean.png';
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
// local; mitteilungen/nachrichten usam versões "limpas" (sem badge
// desenhado) — o badge real é renderizado como elemento independente.
export const homeApps: AppDefinition[] = [
  { id: 'google-maps', label: 'Google Maps', icon: googleMaps },
  { id: 'spotify', label: 'Spotify', icon: spotify },
  { id: 'radio', label: 'Rádio', icon: radio },
  { id: 'fahrzeug', label: 'Veículo' }, // ícone dinâmico: marca selecionada (ver AppGrid)
  { id: 'auftrag', label: 'Trabalho', icon: auftrag },
  { id: 'mitteilungen', label: 'Notificações', icon: mitteilungen },
  { id: 'nachrichten', label: 'Mensagens', icon: nachrichten },
  { id: 'tanken-rasten', label: 'Abastecer e Descansar', icon: tankenRasten },
  { id: 'fahrtenbuch', label: 'Diário de Bordo', icon: fahrtenbuch },
  { id: 'kalender', label: 'Calendário' }, // ícone dinâmico: data do sistema (ver AppGrid)
];
