#include "frame_shared_memory.hpp"

#include <cstring>
#include <string>

#include "../logging.hpp"
#include "../version.h"

namespace neoblade::ipc {

namespace {
constexpr wchar_t kMappingName[] = L"Local\\NeoBladeConnectOS_FrameBuffer";
// Header + the largest frame we'll ever accept, so MapViewOfFile covers the
// whole thing in one go regardless of what size frame the host chose.
constexpr size_t kMaxMappingSize = sizeof(FrameBufferHeader) + kMaxFrameBytes;
}  // namespace

FrameSharedMemory::~FrameSharedMemory() { Unmap(); }

void FrameSharedMemory::Unmap() {
  if (view_) {
    UnmapViewOfFile(view_);
    view_ = nullptr;
  }
  if (mapping_) {
    CloseHandle(mapping_);
    mapping_ = nullptr;
  }
  viewSize_ = 0;
}

bool FrameSharedMemory::EnsureMapped() {
  if (view_) return true;

  // OpenFileMapping (not Create*): the host is always the one that creates
  // this mapping. If it isn't running yet, this fails harmlessly and the
  // caller falls back to the diagnostic pattern.
  mapping_ = OpenFileMappingW(FILE_MAP_READ, FALSE, kMappingName);
  if (!mapping_) return false;

  view_ = static_cast<uint8_t*>(MapViewOfFile(mapping_, FILE_MAP_READ, 0, 0, kMaxMappingSize));
  if (!view_) {
    CloseHandle(mapping_);
    mapping_ = nullptr;
    return false;
  }
  viewSize_ = kMaxMappingSize;
  neoblade::LogMessage(neoblade::LogCategory::Capture, "frame shared memory: mapeado com sucesso.");
  return true;
}

bool FrameSharedMemory::TryReadLatestFrame(std::vector<uint8_t>& outPixels, uint32_t& outWidth, uint32_t& outHeight,
                                            uint32_t& outStride) {
  std::lock_guard<std::mutex> lock(mutex_);

  if (!EnsureMapped()) return false;

  const auto* header = reinterpret_cast<const volatile FrameBufferHeader*>(view_);
  const uint32_t magic = header->magic;
  if (magic != kFrameBufferMagic) {
    // Host not ready yet, or restarted into an incompatible build. Not an
    // error we log every poll (would spam at render rate) — the host's own
    // startup log covers that side.
    return false;
  }
  if (header->protocolVersion != NEOBLADE_ETS2_PROTOCOL_VERSION) {
    neoblade::LogMessage(neoblade::LogCategory::Capture,
                          "frame shared memory: versao de protocolo incompativel (host=" +
                              std::to_string(header->protocolVersion) + ", plugin=" +
                              std::to_string(NEOBLADE_ETS2_PROTOCOL_VERSION) + "); desligando render.");
    Unmap();
    return false;
  }

  const uint32_t sequence = header->sequence;
  if (sequence == lastSequenceSeen_) return false;  // no new frame since last poll

  const uint32_t width = header->width;
  const uint32_t height = header->height;
  const uint32_t stride = header->strideBytes;
  const size_t frameBytes = static_cast<size_t>(stride) * height;

  if (width == 0 || height == 0 || width > kMaxFrameWidth || height > kMaxFrameHeight || stride < width * 4 ||
      frameBytes > kMaxFrameBytes) {
    neoblade::LogMessage(neoblade::LogCategory::Capture,
                          "frame shared memory: dimensoes fora do limite seguro (w=" + std::to_string(width) +
                              " h=" + std::to_string(height) + " stride=" + std::to_string(stride) + "); ignorando.");
    return false;
  }

  // Re-read sequence after copying the pixel region: if the host wrote a
  // new frame mid-copy, sequence will have moved and we discard this torn
  // read rather than hand the caller a mix of two frames. Cheap and lock-
  // free; a dropped frame here just means the GPS texture updates one
  // tick later, never a crash.
  outPixels.resize(frameBytes);
  memcpy(outPixels.data(), const_cast<const uint8_t*>(view_) + sizeof(FrameBufferHeader), frameBytes);
  if (header->sequence != sequence) return false;

  lastSequenceSeen_ = sequence;
  outWidth = width;
  outHeight = height;
  outStride = stride;
  return true;
}

}  // namespace neoblade::ipc
