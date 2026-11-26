#pragma once

#include <windows.h>

#include <functional>

namespace neoblade::input {

// Low-level keyboard hook (WH_KEYBOARD_LL) that recognizes exactly two
// combinations and otherwise passes every key straight through to the game
// untouched — "não roubar mouse/teclado do ETS2 quando o modo de interação
// não estiver ativo" (Fase 10 task, section 5):
//   - Ctrl+Alt+I: toggle interaction mode on/off.
//   - Escape: only consumed (to release interaction mode) while interaction
//     mode is already on; otherwise ignored so it still pauses the game
//     menu as ETS2 expects.
// Ctrl+Alt+V is deliberately NOT handled here: the existing Siri shortcut
// (src/hooks/useVoiceAssistant.ts) is a page-level `keydown` listener
// inside the WebView2-hosted React app, not a native hook, so it already
// only fires while that page has focus/interaction mode is on — no
// conflict to resolve at this layer.
class HotkeyHook {
 public:
  using ToggleHandler = std::function<void(bool nowActive)>;

  explicit HotkeyHook(ToggleHandler onInteractionModeChanged);
  ~HotkeyHook();

  void Install();
  void Uninstall();
  bool IsInteractionModeActive() const { return interactionModeActive_; }

 private:
  static LRESULT CALLBACK LowLevelProc(int code, WPARAM wParam, LPARAM lParam);
  void HandleKeyEvent(WPARAM wParam, const KBDLLHOOKSTRUCT& info, bool& outSwallow);

  ToggleHandler onToggle_;
  HHOOK hookHandle_ = nullptr;
  bool interactionModeActive_ = false;
};

}  // namespace neoblade::input
