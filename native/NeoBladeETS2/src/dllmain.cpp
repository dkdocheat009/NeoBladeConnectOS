// NeoBladeConnectOS ETS2 plugin — entry point.
//
// Exports exactly the two functions SCS's telemetry API requires
// (scs_telemetry_init / scs_telemetry_shutdown, see NeoBladeETS2.def).
// Everything else (rendering, IPC, input) is started from inside
// scs_telemetry_init and torn down from scs_telemetry_shutdown, never from
// DllMain directly — per the Windows loader-lock rules (no CreateWindow,
// COM, or anything beyond kernel32 from DllMain) and per the SCS SDK's own
// warning that init/shutdown can be called more than once per process
// lifetime.
#include <windows.h>

#include <scssdk_telemetry.h>

#include <memory>
#include <string>

#include "input/hotkey_hook.hpp"
#include "ipc/control_pipe.hpp"
#include "logging.hpp"
#include "render/d3d11_hook.hpp"
#include "telemetry.hpp"
#include "version.h"

namespace {

std::unique_ptr<neoblade::input::HotkeyHook> g_hotkeyHook;
std::unique_ptr<neoblade::ipc::ControlPipe> g_controlPipe;
bool g_initialized = false;

void HandleControlMessage(const std::string& type, const std::string& rawJson) {
  if (type == "setDiagnosticMode") {
    // Tiny, fixed-shape message: {"type":"setDiagnosticMode","value":true}
    const bool value = rawJson.find("\"value\":true") != std::string::npos;
    neoblade::render::D3D11Hook::Instance().diagnosticMode.store(value);
    neoblade::LogMessage(neoblade::LogCategory::Net,
                          std::string("control pipe: modo diagnostico definido para ") + (value ? "true" : "false") +
                              " pelo host.");
  } else if (!type.empty()) {
    neoblade::LogMessage(neoblade::LogCategory::Net, "control pipe: mensagem de tipo desconhecido do host: " + type);
  }
}

}  // namespace

BOOL APIENTRY DllMain(HMODULE module, DWORD reason, LPVOID) {
  if (reason == DLL_PROCESS_ATTACH) {
    DisableThreadLibraryCalls(module);
  } else if (reason == DLL_PROCESS_DETACH) {
    // Defensive: if the game unloads us without ever calling
    // scs_telemetry_shutdown (should not happen per the SDK contract, but
    // "nao congelar/crash" is a harder requirement than "trust the host"),
    // make sure every hook still gets reverted.
    if (g_initialized) {
      neoblade::render::D3D11Hook::Instance().Uninstall();
      g_hotkeyHook.reset();
      g_controlPipe.reset();
      neoblade::ShutdownTelemetry();
      neoblade::ShutdownLogging();
      g_initialized = false;
    }
  }
  return TRUE;
}

extern "C" SCSAPI_RESULT scs_telemetry_init(const scs_u32_t version, const scs_telemetry_init_params_t* const params) {
  if (version != SCS_TELEMETRY_VERSION_1_01 && version != SCS_TELEMETRY_VERSION_1_00) {
    return SCS_RESULT_unsupported;
  }
  const auto* init = static_cast<const scs_telemetry_init_params_v101_t*>(params);
  if (!init || !init->register_for_event || !init->register_for_channel) {
    return SCS_RESULT_invalid_parameter;
  }

  neoblade::InitLogging();
  neoblade::LogMessage(neoblade::LogCategory::Sdk,
                        std::string("NeoBladeConnectOS ETS2 plugin ") + NEOBLADE_ETS2_PLUGIN_VERSION +
                            " inicializando (game_id=" + (init->common.game_id ? init->common.game_id : "?") + ").");

  const scs_result_t telemetryResult = neoblade::InitTelemetry(*init);
  if (telemetryResult != SCS_RESULT_ok) {
    neoblade::LogMessage(neoblade::LogCategory::Sdk, "InitTelemetry falhou; plugin permanece inativo.");
    return telemetryResult;
  }

  g_hotkeyHook = std::make_unique<neoblade::input::HotkeyHook>([](bool active) {
    neoblade::LogMessage(neoblade::LogCategory::Input,
                          std::string("modo de interacao: ") + (active ? "ativado" : "desativado"));
  });
  g_hotkeyHook->Install();

  g_controlPipe = std::make_unique<neoblade::ipc::ControlPipe>(
      &HandleControlMessage, [] { return g_hotkeyHook && g_hotkeyHook->IsInteractionModeActive(); });
  g_controlPipe->Start();

  // Rendering is the one subsystem allowed to fail softly and leave
  // everything else working — see D3D11Hook::Install()'s own comments.
  neoblade::render::D3D11Hook::Instance().Install();

  g_initialized = true;
  neoblade::LogMessage(neoblade::LogCategory::Sdk, "inicializacao concluida.");
  return SCS_RESULT_ok;
}

extern "C" SCSAPI_VOID scs_telemetry_shutdown() {
  if (!g_initialized) return;
  neoblade::LogMessage(neoblade::LogCategory::Sdk, "scs_telemetry_shutdown recebido; desligando.");

  neoblade::render::D3D11Hook::Instance().Uninstall();
  g_hotkeyHook.reset();
  g_controlPipe.reset();
  neoblade::ShutdownTelemetry();
  neoblade::ShutdownLogging();
  g_initialized = false;
}
