#pragma once

#include <atomic>
#include <functional>
#include <string>
#include <thread>

namespace neoblade::ipc {

// Named pipe `\\.\pipe\NeoBladeConnectOS_Control`, newline-delimited JSON,
// DLL-is-server / host-is-client (the DLL is guaranteed to be loaded before
// any host process exists, so it owns the pipe's lifetime). One line out
// per tick (telemetry snapshot, rate-limited — see kSnapshotIntervalMs in
// control_pipe.cpp), zero or more lines in (host -> plugin control
// messages: interaction-mode state, handshake). Never blocks the calling
// (game) thread: all socket I/O happens on its own background thread
// started by Start() and joined by Stop().
class ControlPipe {
 public:
  using ControlMessageHandler = std::function<void(const std::string& messageType, const std::string& rawJson)>;
  using InteractionModeGetter = std::function<bool()>;

  ControlPipe(ControlMessageHandler onMessage, InteractionModeGetter getInteractionMode);
  ~ControlPipe();

  void Start();
  void Stop();
  bool IsHostConnected() const { return connected_.load(std::memory_order_relaxed); }

 private:
  void Run();

  ControlMessageHandler onMessage_;
  InteractionModeGetter getInteractionMode_;
  std::thread thread_;
  std::atomic<bool> running_{false};
  std::atomic<bool> connected_{false};
};

}  // namespace neoblade::ipc
