#include "diagnostic_frame.hpp"

#include <windows.h>

#include <cmath>
#include <cstring>
#include <cwchar>

namespace neoblade::render {

void GenerateDiagnosticFrame(uint8_t* outBgra, uint32_t width, uint32_t height, uint32_t strideBytes,
                              uint64_t frameCounter) {
  if (!outBgra || width == 0 || height == 0) return;

  // Slow hue pulse (a few seconds per cycle at ~60 FPS) so the pattern
  // visibly proves "still updating" rather than "frozen on first frame".
  const double phase = static_cast<double>(frameCounter % 600) / 600.0 * 6.28318530718;
  const uint8_t r = static_cast<uint8_t>(60 + 40 * std::sin(phase));
  const uint8_t g = static_cast<uint8_t>(60 + 40 * std::sin(phase + 2.094));
  const uint8_t b = static_cast<uint8_t>(90 + 40 * std::sin(phase + 4.188));

  BITMAPINFO bmi{};
  bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
  bmi.bmiHeader.biWidth = static_cast<LONG>(width);
  bmi.bmiHeader.biHeight = -static_cast<LONG>(height);  // negative = top-down DIB
  bmi.bmiHeader.biPlanes = 1;
  bmi.bmiHeader.biBitCount = 32;
  bmi.bmiHeader.biCompression = BI_RGB;

  HDC screenDc = GetDC(nullptr);
  HDC memDc = CreateCompatibleDC(screenDc);
  void* bits = nullptr;
  HBITMAP dib = CreateDIBSection(memDc, &bmi, DIB_RGB_COLORS, &bits, nullptr, 0);

  if (dib && bits) {
    HBITMAP oldBitmap = static_cast<HBITMAP>(SelectObject(memDc, dib));

    HBRUSH brush = CreateSolidBrush(RGB(r, g, b));
    RECT full{0, 0, static_cast<LONG>(width), static_cast<LONG>(height)};
    FillRect(memDc, &full, brush);
    DeleteObject(brush);

    FrameRect(memDc, &full, static_cast<HBRUSH>(GetStockObject(WHITE_BRUSH)));

    SetBkMode(memDc, TRANSPARENT);
    SetTextColor(memDc, RGB(255, 255, 255));
    HFONT font = CreateFontW(static_cast<int>(height) / 10, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
                              OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH,
                              L"Segoe UI");
    HFONT oldFont = static_cast<HFONT>(SelectObject(memDc, font));

    const wchar_t* line1 = L"NeoBlade — DX11 OK";
    wchar_t line2[96];
    swprintf_s(line2, L"frame #%llu", static_cast<unsigned long long>(frameCounter));

    RECT textRect1{10, static_cast<LONG>(height) / 2 - static_cast<LONG>(height) / 10, static_cast<LONG>(width) - 10,
                    static_cast<LONG>(height) / 2};
    RECT textRect2{10, static_cast<LONG>(height) / 2, static_cast<LONG>(width) - 10,
                    static_cast<LONG>(height) / 2 + static_cast<LONG>(height) / 10};
    DrawTextW(memDc, line1, -1, &textRect1, DT_CENTER | DT_SINGLELINE);
    DrawTextW(memDc, line2, -1, &textRect2, DT_CENTER | DT_SINGLELINE);

    SelectObject(memDc, oldFont);
    DeleteObject(font);
    SelectObject(memDc, oldBitmap);
    GdiFlush();

    // CreateDIBSection's buffer is tightly packed (no padding beyond 4-byte
    // alignment, which 32bpp already satisfies), so its own stride is
    // exactly width*4 — only copy row-by-row if the caller asked for a
    // different (larger) stride than that.
    const uint32_t dibStride = width * 4;
    if (dibStride == strideBytes) {
      memcpy(outBgra, bits, static_cast<size_t>(dibStride) * height);
    } else {
      const auto* src = static_cast<const uint8_t*>(bits);
      for (uint32_t row = 0; row < height; ++row) {
        memcpy(outBgra + row * strideBytes, src + row * dibStride, dibStride);
      }
    }
  } else {
    // Last-resort fallback if GDI itself failed (should not happen on any
    // real desktop session): flat color, no text, better than uninitialized
    // memory reaching the texture.
    for (uint32_t row = 0; row < height; ++row) {
      uint8_t* rowPtr = outBgra + row * strideBytes;
      for (uint32_t col = 0; col < width; ++col) {
        rowPtr[col * 4 + 0] = b;
        rowPtr[col * 4 + 1] = g;
        rowPtr[col * 4 + 2] = r;
        rowPtr[col * 4 + 3] = 255;
      }
    }
  }

  if (dib) DeleteObject(dib);
  DeleteDC(memDc);
  ReleaseDC(nullptr, screenDc);
}

}  // namespace neoblade::render
