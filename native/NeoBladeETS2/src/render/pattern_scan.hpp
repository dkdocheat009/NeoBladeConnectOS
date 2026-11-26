#pragma once

#include <cstdint>
#include <optional>
#include <string>

namespace neoblade::render {

// A byte signature with wildcard support, e.g. "48 8B 05 ?? ?? ?? ?? 48 85 C0".
// This is a generic, original implementation of the well-known
// array-of-bytes-plus-mask scanning technique used by essentially every
// Windows game-modding tool — not reverse-engineered from any specific
// project. The actual byte values for NeoBlade's own signatures (see
// gps_signatures.hpp) are NOT filled in here: see that file's comment for
// why, and docs/ETS2_ARCHITECTURE.md's "Assinaturas de padrao" section.
struct Signature {
  std::string name;    // for logging only
  std::string pattern;  // space-separated hex bytes, "??" = any byte
  int offsetFromMatch = 0;  // added to the found address before returning it
};

// Scans [moduleBase, moduleBase + moduleSize) for `signature.pattern`.
// Returns std::nullopt if the pattern wasn't found or the pattern string
// failed to parse (logged either way) — callers MUST treat nullopt as "the
// game version/build doesn't match this signature" and disable only the
// specific hook that depended on it, per the Fase 10 task's explicit
// requirement to never guess an address.
std::optional<uintptr_t> ScanModule(const Signature& signature, uintptr_t moduleBase, size_t moduleSize);

// Convenience: scans the main ETS2 executable module (GetModuleHandle(nullptr)).
std::optional<uintptr_t> ScanMainModule(const Signature& signature);

}  // namespace neoblade::render
