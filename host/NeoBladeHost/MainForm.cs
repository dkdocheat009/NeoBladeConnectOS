using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using NeoBladeHost.Capture;
using NeoBladeHost.Ipc;

namespace NeoBladeHost;

/// <summary>
/// Hosts one WebView2 instance showing the built NeoBladeConnectOS bundle.
/// Normally parked off-screen (its pixels still render continuously — they
/// go into the GPS texture via the plugin, not onto the user's desktop,
/// per "não deixar uma overlay permanente sobre o jogo"). When the native
/// plugin reports interaction mode is active (Ctrl+Alt+I in-game), this
/// same window is brought on-screen so mouse/keyboard reach it for real —
/// the "modo de controle contextual" fallback from section 5 of the Fase
/// 10 task, chosen over unverified 3D GPS hit-testing.
/// </summary>
internal sealed class MainForm : Form
{
    private const int StageWidth = 1280;
    private const int StageHeight = 720;
    private static readonly Point OffscreenLocation = new(-32000, -32000);

    private readonly WebView2 _webView = new();
    private readonly StaticFileServer _fileServer;
    private readonly ControlPipeClient _controlPipe = new();
    private readonly FrameSharedMemoryWriter _frameWriter = new();
    private readonly FrameCapture _frameCapture = new();
    private readonly System.Windows.Forms.Timer _captureTimer = new();

    private bool _interactionModeActive;

    public MainForm(string webRoot)
    {
        Text = "NeoBladeConnectOS Host";
        FormBorderStyle = FormBorderStyle.None;
        ShowInTaskbar = false;
        StartPosition = FormStartPosition.Manual;
        Location = OffscreenLocation;
        ClientSize = new Size(StageWidth, StageHeight);

        _webView.Dock = DockStyle.Fill;
        Controls.Add(_webView);

        _fileServer = new StaticFileServer(webRoot);

        Load += async (_, _) => await InitializeAsync();
        FormClosing += (_, _) => Shutdown();

        _captureTimer.Interval = 33; // ~30 FPS target, per section 4's stated goal
        _captureTimer.Tick += (_, _) => CaptureAndPublishFrame();

        _controlPipe.TelemetryReceived += OnTelemetryReceived;
        _controlPipe.ConnectionChanged += connected =>
            Logging.Log("net", connected ? "conectado ao plugin NeoBladeETS2." : "desconectado do plugin; tentando reconectar.");
    }

    private async Task InitializeAsync()
    {
        _fileServer.Start();

        var userDataFolder = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "NeoBladeConnectOS", "webview2-data");
        Directory.CreateDirectory(userDataFolder);

        var environment = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataFolder);
        await _webView.EnsureCoreWebView2Async(environment);

        _webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;
        _webView.CoreWebView2.Navigate($"http://127.0.0.1:{_fileServer.Port}/index.html");

        _controlPipe.Start();
        _captureTimer.Start();

        Logging.Log("webview2", "WebView2 inicializado e navegando para o bundle local.");

        // Start parked off-screen but still fully rendering/capturing — see
        // the class-level comment for why.
        ApplyInteractionMode(false);
        Show();
    }

    private void OnTelemetryReceived(JsonElement telemetry)
    {
        // Forward the whole snapshot verbatim into the page — src/integrations/ets2/ets2Bridge.ts
        // decides what to do with it (real telemetry when window.chrome.webview exists).
        if (InvokeRequired)
        {
            BeginInvoke(() => OnTelemetryReceived(telemetry));
            return;
        }

        try
        {
            _webView.CoreWebView2?.PostWebMessageAsJson(telemetry.GetRawText());
        }
        catch (Exception ex)
        {
            Logging.Log("webview2", $"falha ao repassar telemetria para a pagina: {ex.Message}");
        }

        if (telemetry.TryGetProperty("interactionModeActive", out var modeProp) &&
            modeProp.ValueKind is JsonValueKind.True or JsonValueKind.False)
        {
            var active = modeProp.GetBoolean();
            if (active != _interactionModeActive)
            {
                _interactionModeActive = active;
                ApplyInteractionMode(active);
            }
        }
    }

    private void ApplyInteractionMode(bool active)
    {
        if (InvokeRequired)
        {
            BeginInvoke(() => ApplyInteractionMode(active));
            return;
        }

        if (active)
        {
            var screen = Screen.PrimaryScreen?.WorkingArea ?? new Rectangle(0, 0, StageWidth, StageHeight);
            Location = new Point(
                screen.Left + Math.Max(0, (screen.Width - StageWidth) / 2),
                screen.Top + Math.Max(0, (screen.Height - StageHeight) / 2));
            TopMost = true;
            Activate();
            Logging.Log("input", "modo de interacao ATIVO: janela trazida para a tela para receber mouse/teclado reais.");
        }
        else
        {
            TopMost = false;
            Location = OffscreenLocation;
            Logging.Log("input", "modo de interacao INATIVO: janela devolvida para fora da tela (continua renderizando).");
        }
    }

    private void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        // Reserved for future host <- page requests (e.g. "request map
        // data refresh"). Logged, not acted on yet, so nothing here
        // silently no-ops something the page expects to work.
        Logging.Log("webview2", $"mensagem recebida da pagina: {e.WebMessageAsJson}");
    }

    private void CaptureAndPublishFrame()
    {
        try
        {
            var captured = _frameCapture.CaptureBgra(_webView.Handle);
            if (captured is not { } frame) return;
            _frameWriter.WriteFrame(frame.Bgra, frame.Width, frame.Height, frame.Stride);
        }
        catch (Exception ex)
        {
            Logging.Log("capture", $"falha ao capturar/publicar frame: {ex.Message}");
        }
    }

    private void Shutdown()
    {
        _captureTimer.Stop();
        _controlPipe.Dispose();
        _frameWriter.Dispose();
        _frameCapture.Dispose();
        _fileServer.Dispose();
    }
}
