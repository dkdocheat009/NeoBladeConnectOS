#pragma once

#include <string>

namespace neoblade {

// Categories asked for by the Fase 10 task (section 9): SDK, render, frame,
// capture, webview2, input, map, net. One rotating log file per category
// under %LOCALAPPDATA%\NeoBladeConnectOS\logs\, rate-limited so a hook
// misfiring every frame can't fill the user's disk.
enum class LogCategory {
  Sdk,
  Render,
  Frame,
  Capture,
  WebView2,
  Input,
  Map,
  Net,
};

// Never pass a telemetry snapshot, a football-data.org token, recorded audio
// or a Siri transcript to this function — see docs/ETS2_ARCHITECTURE.md
// "Logs" section for the rule this enforces by convention (there is no
// automatic redaction; callers are responsible for not logging secrets).
void LogMessage(LogCategory category, const std::string& message);

// Called once from DllMain(DLL_PROCESS_ATTACH) before any other NeoBlade
// code runs, and from scs_telemetry_shutdown()/DLL_PROCESS_DETACH to flush
// and close the log handles cleanly.
void InitLogging();
void ShutdownLogging();

}  // namespace neoblade
