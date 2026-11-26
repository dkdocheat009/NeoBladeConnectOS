#pragma once

#include <windows.h>

#include <cstdint>
#include <mutex>
#include <vector>

namespace neoblade::ipc {

// Header of the shared memory block `Local\NeoBladeConnectOS_FrameBuffer`.
// The host (producer) owns writing every field; the plugin (consumer, this
// class) only reads. `sequence` increments on every host write so the
// consumer can detect a torn/unread frame versus a genuinely new one
// without needing a kernel mutex per frame — see Read()'s retry loop.
#pragma pack(push, 1)
struct FrameBufferHeader {
  uint32_t magic;       // 'NBF1'
  uint32_t protocolVersion;
  uint32_t width;
  uint32_t height;
  uint32_t strideBytes;
  uint32_t sequence;     // bumped by the host after each full write
  uint32_t formatBgra8;  // 1 = B8G8R8A8 (what GDI/BitBlt naturally gives us)
  uint32_t flipY;        // 1 = row 0 is the bottom row (also GDI-native)
};
#pragma pack(pop)

constexpr uint32_t kFrameBufferMagic = 0x3146424E;  // 'NBF1' little-endian
constexpr size_t kMaxFrameWidth = 2560;
constexpr size_t kMaxFrameHeight = 1440;
// Generous cap so a corrupt/future header can never make us allocate or
// memcpy an unbounded amount of "pixel" data.
constexpr size_t kMaxFrameBytes = kMaxFrameWidth * kMaxFrameHeight * 4;

// Opens (or lazily re-opens, if the host restarts) the shared memory
// mapping created by host/NeoBladeHost and copies out the latest complete
// frame on demand. Never blocks on game render/sim threads for longer than
// a memcpy of one frame — there is no event/wait here by design, matching
// "não bloquear a thread do jogo" from the Fase 10 task.
class FrameSharedMemory {
 public:
  ~FrameSharedMemory();

  // Returns false if no host is currently producing frames (mapping not
  // found) or the frame didn't pass validation (out-of-range size, magic
  // mismatch) — callers must treat false as "keep showing the last good
  // frame / diagnostic pattern", never as a crash condition.
  bool TryReadLatestFrame(std::vector<uint8_t>& outPixels, uint32_t& outWidth, uint32_t& outHeight, uint32_t& outStride);

 private:
  bool EnsureMapped();
  void Unmap();

  std::mutex mutex_;
  HANDLE mapping_ = nullptr;
  uint8_t* view_ = nullptr;
  size_t viewSize_ = 0;
  uint32_t lastSequenceSeen_ = 0;
};

}  // namespace neoblade::ipc
