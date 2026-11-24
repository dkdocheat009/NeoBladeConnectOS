// Dados 100% mock/determinísticos para o app Veículo (Fase 4). Não há
// telemetria real nem comunicação com o ETS2 — apenas valores fixos
// inspirados na referência (fahrzeug.png / de/truck.png).

export interface VehicleOverview {
  speedKmh: number;
  gear: number;
  rpm: number;
  cruiseKmh: number | null;
  tankLiters: number;
  tankCapacity: number;
  rangeKm: number;
  adBlueLiters: number;
  adBlueCapacity: number;
  blinker: 'left' | 'right' | null;
  lightsOn: boolean;
  retarder: number;
  handbrakeOn: boolean;
}

export interface VehicleCondition {
  motorPct: number;
  gearboxPct: number;
  cabinPct: number;
  chassisPct: number;
  wheelsPct: number;
  oilTempC: number;
  waterTempC: number;
  avgConsumption: string;
  odometerKm: number;
}

export interface TrailerInfo {
  attached: boolean;
  name?: string;
  cargoPct?: number;
  brakesPct?: number;
  tiresPct?: number;
  lightsPct?: number;
  weightT?: number;
  axles?: number;
}

export const vehicleOverview: VehicleOverview = {
  speedKmh: 74,
  gear: 12,
  rpm: 1445,
  cruiseKmh: null,
  tankLiters: 486,
  tankCapacity: 600,
  rangeKm: 1530,
  adBlueLiters: 61,
  adBlueCapacity: 80,
  blinker: null,
  lightsOn: true,
  retarder: 2,
  handbrakeOn: true,
};

export const vehicleCondition: VehicleCondition = {
  motorPct: 96,
  gearboxPct: 97,
  cabinPct: 93,
  chassisPct: 95,
  wheelsPct: 89,
  oilTempC: 92,
  waterTempC: 86,
  avgConsumption: '31,4 l/100 km',
  odometerKm: 284310,
};

export const trailerAttached: TrailerInfo = {
  attached: true,
  name: 'Semirreboque Frigorífico',
  cargoPct: 78,
  brakesPct: 91,
  tiresPct: 84,
  lightsPct: 97,
  weightT: 18.2,
  axles: 3,
};

export const trailerEmpty: TrailerInfo = { attached: false };

export const brandModelById: Record<string, { model: string; plate: string; powerHp: number; year: number }> = {
  scania: { model: 'Scania S 730', plate: 'ETS2-7301', powerHp: 730, year: 2023 },
  volvo: { model: 'Volvo FH16 750', plate: 'ETS2-7502', powerHp: 750, year: 2024 },
  mercedes: { model: 'Mercedes-Benz Actros 1863', plate: 'ETS2-1863', powerHp: 625, year: 2023 },
  daf: { model: 'DAF XG+ 480', plate: 'ETS2-4804', powerHp: 480, year: 2022 },
  man: { model: 'MAN TGX 18.510', plate: 'ETS2-5105', powerHp: 510, year: 2023 },
  iveco: { model: 'Iveco S-Way 570', plate: 'ETS2-5706', powerHp: 570, year: 2024 },
  renault: { model: 'Renault T High 520', plate: 'ETS2-5207', powerHp: 520, year: 2022 },
};
