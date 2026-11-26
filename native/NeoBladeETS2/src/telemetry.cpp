#include "telemetry.hpp"

#include <common/scssdk_telemetry_truck_common_channels.h>
#include <common/scssdk_telemetry_trailer_common_channels.h>
#include <common/scssdk_telemetry_job_common_channels.h>

#include <mutex>
#include <string>
#include <vector>

#include "logging.hpp"

// Some wear/light/trailer/job channel macro names below were not verified
// against a live header fetch in this session (only the "confirmed" block
// was read from the vendored header's raw source — see
// docs/ETS2_ARCHITECTURE.md, "Canais de telemetria usados"). Each guessed
// macro is wrapped in `#ifdef` so an unrecognized name is a silent,
// documented skip (the field just never updates) rather than a hard
// compile failure that would block the whole plugin. If a name below
// doesn't match your vendored scssdk_telemetry_truck_common_channels.h,
// grep that header for the right one and adjust.
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_wear_engine)
#define SCS_TELEMETRY_TRUCK_CHANNEL_wear_engine "truck.wear.engine"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_wear_transmission)
#define SCS_TELEMETRY_TRUCK_CHANNEL_wear_transmission "truck.wear.transmission"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_wear_cabin)
#define SCS_TELEMETRY_TRUCK_CHANNEL_wear_cabin "truck.wear.cabin"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_wear_chassis)
#define SCS_TELEMETRY_TRUCK_CHANNEL_wear_chassis "truck.wear.chassis"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_wear_wheels)
#define SCS_TELEMETRY_TRUCK_CHANNEL_wear_wheels "truck.wear.wheels"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_light_parking)
#define SCS_TELEMETRY_TRUCK_CHANNEL_light_parking "truck.light.parking"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_light_low_beam)
#define SCS_TELEMETRY_TRUCK_CHANNEL_light_low_beam "truck.light.beam.low"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_light_high_beam)
#define SCS_TELEMETRY_TRUCK_CHANNEL_light_high_beam "truck.light.beam.high"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_light_lblinker)
#define SCS_TELEMETRY_TRUCK_CHANNEL_light_lblinker "truck.light.lblinker"
#endif
#if !defined(SCS_TELEMETRY_TRUCK_CHANNEL_light_rblinker)
#define SCS_TELEMETRY_TRUCK_CHANNEL_light_rblinker "truck.light.rblinker"
#endif
#if !defined(SCS_TELEMETRY_TRAILER_CHANNEL_connected)
#define SCS_TELEMETRY_TRAILER_CHANNEL_connected "trailer.connected"
#endif
#if !defined(SCS_TELEMETRY_TRAILER_CHANNEL_world_placement)
#define SCS_TELEMETRY_TRAILER_CHANNEL_world_placement "trailer.world.placement"
#endif
#if !defined(SCS_TELEMETRY_TRAILER_CHANNEL_wear_cargo)
#define SCS_TELEMETRY_TRAILER_CHANNEL_wear_cargo "trailer.wear.cargo"
#endif
#if !defined(SCS_TELEMETRY_JOB_CHANNEL_cargo_mass)
#define SCS_TELEMETRY_JOB_CHANNEL_cargo_mass "job.cargo.mass"
#endif
#if !defined(SCS_TELEMETRY_JOB_CHANNEL_income)
#define SCS_TELEMETRY_JOB_CHANNEL_income "job.income"
#endif

namespace neoblade {
namespace {

std::mutex g_snapshotMutex;
TelemetrySnapshot g_snapshot;
scs_telemetry_unregister_from_channel_t g_unregisterChannel = nullptr;
scs_telemetry_unregister_from_event_t g_unregisterEvent = nullptr;

// Every channel we successfully registered for, so ShutdownTelemetry() can
// unregister the exact same (name, index, type) tuples instead of guessing.
struct RegisteredChannel {
  const char* name;
  scs_u32_t index;
  scs_value_type_t type;
};
std::vector<RegisteredChannel>& RegisteredChannels() {
  static std::vector<RegisteredChannel> list;
  return list;
}

void TryRegisterChannel(const scs_telemetry_init_params_v101_t& params, const char* name, scs_u32_t index,
                         scs_value_type_t type, scs_telemetry_channel_callback_t callback, scs_u32_t flags = SCS_TELEMETRY_CHANNEL_FLAG_none) {
  const scs_result_t result = params.register_for_channel(name, index, type, flags, callback, nullptr);
  if (result == SCS_RESULT_ok) {
    RegisteredChannels().push_back({name, index, type});
  } else {
    LogMessage(LogCategory::Sdk, std::string("canal indisponivel nesta instalacao/versao: ") + name +
                                      " (scs_result=" + std::to_string(result) + ")");
  }
}

// --- Channel callbacks -----------------------------------------------------
// Every callback just copies the one value it owns into g_snapshot under the
// lock. None of them call back into the game — SCS_TELEMETRY_CHANNEL_FLAG_none
// means "only called when the value actually changes", so this stays cheap.

void OnTruckWorldPlacement(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {
  if (!value || value->type != SCS_VALUE_TYPE_dplacement) return;
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.truck.posX = value->value_dplacement.position.x;
  g_snapshot.truck.posY = value->value_dplacement.position.y;
  g_snapshot.truck.posZ = value->value_dplacement.position.z;
  g_snapshot.truck.headingTurns = value->value_dplacement.orientation.heading;
  g_snapshot.truck.pitchTurns = value->value_dplacement.orientation.pitch;
  g_snapshot.truck.rollTurns = value->value_dplacement.orientation.roll;
}

#define NEOBLADE_FLOAT_CALLBACK(fn, field)                                                                   \
  void fn(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {        \
    if (!value || value->type != SCS_VALUE_TYPE_float) return;                                               \
    std::lock_guard<std::mutex> lock(g_snapshotMutex);                                                       \
    field = value->value_float.value;                                                                        \
  }

#define NEOBLADE_BOOL_CALLBACK(fn, field)                                                                    \
  void fn(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {        \
    if (!value || value->type != SCS_VALUE_TYPE_bool) return;                                                \
    std::lock_guard<std::mutex> lock(g_snapshotMutex);                                                       \
    field = value->value_bool.value != 0;                                                                     \
  }

NEOBLADE_FLOAT_CALLBACK(OnSpeed, g_snapshot.truck.speedMs)
NEOBLADE_FLOAT_CALLBACK(OnEngineRpm, g_snapshot.truck.engineRpm)
NEOBLADE_FLOAT_CALLBACK(OnFuel, g_snapshot.truck.fuelLiters)
NEOBLADE_FLOAT_CALLBACK(OnFuelRange, g_snapshot.truck.fuelRangeKm)
NEOBLADE_FLOAT_CALLBACK(OnCruiseControl, g_snapshot.truck.cruiseControlMs)
NEOBLADE_FLOAT_CALLBACK(OnWearEngine, g_snapshot.truck.engineDamage)
NEOBLADE_FLOAT_CALLBACK(OnWearTransmission, g_snapshot.truck.transmissionDamage)
NEOBLADE_FLOAT_CALLBACK(OnWearCabin, g_snapshot.truck.cabinDamage)
NEOBLADE_FLOAT_CALLBACK(OnWearChassis, g_snapshot.truck.chassisDamage)
NEOBLADE_FLOAT_CALLBACK(OnWearWheels, g_snapshot.truck.wheelsDamage)
NEOBLADE_FLOAT_CALLBACK(OnJobCargoMass, g_snapshot.job.cargoMassKg)

NEOBLADE_BOOL_CALLBACK(OnFuelWarning, g_snapshot.truck.fuelWarning)
NEOBLADE_BOOL_CALLBACK(OnParkingBrake, g_snapshot.truck.parkingBrake)
NEOBLADE_BOOL_CALLBACK(OnLightParking, g_snapshot.truck.lightsParking)
NEOBLADE_BOOL_CALLBACK(OnLightLowBeam, g_snapshot.truck.lightsBeamLow)
NEOBLADE_BOOL_CALLBACK(OnLightHighBeam, g_snapshot.truck.lightsBeamHigh)
NEOBLADE_BOOL_CALLBACK(OnBlinkerLeft, g_snapshot.truck.blinkerLeft)
NEOBLADE_BOOL_CALLBACK(OnBlinkerRight, g_snapshot.truck.blinkerRight)
NEOBLADE_BOOL_CALLBACK(OnTrailerConnected, g_snapshot.trailer.connected)

void OnDisplayedGear(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {
  if (!value || value->type != SCS_VALUE_TYPE_s32) return;
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.truck.displayedGear = value->value_s32.value;
}

void OnRetarderLevel(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {
  if (!value || value->type != SCS_VALUE_TYPE_u32) return;
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.truck.retarderLevel = value->value_u32.value;
}

void OnTrailerWorldPlacement(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {
  if (!value || value->type != SCS_VALUE_TYPE_dplacement) return;
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.trailer.posX = value->value_dplacement.position.x;
  g_snapshot.trailer.posY = value->value_dplacement.position.y;
  g_snapshot.trailer.posZ = value->value_dplacement.position.z;
}

void OnTrailerCargoWear(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {
  if (!value || value->type != SCS_VALUE_TYPE_float) return;
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.trailer.cargoDamage = value->value_float.value;
}

void OnJobIncome(const scs_string_t, const scs_u32_t, const scs_value_t* const value, const scs_context_t) {
  if (!value) return;
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  if (value->type == SCS_VALUE_TYPE_s64) {
    g_snapshot.job.incomeCents = value->value_s64.value;
  } else if (value->type == SCS_VALUE_TYPE_u64) {
    g_snapshot.job.incomeCents = static_cast<int64_t>(value->value_u64.value);
  }
}

// --- Lifecycle events --------------------------------------------------
// Per scssdk_telemetry_event.h: event_info is NULL for paused/started.

SCSAPI_VOID OnPausedEvent(const scs_event_t, const void* const, const scs_context_t) {
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.lifecycle = GameLifecycle::Paused;
  g_snapshot.truck.valid = false;
}

SCSAPI_VOID OnStartedEvent(const scs_event_t, const void* const, const scs_context_t) {
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.lifecycle = GameLifecycle::Driving;
  g_snapshot.truck.valid = true;
}

SCSAPI_VOID OnFrameStart(const scs_event_t, const void* const eventInfo, const scs_context_t) {
  const auto* info = static_cast<const scs_telemetry_frame_start_t*>(eventInfo);
  if (!info) return;
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  g_snapshot.renderTimeUs = info->render_time;
}

}  // namespace

scs_result_t InitTelemetry(const scs_telemetry_init_params_v101_t& params) {
  g_unregisterChannel = params.unregister_from_channel;
  g_unregisterEvent = params.unregister_from_event;

  {
    std::lock_guard<std::mutex> lock(g_snapshotMutex);
    g_snapshot = TelemetrySnapshot{};
    g_snapshot.protocolVersion = 1;
  }

  // Lifecycle/frame events. These three are expected to always be present
  // (part of the base 1.00 telemetry event set) so a failure here is a real
  // init failure, not a "channel not supported" situation.
  scs_result_t result = params.register_for_event(SCS_TELEMETRY_EVENT_paused, &OnPausedEvent, nullptr);
  if (result != SCS_RESULT_ok) return result;
  result = params.register_for_event(SCS_TELEMETRY_EVENT_started, &OnStartedEvent, nullptr);
  if (result != SCS_RESULT_ok) return result;
  result = params.register_for_event(SCS_TELEMETRY_EVENT_frame_start, &OnFrameStart, nullptr);
  if (result != SCS_RESULT_ok) return result;

  // Core truck channels — confirmed against the vendored SDK header.
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_world_placement, SCS_U32_NIL, SCS_VALUE_TYPE_dplacement, &OnTruckWorldPlacement);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_speed, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnSpeed);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_engine_rpm, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnEngineRpm);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_displayed_gear, SCS_U32_NIL, SCS_VALUE_TYPE_s32, &OnDisplayedGear);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_fuel, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnFuel);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_fuel_range, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnFuelRange);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_fuel_warning, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnFuelWarning);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_parking_brake, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnParkingBrake);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_retarder_level, SCS_U32_NIL, SCS_VALUE_TYPE_u32, &OnRetarderLevel);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_cruise_control, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnCruiseControl);

  // Best-effort channels (see the #ifdef block at the top of this file).
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_wear_engine, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnWearEngine);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_wear_transmission, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnWearTransmission);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_wear_cabin, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnWearCabin);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_wear_chassis, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnWearChassis);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_wear_wheels, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnWearWheels);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_light_parking, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnLightParking);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_light_low_beam, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnLightLowBeam);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_light_high_beam, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnLightHighBeam);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_light_lblinker, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnBlinkerLeft);
  TryRegisterChannel(params, SCS_TELEMETRY_TRUCK_CHANNEL_light_rblinker, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnBlinkerRight);

  TryRegisterChannel(params, SCS_TELEMETRY_TRAILER_CHANNEL_connected, SCS_U32_NIL, SCS_VALUE_TYPE_bool, &OnTrailerConnected);
  TryRegisterChannel(params, SCS_TELEMETRY_TRAILER_CHANNEL_world_placement, SCS_U32_NIL, SCS_VALUE_TYPE_dplacement, &OnTrailerWorldPlacement);
  TryRegisterChannel(params, SCS_TELEMETRY_TRAILER_CHANNEL_wear_cargo, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnTrailerCargoWear);

  TryRegisterChannel(params, SCS_TELEMETRY_JOB_CHANNEL_cargo_mass, SCS_U32_NIL, SCS_VALUE_TYPE_float, &OnJobCargoMass);
  TryRegisterChannel(params, SCS_TELEMETRY_JOB_CHANNEL_income, SCS_U32_NIL, SCS_VALUE_TYPE_s64, &OnJobIncome);

  LogMessage(LogCategory::Sdk, "telemetria inicializada; " + std::to_string(RegisteredChannels().size()) + " canais registrados.");
  return SCS_RESULT_ok;
}

void ShutdownTelemetry() {
  if (g_unregisterChannel) {
    for (const auto& ch : RegisteredChannels()) {
      g_unregisterChannel(ch.name, ch.index, ch.type);
    }
  }
  RegisteredChannels().clear();
  if (g_unregisterEvent) {
    g_unregisterEvent(SCS_TELEMETRY_EVENT_paused);
    g_unregisterEvent(SCS_TELEMETRY_EVENT_started);
    g_unregisterEvent(SCS_TELEMETRY_EVENT_frame_start);
  }
  g_unregisterChannel = nullptr;
  g_unregisterEvent = nullptr;
  LogMessage(LogCategory::Sdk, "telemetria desligada.");
}

TelemetrySnapshot GetLatestSnapshot() {
  std::lock_guard<std::mutex> lock(g_snapshotMutex);
  return g_snapshot;
}

}  // namespace neoblade
