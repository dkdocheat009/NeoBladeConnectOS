import scaniaLogo from '../assets/icons/fahrzeug.png';

export interface TruckBrand {
  id: string;
  name: string;
  /** Local logo asset. Omitted when no correctly-licensed asset is available. */
  logo?: string;
}

/**
 * Mock/demo brand list for the Veículo shortcut. Only Scania has a real
 * logo asset available locally (reused from the original home.png crop).
 * The other brands intentionally have no `logo` — no logo is invented for
 * them; the UI falls back to a neutral placeholder instead. Getting the
 * correctly licensed marks for Volvo, Mercedes-Benz, DAF, MAN, Iveco and
 * Renault is a pending item (see README "Limitações").
 */
export const truckBrands: TruckBrand[] = [
  { id: 'scania', name: 'Scania', logo: scaniaLogo },
  { id: 'volvo', name: 'Volvo' },
  { id: 'mercedes', name: 'Mercedes-Benz' },
  { id: 'daf', name: 'DAF' },
  { id: 'man', name: 'MAN' },
  { id: 'iveco', name: 'Iveco' },
  { id: 'renault', name: 'Renault' },
];
