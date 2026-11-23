import scaniaLogo from '../assets/icons/fahrzeug.png';
import volvoLogo from '../assets/brands/volvo.svg';
import mercedesLogo from '../assets/brands/mercedes-benz.svg';
import dafLogo from '../assets/brands/daf.svg';
import manLogo from '../assets/brands/man.svg';
import ivecoLogo from '../assets/brands/iveco.svg';
import renaultLogo from '../assets/brands/renault.svg';

export interface TruckBrand {
  id: string;
  name: string;
  /** Local logo asset. Omitted only for a brand unknown to the app (fallback). */
  logo?: string;
  // Ponto de extensão para a Fase de telemetria (fora de escopo agora):
  // quando implementada, dados como modelo, cavalos de força, etc. entram
  // aqui (ex.: `telemetry?: { model: string; horsepowerHp: number; ... }`).
  // Nenhuma leitura/gravação de telemetria é feita nesta fase.
}

/**
 * Marcas de caminhão disponíveis no seletor mock do atalho "Veículo".
 * Todas as 7 têm logo real:
 * - Scania: recorte da captura de referência local do projeto (home.png).
 * - Volvo, Mercedes-Benz, DAF, MAN, Iveco, Renault Trucks: SVGs obtidos no
 *   Wikimedia Commons, tag {{PD-textlogo}} (logo simples demais para ter
 *   direito autoral próprio — texto/geometria comum), sourced a partir dos
 *   sites oficiais de cada fabricante. Continuam sendo marcas registradas;
 *   usadas aqui apenas para identificação visual do veículo selecionado
 *   (uso nominativo, projeto pessoal não comercial). Ver README para as
 *   URLs de origem de cada arquivo.
 */
export const truckBrands: TruckBrand[] = [
  { id: 'scania', name: 'Scania', logo: scaniaLogo },
  { id: 'volvo', name: 'Volvo', logo: volvoLogo },
  { id: 'mercedes', name: 'Mercedes-Benz', logo: mercedesLogo },
  { id: 'daf', name: 'DAF', logo: dafLogo },
  { id: 'man', name: 'MAN', logo: manLogo },
  { id: 'iveco', name: 'Iveco', logo: ivecoLogo },
  { id: 'renault', name: 'Renault Trucks', logo: renaultLogo },
];
