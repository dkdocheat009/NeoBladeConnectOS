using System.Runtime.InteropServices;

namespace NeoBladeHost.Capture;

/// <summary>
/// Periodically captures a window's current pixels into a BGRA32 byte
/// array using PrintWindow — the same general Win32 technique
/// PrismTextureStreamer's README describes for its own WindowSource
/// (PrintWindow + GetDIBits), independently applied here to the WebView2
/// control's own HWND rather than copied from their code. PW_RENDERFULLCONTENT
/// (Windows 8.1+) is required for DirectComposition-hosted content like
/// WebView2/Edge — without it PrintWindow on this kind of window reliably
/// returns a blank frame, which is the "tela preta" the Fase 10 task warns
/// about; this flag is the documented fix for that specific case.
/// </summary>
internal sealed class FrameCapture : IDisposable
{
    [DllImport("user32.dll")]
    private static extern bool PrintWindow(nint hWnd, nint hdcBlt, uint flags);

    [DllImport("user32.dll")]
    private static extern bool GetClientRect(nint hWnd, out RECT rect);

    [StructLayout(LayoutKind.Sequential)]
    private struct RECT { public int Left, Top, Right, Bottom; }

    private const uint PW_CLIENTONLY = 0x1;
    private const uint PW_RENDERFULLCONTENT = 0x2;

    private Bitmap? _bitmap;
    private int _width, _height;

    /// <summary>
    /// Captures `hwnd`'s current client area. Returns null if the window
    /// has no size yet (not shown/minimized) or the capture API failed —
    /// callers must treat null as "skip this tick", never as fatal.
    /// </summary>
    public (byte[] Bgra, int Width, int Height, int Stride)? CaptureBgra(nint hwnd)
    {
        if (!GetClientRect(hwnd, out var rect)) return null;
        var width = rect.Right - rect.Left;
        var height = rect.Bottom - rect.Top;
        if (width <= 0 || height <= 0) return null;

        if (_bitmap is null || _width != width || _height != height)
        {
            _bitmap?.Dispose();
            _bitmap = new Bitmap(width, height, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            _width = width;
            _height = height;
        }

        using (var graphics = Graphics.FromImage(_bitmap))
        {
            var hdc = graphics.GetHdc();
            try
            {
                if (!PrintWindow(hwnd, hdc, PW_CLIENTONLY | PW_RENDERFULLCONTENT))
                {
                    return null;
                }
            }
            finally
            {
                graphics.ReleaseHdc(hdc);
            }
        }

        var bitmapData = _bitmap.LockBits(new Rectangle(0, 0, width, height), System.Drawing.Imaging.ImageLockMode.ReadOnly,
            System.Drawing.Imaging.PixelFormat.Format32bppArgb);
        try
        {
            var stride = bitmapData.Stride;
            var bytes = new byte[stride * height];
            Marshal.Copy(bitmapData.Scan0, bytes, 0, bytes.Length);
            // Format32bppArgb's in-memory byte order is already B,G,R,A per
            // pixel (little-endian ARGB word) — i.e. already the BGRA8 byte
            // layout frame_shared_memory.hpp expects, no channel swap needed.
            return (bytes, width, height, stride);
        }
        finally
        {
            _bitmap.UnlockBits(bitmapData);
        }
    }

    public void Dispose()
    {
        _bitmap?.Dispose();
    }
}
