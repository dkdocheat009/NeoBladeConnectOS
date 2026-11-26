#pragma once

#include "pattern_scan.hpp"

namespace neoblade::render {

// ---------------------------------------------------------------------------
// WHY THESE PATTERNS ARE EMPTY
//
// Replacing the GPS screen's own texture (instead of drawing a 2D overlay
// over the whole game, which section 2 of the Fase 10 task explicitly
// rejects as a final result) requires locating two things inside the
// running ets2.exe process: the Prism3D function that resolves a queued
// .tobj's file path before it's loaded, and the conditional jump that
// gates whether the GPS/dashboard screen mesh is drawn at all this frame.
// Both are internal engine implementation details SCS does not publish —
// there is no official SDK call for either. PrismTextureStreamer
// (github.com/Baldywaldy09/PrismTextureStreamer, read during Fase 10's
// research step, see docs/ETS2_ARCHITECTURE.md) describes hooking exactly
// those two things conceptually, but does not carry a reuse license and
// its actual byte patterns were never fetched or copied here — only the
// README's prose description of the technique was read.
//
// Deriving a correct, current byte signature requires disassembling the
// specific ets2.exe build installed on a real machine (e.g. with x64dbg or
// IDA): find a known string/constant reference near the target function,
// walk backward to its prologue, and write down enough of the opcode
// sequence (with wildcards over anything that is a relocatable
// address/immediate) to uniquely re-find it after a patch. That step
// needs the actual game binary and a disassembler, neither of which this
// coding session has — so instead of writing down a guessed pattern (the
// Fase 10 task explicitly forbids "magic addresses"), these tables ship
// empty. D3D11Hook detects that at startup, logs it once, and disables
// only GPS texture replacement — telemetry, the control pipe and the
// diagnostic back-buffer-free code path all keep working.
//
// To fill these in on your own machine: see
// docs/ETS2_ARCHITECTURE.md -> "Assinaturas de padrao: como preenche-las".
// ---------------------------------------------------------------------------

inline const Signature& TextureQueueProcessorSignature() {
  static const Signature kSig{
      /*name=*/"memserver_texture_queue_processor",
      /*pattern=*/"",  // intentionally empty — see comment above
      /*offsetFromMatch=*/0,
  };
  return kSig;
}

inline const Signature& GpsScreenForceRenderJumpSignature() {
  static const Signature kSig{
      /*name=*/"gps_screen_force_render_conditional_jump",
      /*pattern=*/"",  // intentionally empty — see comment above
      /*offsetFromMatch=*/0,
  };
  return kSig;
}

// Path (as seen inside the game's virtual file system) of the stock GPS
// screen texture we look for among queued .tobj loads, per
// PrismTextureStreamer's README example. Truck-accessory GPS units may use
// a different path; see docs/ETS2_ARCHITECTURE.md for how to confirm this
// against your own installed trucks before relying on it.
inline const char* kDefaultGpsTobjPath = "/vehicle/truck/share/gps.tobj";

}  // namespace neoblade::render
