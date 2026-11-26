#pragma once

#include <scssdk_telemetry.h>

#include <cstdint>

namespace neoblade {

// Mirrors src/integrations/ets2/types.ts::TelemetrySnapshot — keep both in
// sync by hand; there is no shared codegen between C++ and TypeScript in
// this project. Field names match the SCS channel they come from, not the
// other way around, so a diff against scssdk_telemetry_truck_common_channels.h
// stays easy.
struct TruckSnapshot {
  bool valid = false;  // false until the first SCS_TELEMETRY_EVENT_started

  double posX = 0, posY = 0, posZ = 0;  // truck.world.placement (meters)
  float headingTurns = 0;               // 0..1 turn, see scs_value_euler_t
  float pitchTurns = 0;
  float rollTurns = 0;

  float speedMs = 0;       // truck.speed (negative = reverse)
  float engineRpm = 0;     // truck.engine.rpm
  int32_t displayedGear = 0;  // truck.displayed.gear

  float fuelLiters = 0;       // truck.fuel.amount
  float fuelRangeKm = 0;      // truck.fuel.range
  bool fuelWarning = false;   // truck.fuel.warning

  bool parkingBrake = false;    // truck.brake.parking
  uint32_t retarderLevel = 0;   // truck.brake.retarder
  float cruiseControlMs = 0;    // truck.cruise_control

  float engineDamage = 0;       // truck.wear.engine (0..1)
  float transmissionDamage = 0; // truck.wear.transmission
  float cabinDamage = 0;        // truck.wear.cabin
  float chassisDamage = 0;      // truck.wear.chassis
  float wheelsDamage = 0;       // truck.wear.wheels

  bool lightsParking = false;
  bool lightsBeamLow = false;
  bool lightsBeamHigh = false;
  bool blinkerLeft = false;
  bool blinkerRight = false;
};

struct TrailerSnapshot {
  bool connected = false;  // trailer.connected
  double posX = 0, posY = 0, posZ = 0;
  float cargoDamage = 0;  // trailer.wear.cargo
};

struct JobSnapshot {
  bool onJob = false;
  float cargoMassKg = 0;      // job.cargo.mass
  int64_t incomeCents = 0;    // job.income (as reported; currency per game locale)
  double remainingDistanceM = -1;  // negative = not provided by SCS SDK; see
                                     // docs/ETS2_ARCHITECTURE.md "Navegação" section
};

enum class GameLifecycle { Unknown, Paused, Driving };

struct TelemetrySnapshot {
  uint32_t protocolVersion = 0;
  GameLifecycle lifecycle = GameLifecycle::Unknown;
  uint64_t renderTimeUs = 0;
  TruckSnapshot truck;
  TrailerSnapshot trailer;
  JobSnapshot job;
};

// Called once from scs_telemetry_init(). Registers every channel/event
// callback this plugin understands. Returns SCS_RESULT_ok or the first
// error encountered (and logs it) — telemetry.cpp never calls into the
// game's own control/physics APIs, only reads.
scs_result_t InitTelemetry(const scs_telemetry_init_params_v101_t& params);

// Called from scs_telemetry_shutdown(). Unregisters everything that was
// registered in InitTelemetry — safe to call even if init partially failed.
void ShutdownTelemetry();

// Thread-safe snapshot read, used by ipc::ControlPipe to serialize the
// latest known state to the host without blocking the game's render/sim
// thread on a pipe write.
TelemetrySnapshot GetLatestSnapshot();

}  // namespace neoblade
