// Mirrors native/NeoBladeETS2/src/telemetry.hpp's TelemetrySnapshot and
// native/NeoBladeETS2/src/ipc/control_pipe.cpp's SerializeSnapshot() field
// names exactly — keep both in sync by hand (there is no shared codegen
// between C++ and TypeScript in this project). This is the ONLY place the
// rest of the app should reference these field names from.

export type GameLifecycle = 'unknown' | 'paused' | 'driving';

export interface TruckTelemetry {
  valid: boolean;
  posX: number;
  posY: number;
  posZ: number;
  headingTurns: number; // 0..1 turn, see scs_value_euler_t
  pitchTurns: number;
  rollTurns: number;

  speedMs: number;
  engineRpm: number;
  displayedGear: number;

  fuelLiters: number;
  fuelRangeKm: number;
  fuelWarning: boolean;

  parkingBrake: boolean;
  retarderLevel: number;
  cruiseControlMs: number;

  engineDamage: number;
  transmissionDamage: number;
  cabinDamage: number;
  chassisDamage: number;
  wheelsDamage: number;

  lightsParking: boolean;
  lightsBeamLow: boolean;
  lightsBeamHigh: boolean;
  blinkerLeft: boolean;
  blinkerRight: boolean;
}

export interface TrailerTelemetry {
  connected: boolean;
  posX: number;
  posY: number;
  posZ: number;
  cargoDamage: number;
}

export interface JobTelemetry {
  onJob: boolean;
  cargoMassKg: number;
  incomeCents: number;
  /** -1 means "not provided by the SCS SDK" — see docs/ETS2_ARCHITECTURE.md. */
  remainingDistanceM: number;
}

export interface TelemetrySnapshot {
  type: 'telemetry';
  protocolVersion: number;
  lifecycle: GameLifecycle;
  renderTimeUs: number;
  interactionModeActive: boolean;
  truck: TruckTelemetry;
  trailer: TrailerTelemetry;
  job: JobTelemetry;
}

export function isTelemetrySnapshot(value: unknown): value is TelemetrySnapshot {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { type?: unknown }).type === 'telemetry' &&
    typeof (value as { truck?: unknown }).truck === 'object'
  );
}

/** km/h, convenience conversion for the many UI spots that want this unit. */
export function speedKmh(truck: TruckTelemetry): number {
  return truck.speedMs * 3.6;
}
