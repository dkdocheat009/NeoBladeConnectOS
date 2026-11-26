#include "pattern_scan.hpp"

#include <windows.h>
#include <psapi.h>

#include <cstdlib>
#include <vector>

#include "../logging.hpp"

namespace neoblade::render {

namespace {

struct ParsedByte {
  uint8_t value = 0;
  bool wildcard = false;
};

std::optional<std::vector<ParsedByte>> ParsePattern(const std::string& pattern) {
  std::vector<ParsedByte> bytes;
  size_t i = 0;
  while (i < pattern.size()) {
    if (pattern[i] == ' ') {
      ++i;
      continue;
    }
    if (i + 1 >= pattern.size()) return std::nullopt;  // malformed, odd nibble count
    const std::string token = pattern.substr(i, 2);
    i += 2;
    if (token == "??") {
      bytes.push_back({0, true});
      continue;
    }
    char* end = nullptr;
    const long value = strtol(token.c_str(), &end, 16);
    if (end != token.c_str() + token.size()) return std::nullopt;
    bytes.push_back({static_cast<uint8_t>(value), false});
  }
  if (bytes.empty()) return std::nullopt;
  return bytes;
}

bool IsReadableModuleRange(uintptr_t base, size_t size) {
  // Defensive bound: refuse to scan a module that somehow reports an
  // unreasonable size rather than trusting PE header fields blindly.
  constexpr size_t kMaxReasonableModuleSize = 1ull << 31;  // 2 GiB
  return base != 0 && size > 0 && size < kMaxReasonableModuleSize;
}

// MSVC forbids mixing __try/__except with C++ objects that need stack
// unwinding (destructors) in the same function (error C2712) — so the raw
// scanning loop lives in its own function using only trivial types
// (no std::vector/std::optional/std::string in this one), called from
// ScanModule below which owns all the C++-object bookkeeping.
bool ScanRawBytes(const uint8_t* base, size_t moduleSize, const ParsedByte* bytes, size_t patternLen,
                   uintptr_t* outMatchOffset) {
  if (patternLen > moduleSize) return false;
  bool exceptionOccurred = false;
  bool found = false;
  size_t foundOffset = 0;

  __try {
    for (size_t offset = 0; offset <= moduleSize - patternLen; ++offset) {
      bool matched = true;
      for (size_t j = 0; j < patternLen; ++j) {
        if (bytes[j].wildcard) continue;
        if (base[offset + j] != bytes[j].value) {
          matched = false;
          break;
        }
      }
      if (matched) {
        found = true;
        foundOffset = offset;
        break;
      }
    }
  } __except (EXCEPTION_EXECUTE_HANDLER) {
    // A module can contain unmapped/guard-paged gaps between sections;
    // treat an access violation while scanning as "not found" rather than
    // crashing the game.
    exceptionOccurred = true;
  }

  if (exceptionOccurred || !found) return false;
  *outMatchOffset = static_cast<uintptr_t>(foundOffset);
  return true;
}

}  // namespace

std::optional<uintptr_t> ScanModule(const Signature& signature, uintptr_t moduleBase, size_t moduleSize) {
  if (!IsReadableModuleRange(moduleBase, moduleSize)) {
    neoblade::LogMessage(neoblade::LogCategory::Render,
                          "pattern scan [" + signature.name + "]: modulo/intervalo invalido, abortando.");
    return std::nullopt;
  }

  const auto parsed = ParsePattern(signature.pattern);
  if (!parsed) {
    neoblade::LogMessage(neoblade::LogCategory::Render,
                          "pattern scan [" + signature.name + "]: padrao malformado: '" + signature.pattern + "'.");
    return std::nullopt;
  }

  const auto& bytes = *parsed;
  const auto* base = reinterpret_cast<const uint8_t*>(moduleBase);

  uintptr_t matchOffset = 0;
  if (!ScanRawBytes(base, moduleSize, bytes.data(), bytes.size(), &matchOffset)) {
    neoblade::LogMessage(neoblade::LogCategory::Render,
                          "pattern scan [" + signature.name + "]: nao encontrado nesta build do jogo (ou excecao de acesso durante a varredura).");
    return std::nullopt;
  }

  neoblade::LogMessage(neoblade::LogCategory::Render, "pattern scan [" + signature.name + "]: encontrado.");
  return moduleBase + matchOffset + static_cast<uintptr_t>(signature.offsetFromMatch);
}

std::optional<uintptr_t> ScanMainModule(const Signature& signature) {
  HMODULE module = GetModuleHandleW(nullptr);
  if (!module) return std::nullopt;

  MODULEINFO info{};
  // K32* form: resolves from kernel32 directly (available since Win7), so
  // this translation unit doesn't need an extra Psapi.lib link dependency
  // just for one call.
  if (!K32GetModuleInformation(GetCurrentProcess(), module, &info, sizeof(info))) {
    return std::nullopt;
  }
  return ScanModule(signature, reinterpret_cast<uintptr_t>(info.lpBaseOfDll), info.SizeOfImage);
}

}  // namespace neoblade::render
