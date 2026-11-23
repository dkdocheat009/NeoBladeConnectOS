export interface RadioCategory {
  id: string;
  label: string;
}

export interface RadioStation {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  initials: string;
}

// Categorias e estações são 100% fictícias/mock — a tarefa pede
// explicitamente para não integrar emissoras reais nesta fase.
export const radioCategories: RadioCategory[] = [
  { id: 'de', label: 'Alemão' },
  { id: 'en', label: 'Inglês' },
  { id: 'usa', label: 'EUA' },
  { id: 'fav', label: 'Favoritas' },
  { id: 'ets2', label: 'ETS2' },
  { id: 'ats', label: 'ATS' },
  { id: 'own', label: 'Minhas' },
];

export const radioStations: RadioStation[] = [
  { id: 'radio-eins', name: 'Radio Eins', categoryId: 'de', color: '#e23d6b', initials: 'RE' },
  { id: 'kiesel-fm', name: 'Kiesel FM', categoryId: 'de', color: '#2f7fd6', initials: 'KF' },
  { id: 'nordwelle', name: 'Nordwelle', categoryId: 'de', color: '#2aa198', initials: 'NW' },
  { id: 'city-beat', name: 'City Beat', categoryId: 'de', color: '#9b59b6', initials: 'CB' },
  { id: 'fernfahrer-radio', name: 'Fernfahrer Radio', categoryId: 'de', color: '#e67e22', initials: 'FR' },
  { id: 'welle-7', name: 'Welle 7', categoryId: 'de', color: '#3f51b5', initials: 'W7' },

  { id: 'open-road-fm', name: 'Open Road FM', categoryId: 'en', color: '#16a085', initials: 'OR' },
  { id: 'truckers-choice', name: "Trucker's Choice", categoryId: 'en', color: '#c0392b', initials: 'TC' },
  { id: 'night-drive-radio', name: 'Night Drive Radio', categoryId: 'en', color: '#34495e', initials: 'ND' },
  { id: 'classic-rig', name: 'Classic Rig', categoryId: 'en', color: '#8e44ad', initials: 'CR' },

  { id: 'highway-66', name: 'Highway 66', categoryId: 'usa', color: '#d35400', initials: 'H66' },
  { id: 'route-radio', name: 'Route Radio', categoryId: 'usa', color: '#2980b9', initials: 'RR' },
  { id: 'big-rig-country', name: 'Big Rig Country', categoryId: 'usa', color: '#27ae60', initials: 'BR' },

  { id: 'top-mix', name: 'Top Mix', categoryId: 'fav', color: '#e74c3c', initials: 'TM' },
  { id: 'hit-parade', name: 'Hit Parade', categoryId: 'fav', color: '#f39c12', initials: 'HP' },

  { id: 'ets2-radio', name: 'ETS2 Radio', categoryId: 'ets2', color: '#1abc9c', initials: 'E2' },
  { id: 'euro-trucker-fm', name: 'Euro Trucker FM', categoryId: 'ets2', color: '#2c3e50', initials: 'ET' },

  { id: 'ats-country', name: 'ATS Country', categoryId: 'ats', color: '#a0522d', initials: 'AC' },
  { id: 'american-road', name: 'American Road', categoryId: 'ats', color: '#0b6e4f', initials: 'AR' },
];
