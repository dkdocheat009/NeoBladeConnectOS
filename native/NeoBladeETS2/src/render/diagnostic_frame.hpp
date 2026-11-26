#pragma once

#include <cstdint>

namespace neoblade::render {

// Fills `outBgra` (already sized to height * strideBytes by the caller)
// with the Fase 10 task's required diagnostic pattern: a solid color field
// plus the literal text "NeoBlade - DX11 OK", so a tester can tell at a
// glance (from inside the cabin, looking at the GPS) that the render path
// reached the actual 3D screen. Deliberately not the final product — see
// d3d11_hook.cpp, this only runs while D3D11Hook::diagnosticMode is true or
// no host frame is available yet. `frameCounter` drives a slow color pulse
// so a completely frozen/black screen is visually distinguishable from a
// working-but-static one.
void GenerateDiagnosticFrame(uint8_t* outBgra, uint32_t width, uint32_t height, uint32_t strideBytes,
                              uint64_t frameCounter);

}  // namespace neoblade::render
