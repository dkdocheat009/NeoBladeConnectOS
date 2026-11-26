#pragma once

#include <d3d11.h>
#include <dxgi.h>

#include <atomic>
#include <cstdint>
#include <mutex>
#include <vector>

#include "../ipc/frame_shared_memory.hpp"

namespace neoblade::render {

enum class RenderState {
  NotInstalled,       // Install() not called yet, or it failed outright
  PresentHookActive,  // swap chain Present() is hooked; we see every frame
  GpsTextureActive,   // the harder GPS-texture substitution is also live
};

// Owns every D3D11-level hook this plugin installs. Construction does
// nothing observable to the game; Install() is what actually patches
// anything, and Uninstall() restores every patched byte exactly, in
// reverse order, so this can safely run inside scs_telemetry_shutdown()
// or DLL_PROCESS_DETACH.
class D3D11Hook {
 public:
  static D3D11Hook& Instance();

  // Safe to call multiple times; only the first call does anything.
  // Never throws: every failure path logs and leaves the hook in
  // NotInstalled or PresentHookActive (degraded) state rather than
  // crashing the host process (ets2.exe).
  void Install();
  void Uninstall();

  RenderState State() const { return state_.load(std::memory_order_relaxed); }

  // When true, DiagnosticFrame's solid-color-plus-text pattern is written
  // to the GPS texture every frame instead of pulling from FrameSharedMemory.
  // Toggled by the control pipe ("type":"setDiagnosticMode") — see
  // dllmain.cpp. Starts true: "No comeco implemente um modo de diagnostico"
  // (Fase 10 task, section 4) — a build that has never seen a verified GPS
  // signature stays in this mode forever, which is the honest outcome.
  std::atomic<bool> diagnosticMode{true};

 private:
  D3D11Hook() = default;

  // Our own hooked implementation of IDXGISwapChain::Present. Must match
  // the real method's calling convention/signature exactly (public DXGI
  // ABI from dxgi.h — not reverse engineered).
  static HRESULT STDMETHODCALLTYPE PresentHook(IDXGISwapChain* swapChain, UINT syncInterval, UINT flags);
  static HRESULT STDMETHODCALLTYPE CreateTexture2DHook(ID3D11Device* device, const D3D11_TEXTURE2D_DESC* desc,
                                                        const D3D11_SUBRESOURCE_DATA* initialData,
                                                        ID3D11Texture2D** outTexture);

  void OnPresent(IDXGISwapChain* swapChain);
  void TryEnableGpsTextureSupport();
  void FeedGpsTexture();

  std::atomic<RenderState> state_{RenderState::NotInstalled};
  std::mutex mutex_;

  // Real function pointers MinHook gives us back — call through these,
  // never recurse into our own hook.
  using PresentFn = HRESULT(STDMETHODCALLTYPE*)(IDXGISwapChain*, UINT, UINT);
  using CreateTexture2DFn = HRESULT(STDMETHODCALLTYPE*)(ID3D11Device*, const D3D11_TEXTURE2D_DESC*,
                                                          const D3D11_SUBRESOURCE_DATA*, ID3D11Texture2D**);
  PresentFn realPresent_ = nullptr;
  CreateTexture2DFn realCreateTexture2D_ = nullptr;

  ID3D11Device* device_ = nullptr;
  ID3D11DeviceContext* context_ = nullptr;

  // The GPS screen's live texture, captured the moment our CreateTexture2D
  // hook sees the game request one matching the fingerprint described in
  // gps_signatures.hpp. Null for the entire lifetime of a build that never
  // got a verified signature (today's default — see that file).
  ID3D11Texture2D* gpsLiveTexture_ = nullptr;
  UINT gpsTextureWidth_ = 0;
  UINT gpsTextureHeight_ = 0;

  ipc::FrameSharedMemory frameSource_;
  std::vector<uint8_t> frameScratch_;
  bool presentHooked_ = false;
  bool createTexture2DHooked_ = false;
  bool gpsSignaturesResolved_ = false;
  uint64_t frameCounter_ = 0;
};

}  // namespace neoblade::render
