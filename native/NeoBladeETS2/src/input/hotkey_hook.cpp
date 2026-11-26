#include "hotkey_hook.hpp"

#include <string>

#include "../logging.hpp"

namespace neoblade::input {

namespace {
// WH_KEYBOARD_LL's callback has a fixed signature with no user-data slot,
// so it needs a process-wide pointer back to the one HotkeyHook instance
// this plugin ever creates (see dllmain.cpp).
HotkeyHook* g_activeInstance = nullptr;
}  // namespace

HotkeyHook::HotkeyHook(ToggleHandler onInteractionModeChanged) : onToggle_(std::move(onInteractionModeChanged)) {}

HotkeyHook::~HotkeyHook() { Uninstall(); }

void HotkeyHook::Install() {
  if (hookHandle_) return;
  g_activeInstance = this;
  hookHandle_ = SetWindowsHookExW(WH_KEYBOARD_LL, &HotkeyHook::LowLevelProc, GetModuleHandleW(nullptr), 0);
  if (!hookHandle_) {
    neoblade::LogMessage(neoblade::LogCategory::Input,
                          "HotkeyHook: SetWindowsHookExW falhou (GetLastError=" + std::to_string(GetLastError()) + ").");
    g_activeInstance = nullptr;
    return;
  }
  neoblade::LogMessage(neoblade::LogCategory::Input, "HotkeyHook: instalado (Ctrl+Alt+I alterna o modo de interacao).");
}

void HotkeyHook::Uninstall() {
  if (!hookHandle_) return;
  UnhookWindowsHookEx(hookHandle_);
  hookHandle_ = nullptr;
  if (g_activeInstance == this) g_activeInstance = nullptr;
  neoblade::LogMessage(neoblade::LogCategory::Input, "HotkeyHook: removido.");
}

LRESULT CALLBACK HotkeyHook::LowLevelProc(int code, WPARAM wParam, LPARAM lParam) {
  if (code == HC_ACTION && g_activeInstance) {
    const auto& info = *reinterpret_cast<const KBDLLHOOKSTRUCT*>(lParam);
    bool swallow = false;
    g_activeInstance->HandleKeyEvent(wParam, info, swallow);
    if (swallow) return 1;  // non-zero return from a WH_KEYBOARD_LL hook swallows the key
  }
  return CallNextHookEx(nullptr, code, wParam, lParam);
}

void HotkeyHook::HandleKeyEvent(WPARAM wParam, const KBDLLHOOKSTRUCT& info, bool& outSwallow) {
  outSwallow = false;
  if (wParam != WM_KEYDOWN && wParam != WM_SYSKEYDOWN) return;

  const bool ctrlDown = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
  const bool altDown = (GetAsyncKeyState(VK_MENU) & 0x8000) != 0;

  if (info.vkCode == 'I' && ctrlDown && altDown) {
    interactionModeActive_ = !interactionModeActive_;
    neoblade::LogMessage(neoblade::LogCategory::Input,
                          std::string("Ctrl+Alt+I: modo de interacao agora ") +
                              (interactionModeActive_ ? "ATIVO (mouse/teclado vao para a interface)."
                                                       : "INATIVO (controles voltam para o jogo)."));
    if (onToggle_) onToggle_(interactionModeActive_);
    outSwallow = true;  // never let Ctrl+Alt+I reach the game's own bindings
    return;
  }

  if (info.vkCode == VK_ESCAPE && interactionModeActive_) {
    interactionModeActive_ = false;
    neoblade::LogMessage(neoblade::LogCategory::Input, "Escape: modo de interacao liberado, controles voltam para o jogo.");
    if (onToggle_) onToggle_(false);
    outSwallow = true;
    return;
  }

  // Any other key: while interaction mode is active, swallow it here too
  // so it reaches only the WebView2-hosted page (via the host's own input
  // forwarding) and never the game underneath — "evitar que clique/scroll
  // mova a camera, buzina ou controles do caminhao durante a interacao".
  // Mouse buttons/movement are a separate low-level hook in the host
  // process (keyboard-only here, see docs/ETS2_ARCHITECTURE.md).
  if (interactionModeActive_) {
    outSwallow = true;
  }
}

}  // namespace neoblade::input
