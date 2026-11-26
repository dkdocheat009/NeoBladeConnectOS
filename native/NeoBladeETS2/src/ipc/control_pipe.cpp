#include "control_pipe.hpp"

#include <windows.h>

#include <chrono>
#include <cstring>
#include <string>

#include "../logging.hpp"
#include "../telemetry.hpp"
#include "../version.h"
#include "json_writer.hpp"

namespace neoblade::ipc {

namespace {

constexpr wchar_t kPipeName[] = L"\\\\.\\pipe\\NeoBladeConnectOS_Control";
constexpr DWORD kSnapshotIntervalMs = 100;  // 10 Hz — "sem polling agressivo"
constexpr DWORD kReadPollTimeoutMs = 20;

std::string SerializeSnapshot(const TelemetrySnapshot& s, bool interactionModeActive) {
  JsonWriter truck;
  truck.Field("valid", s.truck.valid)
      .Field("posX", s.truck.posX)
      .Field("posY", s.truck.posY)
      .Field("posZ", s.truck.posZ)
      .Field("headingTurns", static_cast<double>(s.truck.headingTurns))
      .Field("pitchTurns", static_cast<double>(s.truck.pitchTurns))
      .Field("rollTurns", static_cast<double>(s.truck.rollTurns))
      .Field("speedMs", static_cast<double>(s.truck.speedMs))
      .Field("engineRpm", static_cast<double>(s.truck.engineRpm))
      .Field("displayedGear", static_cast<int64_t>(s.truck.displayedGear))
      .Field("fuelLiters", static_cast<double>(s.truck.fuelLiters))
      .Field("fuelRangeKm", static_cast<double>(s.truck.fuelRangeKm))
      .Field("fuelWarning", s.truck.fuelWarning)
      .Field("parkingBrake", s.truck.parkingBrake)
      .Field("retarderLevel", s.truck.retarderLevel)
      .Field("cruiseControlMs", static_cast<double>(s.truck.cruiseControlMs))
      .Field("engineDamage", static_cast<double>(s.truck.engineDamage))
      .Field("transmissionDamage", static_cast<double>(s.truck.transmissionDamage))
      .Field("cabinDamage", static_cast<double>(s.truck.cabinDamage))
      .Field("chassisDamage", static_cast<double>(s.truck.chassisDamage))
      .Field("wheelsDamage", static_cast<double>(s.truck.wheelsDamage))
      .Field("lightsParking", s.truck.lightsParking)
      .Field("lightsBeamLow", s.truck.lightsBeamLow)
      .Field("lightsBeamHigh", s.truck.lightsBeamHigh)
      .Field("blinkerLeft", s.truck.blinkerLeft)
      .Field("blinkerRight", s.truck.blinkerRight);

  JsonWriter trailer;
  trailer.Field("connected", s.trailer.connected)
      .Field("posX", s.trailer.posX)
      .Field("posY", s.trailer.posY)
      .Field("posZ", s.trailer.posZ)
      .Field("cargoDamage", static_cast<double>(s.trailer.cargoDamage));

  JsonWriter job;
  job.Field("onJob", s.job.onJob)
      .Field("cargoMassKg", static_cast<double>(s.job.cargoMassKg))
      .Field("incomeCents", s.job.incomeCents)
      .Field("remainingDistanceM", s.job.remainingDistanceM);

  JsonWriter root;
  root.Field("type", "telemetry")
      .Field("protocolVersion", static_cast<uint32_t>(NEOBLADE_ETS2_PROTOCOL_VERSION))
      .Field("lifecycle", s.lifecycle == GameLifecycle::Driving ? "driving"
                          : s.lifecycle == GameLifecycle::Paused ? "paused"
                                                                  : "unknown")
      .Field("renderTimeUs", static_cast<int64_t>(s.renderTimeUs))
      .Field("interactionModeActive", interactionModeActive)
      .RawField("truck", truck.Finish())
      .RawField("trailer", trailer.Finish())
      .RawField("job", job.Finish());
  return root.Finish();
}

// Extracts the bare string value of "type":"..." from a flat JSON control
// message without a full parser — sufficient for our own tiny, fixed
// message shapes (see src/integrations/ets2/types.ts ControlMessage).
std::string ExtractType(const std::string& json) {
  const std::string key = "\"type\":\"";
  const auto pos = json.find(key);
  if (pos == std::string::npos) return {};
  const auto start = pos + key.size();
  const auto end = json.find('"', start);
  if (end == std::string::npos) return {};
  return json.substr(start, end - start);
}

}  // namespace

ControlPipe::ControlPipe(ControlMessageHandler onMessage, InteractionModeGetter getInteractionMode)
    : onMessage_(std::move(onMessage)), getInteractionMode_(std::move(getInteractionMode)) {}

ControlPipe::~ControlPipe() { Stop(); }

void ControlPipe::Start() {
  if (running_.exchange(true)) return;
  thread_ = std::thread(&ControlPipe::Run, this);
}

void ControlPipe::Stop() {
  if (!running_.exchange(false)) return;
  if (thread_.joinable()) thread_.join();
}

void ControlPipe::Run() {
  neoblade::LogMessage(neoblade::LogCategory::Net, "control pipe: thread iniciada.");

  while (running_.load(std::memory_order_relaxed)) {
    HANDLE pipe = CreateNamedPipeW(kPipeName, PIPE_ACCESS_DUPLEX, PIPE_TYPE_MESSAGE | PIPE_READMODE_MESSAGE | PIPE_WAIT,
                                    1,  // one host at a time
                                    1 << 16, 1 << 16, 0, nullptr);
    if (pipe == INVALID_HANDLE_VALUE) {
      neoblade::LogMessage(neoblade::LogCategory::Net,
                            "control pipe: falha ao criar o pipe (GetLastError=" + std::to_string(GetLastError()) + ").");
      Sleep(1000);
      continue;
    }

    neoblade::LogMessage(neoblade::LogCategory::Net, "control pipe: aguardando o host conectar...");
    const BOOL connectedNow = ConnectNamedPipe(pipe, nullptr) ? TRUE : (GetLastError() == ERROR_PIPE_CONNECTED);
    if (!connectedNow) {
      CloseHandle(pipe);
      continue;
    }

    connected_.store(true, std::memory_order_relaxed);
    neoblade::LogMessage(neoblade::LogCategory::Net, "control pipe: host conectado.");

    auto lastSnapshotAt = std::chrono::steady_clock::now() - std::chrono::milliseconds(kSnapshotIntervalMs);
    char readBuffer[4096];
    std::string pending;

    while (running_.load(std::memory_order_relaxed)) {
      // Drain any pending control messages without blocking for long.
      DWORD bytesAvailable = 0;
      if (PeekNamedPipe(pipe, nullptr, 0, nullptr, &bytesAvailable, nullptr) && bytesAvailable > 0) {
        DWORD bytesRead = 0;
        if (ReadFile(pipe, readBuffer, sizeof(readBuffer) - 1, &bytesRead, nullptr) && bytesRead > 0) {
          readBuffer[bytesRead] = '\0';
          pending.append(readBuffer, bytesRead);
          size_t newlinePos;
          while ((newlinePos = pending.find('\n')) != std::string::npos) {
            std::string line = pending.substr(0, newlinePos);
            pending.erase(0, newlinePos + 1);
            if (!line.empty() && onMessage_) {
              onMessage_(ExtractType(line), line);
            }
          }
        } else {
          break;  // host disconnected or pipe broken
        }
      }

      const auto now = std::chrono::steady_clock::now();
      if (std::chrono::duration_cast<std::chrono::milliseconds>(now - lastSnapshotAt).count() >= kSnapshotIntervalMs) {
        lastSnapshotAt = now;
        const bool interactionMode = getInteractionMode_ ? getInteractionMode_() : false;
        std::string line = SerializeSnapshot(GetLatestSnapshot(), interactionMode) + "\n";
        DWORD written = 0;
        if (!WriteFile(pipe, line.data(), static_cast<DWORD>(line.size()), &written, nullptr)) {
          break;  // host disconnected
        }
      }

      Sleep(kReadPollTimeoutMs);
    }

    connected_.store(false, std::memory_order_relaxed);
    DisconnectNamedPipe(pipe);
    CloseHandle(pipe);
    neoblade::LogMessage(neoblade::LogCategory::Net, "control pipe: host desconectado; aguardando reconexao.");
  }

  neoblade::LogMessage(neoblade::LogCategory::Net, "control pipe: thread encerrada.");
}

}  // namespace neoblade::ipc
