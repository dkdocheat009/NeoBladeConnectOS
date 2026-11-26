#include "logging.hpp"

#include <windows.h>

#include <chrono>
#include <cstdio>
#include <fstream>
#include <mutex>
#include <unordered_map>

namespace neoblade {

namespace {

const wchar_t* CategoryFileName(LogCategory category) {
  switch (category) {
    case LogCategory::Sdk: return L"neoblade_sdk.log";
    case LogCategory::Render: return L"neoblade_render.log";
    case LogCategory::Frame: return L"neoblade_frame.log";
    case LogCategory::Capture: return L"neoblade_capture.log";
    case LogCategory::WebView2: return L"neoblade_webview2.log";
    case LogCategory::Input: return L"neoblade_input.log";
    case LogCategory::Map: return L"neoblade_map.log";
    case LogCategory::Net: return L"neoblade_net.log";
  }
  return L"neoblade_unknown.log";
}

// Rate limiting: at most this many lines per category per process lifetime
// before we drop the rest (logging one final notice) — a hook misfiring
// every render frame must never be able to fill the user's disk.
constexpr size_t kMaxLinesPerCategory = 200000;

std::wstring LogDirectory() {
  wchar_t* localAppData = nullptr;
  size_t len = 0;
  std::wstring dir;
  if (_wdupenv_s(&localAppData, &len, L"LOCALAPPDATA") == 0 && localAppData != nullptr) {
    dir = std::wstring(localAppData) + L"\\NeoBladeConnectOS\\logs\\";
    free(localAppData);
  } else {
    dir = L".\\NeoBladeConnectOS-logs\\";
  }
  return dir;
}

struct LoggerState {
  std::mutex mutex;
  std::unordered_map<int, std::ofstream> files;
  std::unordered_map<int, size_t> lineCounts;
  std::wstring directory;
  bool initialized = false;
};

LoggerState& State() {
  static LoggerState state;
  return state;
}

std::string Timestamp() {
  using namespace std::chrono;
  auto now = system_clock::now();
  auto t = system_clock::to_time_t(now);
  auto ms = duration_cast<milliseconds>(now.time_since_epoch()) % 1000;
  tm tmBuf{};
  localtime_s(&tmBuf, &t);
  char buf[32];
  std::snprintf(buf, sizeof(buf), "%04d-%02d-%02d %02d:%02d:%02d.%03lld", tmBuf.tm_year + 1900,
                tmBuf.tm_mon + 1, tmBuf.tm_mday, tmBuf.tm_hour, tmBuf.tm_min, tmBuf.tm_sec,
                static_cast<long long>(ms.count()));
  return std::string(buf);
}

}  // namespace

void InitLogging() {
  auto& state = State();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.initialized) return;
  state.directory = LogDirectory();
  CreateDirectoryW(state.directory.c_str(), nullptr);
  state.initialized = true;
}

void ShutdownLogging() {
  auto& state = State();
  std::lock_guard<std::mutex> lock(state.mutex);
  for (auto& [category, stream] : state.files) {
    if (stream.is_open()) stream.flush();
  }
  state.files.clear();
  state.initialized = false;
}

void LogMessage(LogCategory category, const std::string& message) {
  auto& state = State();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (!state.initialized) return;

  const int key = static_cast<int>(category);
  size_t& count = state.lineCounts[key];
  if (count > kMaxLinesPerCategory) return;

  auto it = state.files.find(key);
  if (it == state.files.end()) {
    std::wstring path = state.directory + CategoryFileName(category);
    auto [inserted, ok] = state.files.emplace(key, std::ofstream(path, std::ios::app));
    it = inserted;
  }
  if (!it->second.is_open()) return;

  if (count == kMaxLinesPerCategory) {
    it->second << "[" << Timestamp() << "] limite de " << kMaxLinesPerCategory
                << " linhas atingido para esta categoria; silenciando o restante desta sessao.\n";
  } else {
    it->second << "[" << Timestamp() << "] " << message << "\n";
  }
  it->second.flush();
  count++;
}

}  // namespace neoblade
