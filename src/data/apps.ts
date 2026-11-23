import googleMaps from '../assets/icons/google-maps.png';
import spotify from '../assets/icons/spotify.png';
import radio from '../assets/icons/radio.png';
import fahrzeug from '../assets/icons/fahrzeug.png';
import auftrag from '../assets/icons/auftrag.png';
import mitteilungen from '../assets/icons/mitteilungen.png';
import nachrichten from '../assets/icons/nachrichten.png';
import tankenRasten from '../assets/icons/tanken-rasten.png';
import fahrtenbuch from '../assets/icons/fahrtenbuch.png';
import kalender from '../assets/icons/kalender.png';

export interface AppDefinition {
  id: string;
  label: string;
  icon: string;
}

export const homeApps: AppDefinition[] = [
  { id: 'google-maps', label: 'Google Maps', icon: googleMaps },
  { id: 'spotify', label: 'Spotify', icon: spotify },
  { id: 'radio', label: 'Radio', icon: radio },
  { id: 'fahrzeug', label: 'Fahrzeug', icon: fahrzeug },
  { id: 'auftrag', label: 'Auftrag', icon: auftrag },
  { id: 'mitteilungen', label: 'Mitteilungen', icon: mitteilungen },
  { id: 'nachrichten', label: 'Nachrichten', icon: nachrichten },
  { id: 'tanken-rasten', label: 'Tanken & Rasten', icon: tankenRasten },
  { id: 'fahrtenbuch', label: 'Fahrtenbuch', icon: fahrtenbuch },
  { id: 'kalender', label: 'Kalender', icon: kalender },
];
