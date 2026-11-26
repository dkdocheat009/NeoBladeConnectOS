using System.IO.MemoryMappedFiles;
using System.Runtime.InteropServices;

namespace NeoBladeHost.Ipc;

/// <summary>
/// Producer side of native/NeoBladeETS2/src/ipc/frame_shared_memory.*.
/// Layout here MUST match FrameBufferHeader in that header byte-for-byte —
/// see NEOBLADE_ETS2_PROTOCOL_VERSION in both version.h/this file; bump
/// both together if either side's shape changes.
/// </summary>
[StructLayout(LayoutKind.Sequential, Pack = 1)]
internal struct FrameBufferHeader
{
    public uint Magic;
    public uint ProtocolVersion;
    public uint Width;
    public uint Height;
    public uint StrideBytes;
    public uint Sequence;
    public uint FormatBgra8;
    public uint FlipY;
}

internal sealed class FrameSharedMemoryWriter : IDisposable
{
    public const uint ProtocolVersion = 1; // keep in sync with NEOBLADE_ETS2_PROTOCOL_VERSION
    private const uint FrameBufferMagic = 0x3146424E; // 'NBF1'
    private const int MaxWidth = 2560;
    private const int MaxHeight = 1440;
    private static readonly int HeaderSize = Marshal.SizeOf<FrameBufferHeader>();
    private static readonly long MappingSize = HeaderSize + (long)MaxWidth * MaxHeight * 4;

    private readonly MemoryMappedFile _mapping;
    private readonly MemoryMappedViewAccessor _view;
    private uint _sequence;

    public FrameSharedMemoryWriter()
    {
        // No "Local\" prefix needed/allowed on the .NET API (it maps into
        // the caller's session namespace by default, matching what
        // OpenFileMappingW(..., L"Local\\NeoBladeConnectOS_FrameBuffer")
        // resolves to from the same session).
        _mapping = MemoryMappedFile.CreateNew("NeoBladeConnectOS_FrameBuffer", MappingSize,
            MemoryMappedFileAccess.ReadWrite);
        _view = _mapping.CreateViewAccessor(0, MappingSize, MemoryMappedFileAccess.ReadWrite);

        // Zeroed magic until the first real frame arrives, so the plugin's
        // reader correctly treats "mapping exists but host hasn't produced
        // anything yet" as "no frame available" rather than garbage.
        _view.Write(0, 0u);
    }

    public bool WriteFrame(byte[] bgraPixels, int width, int height, int strideBytes)
    {
        if (width <= 0 || height <= 0 || width > MaxWidth || height > MaxHeight) return false;
        var frameBytes = strideBytes * height;
        if (HeaderSize + frameBytes > MappingSize) return false;

        _sequence++;
        var header = new FrameBufferHeader
        {
            Magic = 0, // invalidate while writing pixel data, set valid after
            ProtocolVersion = ProtocolVersion,
            Width = (uint)width,
            Height = (uint)height,
            StrideBytes = (uint)strideBytes,
            Sequence = _sequence,
            FormatBgra8 = 1,
            FlipY = 0,
        };

        _view.Write(0, ref header);
        _view.WriteArray(HeaderSize, bgraPixels, 0, frameBytes);

        header.Magic = FrameBufferMagic;
        _view.Write(0, ref header); // publish: readers only trust rows once magic is set
        return true;
    }

    public void Dispose()
    {
        _view.Dispose();
        _mapping.Dispose();
    }
}
