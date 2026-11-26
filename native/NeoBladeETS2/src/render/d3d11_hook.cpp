#include "d3d11_hook.hpp"

#include <MinHook.h>

#include <algorithm>
#include <cstring>
#include <string>

#include "../logging.hpp"
#include "diagnostic_frame.hpp"
#include "gps_signatures.hpp"
#include "pattern_scan.hpp"

#pragma comment(lib, "d3d11.lib")
#pragma comment(lib, "dxgi.lib")

namespace neoblade::render {

namespace {

// IDXGISwapChain::Present and ID3D11Device::CreateTexture2D vtable slot
// indices below come straight from Microsoft's public <dxgi.h>/<d3d11.h>
// COM interface layout (every D3D11 app's swapchain/device shares the same
// vtable addresses process-wide) — this is the standard, widely used
// technique for hooking Present (RTSS, ReShade, OBS's game capture, etc. all
// do the same thing); it is NOT a game-specific reverse-engineering step,
// unlike the GPS-texture-specific hooks in gps_signatures.hpp.
constexpr size_t kSwapChainPresentVtableIndex = 8;
constexpr size_t kDeviceCreateTexture2DVtableIndex = 5;

// Creates a throwaway hidden-window D3D11 device + swap chain purely to
// read the real, process-wide vtable function pointers out of it. The
// device/swapchain/window are destroyed immediately after; MinHook's
// patches live in the shared vtable memory, not in this temporary object,
// so every other swap chain created afterwards (including the game's own)
// is hooked too.
bool CreateTemporaryDeviceForVtableDiscovery(void** outPresentSlot, void** outCreateTexture2DSlot) {
  WNDCLASSEXW wc{};
  wc.cbSize = sizeof(wc);
  wc.lpfnWndProc = DefWindowProcW;
  wc.hInstance = GetModuleHandleW(nullptr);
  wc.lpszClassName = L"NeoBladeETS2_VTableProbe";
  RegisterClassExW(&wc);

  HWND window = CreateWindowExW(0, wc.lpszClassName, L"", WS_OVERLAPPEDWINDOW, 0, 0, 4, 4, nullptr, nullptr,
                                 wc.hInstance, nullptr);
  if (!window) return false;

  DXGI_SWAP_CHAIN_DESC desc{};
  desc.BufferCount = 1;
  desc.BufferDesc.Width = 4;
  desc.BufferDesc.Height = 4;
  desc.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
  desc.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
  desc.OutputWindow = window;
  desc.SampleDesc.Count = 1;
  desc.Windowed = TRUE;

  IDXGISwapChain* swapChain = nullptr;
  ID3D11Device* device = nullptr;
  ID3D11DeviceContext* context = nullptr;
  const D3D_FEATURE_LEVEL requested[] = {D3D_FEATURE_LEVEL_11_0};

  const HRESULT hr = D3D11CreateDeviceAndSwapChain(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, 0, requested,
                                                     1, D3D11_SDK_VERSION, &desc, &swapChain, &device, nullptr,
                                                     &context);
  bool ok = false;
  if (SUCCEEDED(hr) && swapChain && device) {
    void** swapChainVtable = *reinterpret_cast<void***>(swapChain);
    void** deviceVtable = *reinterpret_cast<void***>(device);
    *outPresentSlot = swapChainVtable[kSwapChainPresentVtableIndex];
    *outCreateTexture2DSlot = deviceVtable[kDeviceCreateTexture2DVtableIndex];
    ok = true;
  }

  if (context) context->Release();
  if (swapChain) swapChain->Release();
  if (device) device->Release();
  DestroyWindow(window);
  UnregisterClassW(wc.lpszClassName, wc.hInstance);
  return ok;
}

}  // namespace

D3D11Hook& D3D11Hook::Instance() {
  static D3D11Hook instance;
  return instance;
}

void D3D11Hook::Install() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (state_.load() != RenderState::NotInstalled) return;

  if (MH_Initialize() != MH_OK) {
    neoblade::LogMessage(neoblade::LogCategory::Render, "D3D11Hook: MH_Initialize falhou; render desativado.");
    return;
  }

  void* presentSlot = nullptr;
  void* createTexture2DSlot = nullptr;
  if (!CreateTemporaryDeviceForVtableDiscovery(&presentSlot, &createTexture2DSlot)) {
    neoblade::LogMessage(neoblade::LogCategory::Render,
                          "D3D11Hook: nao foi possivel criar um device D3D11 temporario (sem GPU/driver DX11?); "
                          "render desativado, telemetria continua normal.");
    MH_Uninitialize();
    return;
  }

  if (MH_CreateHook(presentSlot, reinterpret_cast<void*>(&D3D11Hook::PresentHook),
                     reinterpret_cast<void**>(&realPresent_)) != MH_OK ||
      MH_EnableHook(presentSlot) != MH_OK) {
    neoblade::LogMessage(neoblade::LogCategory::Render, "D3D11Hook: hook de Present falhou; render desativado.");
    MH_Uninitialize();
    return;
  }
  presentHooked_ = true;
  state_.store(RenderState::PresentHookActive);
  neoblade::LogMessage(neoblade::LogCategory::Render,
                        "D3D11Hook: IDXGISwapChain::Present hookado com sucesso (modo diagnostico ativo).");

  if (MH_CreateHook(createTexture2DSlot, reinterpret_cast<void*>(&D3D11Hook::CreateTexture2DHook),
                     reinterpret_cast<void**>(&realCreateTexture2D_)) == MH_OK &&
      MH_EnableHook(createTexture2DSlot) == MH_OK) {
    createTexture2DHooked_ = true;
  } else {
    neoblade::LogMessage(neoblade::LogCategory::Render,
                          "D3D11Hook: hook de CreateTexture2D falhou; substituicao da textura do GPS ficara "
                          "indisponivel (o modo diagnostico via Present continua).");
  }

  TryEnableGpsTextureSupport();
}

void D3D11Hook::TryEnableGpsTextureSupport() {
  const auto queueSig = TextureQueueProcessorSignature();
  const auto jumpSig = GpsScreenForceRenderJumpSignature();
  if (queueSig.pattern.empty() || jumpSig.pattern.empty()) {
    neoblade::LogMessage(
        neoblade::LogCategory::Render,
        "D3D11Hook: assinaturas de substituicao da textura do GPS ainda nao foram preenchidas nesta build "
        "(ver docs/ETS2_ARCHITECTURE.md, 'Assinaturas de padrao'). Ficando em modo diagnostico via back buffer "
        "ate que sejam verificadas contra o executavel instalado; o jogo e a telemetria nao sao afetados.");
    gpsSignaturesResolved_ = false;
    return;
  }

  const auto queueAddr = ScanMainModule(queueSig);
  const auto jumpAddr = ScanMainModule(jumpSig);
  if (!queueAddr || !jumpAddr) {
    neoblade::LogMessage(neoblade::LogCategory::Render,
                          "D3D11Hook: assinaturas preenchidas mas nao combinaram com esta versao do jogo; "
                          "substituicao da textura do GPS desativada, modo diagnostico mantido.");
    gpsSignaturesResolved_ = false;
    return;
  }

  // Real GPS-texture substitution would be wired up from here (patch the
  // conditional jump at *jumpAddr, install the queue-processor redirect at
  // *queueAddr) once a verified signature makes it this far. Not reached by
  // this build — see gps_signatures.hpp.
  gpsSignaturesResolved_ = true;
  state_.store(RenderState::GpsTextureActive);
}

void D3D11Hook::Uninstall() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (state_.load() == RenderState::NotInstalled) return;

  // MH_DisableHook(MH_ALL_HOOKS) + MH_Uninitialize() disable and free every
  // hook this process registered in one safe call each, regardless of
  // which combination (just Present, or Present+CreateTexture2D) actually
  // got installed — simpler and less failure-prone than re-deriving each
  // vtable slot again here.
  MH_DisableHook(MH_ALL_HOOKS);
  MH_Uninitialize();
  presentHooked_ = false;
  createTexture2DHooked_ = false;

  gpsLiveTexture_ = nullptr;
  device_ = nullptr;
  context_ = nullptr;
  state_.store(RenderState::NotInstalled);
  neoblade::LogMessage(neoblade::LogCategory::Render, "D3D11Hook: hooks removidos, estado restaurado.");
}

HRESULT STDMETHODCALLTYPE D3D11Hook::PresentHook(IDXGISwapChain* swapChain, UINT syncInterval, UINT flags) {
  auto& self = Instance();
  self.OnPresent(swapChain);
  return self.realPresent_(swapChain, syncInterval, flags);
}

HRESULT STDMETHODCALLTYPE D3D11Hook::CreateTexture2DHook(ID3D11Device* device, const D3D11_TEXTURE2D_DESC* desc,
                                                          const D3D11_SUBRESOURCE_DATA* initialData,
                                                          ID3D11Texture2D** outTexture) {
  auto& self = Instance();
  // Fingerprint matching against the (currently always-absent) GPS
  // dimensions would happen here, per PrismTextureStreamer's described
  // technique (rewrite desc to a CPU-writable DYNAMIC texture and cache
  // it) — not reachable while gpsSignaturesResolved_ is false.
  return self.realCreateTexture2D_(device, desc, initialData, outTexture);
}

void D3D11Hook::OnPresent(IDXGISwapChain* swapChain) {
  frameCounter_++;
  if (!device_) {
    swapChain->GetDevice(__uuidof(ID3D11Device), reinterpret_cast<void**>(&device_));
    if (device_) device_->GetImmediateContext(&context_);
  }

  if (gpsSignaturesResolved_ && gpsLiveTexture_) {
    FeedGpsTexture();
    return;
  }

  // No verified GPS texture yet: log once (not every frame — that would be
  // exactly the "render" log spam the Fase 10 task asks us to rate-limit)
  // that the hook is alive and well, which is itself useful signal for
  // DIAGNOSTICAR_ETS2.ps1 to pick up.
  if (frameCounter_ == 1 || frameCounter_ % 18000 == 0) {  // ~once at start, then every ~5 min at 60 FPS
    neoblade::LogMessage(neoblade::LogCategory::Frame,
                          "Present hook ativo (frame #" + std::to_string(frameCounter_) +
                              "); sem textura do GPS resolvida ainda, nada e desenhado sobre o jogo.");
  }
}

void D3D11Hook::FeedGpsTexture() {
  if (!context_ || !gpsLiveTexture_) return;

  uint32_t frameWidth = 0, frameHeight = 0, frameStride = 0;
  const bool gotHostFrame =
      !diagnosticMode.load(std::memory_order_relaxed) &&
      frameSource_.TryReadLatestFrame(frameScratch_, frameWidth, frameHeight, frameStride);

  if (!gotHostFrame) {
    frameWidth = gpsTextureWidth_;
    frameHeight = gpsTextureHeight_;
    frameStride = frameWidth * 4;
    frameScratch_.resize(static_cast<size_t>(frameStride) * frameHeight);
    GenerateDiagnosticFrame(frameScratch_.data(), frameWidth, frameHeight, frameStride, frameCounter_);
  }

  D3D11_MAPPED_SUBRESOURCE mapped{};
  if (FAILED(context_->Map(gpsLiveTexture_, 0, D3D11_MAP_WRITE_DISCARD, 0, &mapped))) {
    neoblade::LogMessage(neoblade::LogCategory::Render, "D3D11Hook: Map() da textura do GPS falhou neste frame.");
    return;
  }

  const UINT copyWidthBytes = (std::min)(mapped.RowPitch, static_cast<UINT>(frameStride));
  const UINT copyHeight = (std::min)(gpsTextureHeight_, frameHeight);
  auto* dst = static_cast<uint8_t*>(mapped.pData);
  const uint8_t* src = frameScratch_.data();
  for (UINT row = 0; row < copyHeight; ++row) {
    memcpy(dst + row * mapped.RowPitch, src + row * frameStride, copyWidthBytes);
  }
  context_->Unmap(gpsLiveTexture_, 0);
}

}  // namespace neoblade::render
