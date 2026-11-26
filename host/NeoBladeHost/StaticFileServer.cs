using System.Net;

namespace NeoBladeHost;

/// <summary>
/// Serves the built Vite bundle (dist/) over http://127.0.0.1 so WebView2
/// can navigate to a real http(s) origin instead of file:// — ES module
/// imports, relative asset paths and the existing football-data.org dev
/// proxy's absence are all non-issues once content comes from an http
/// origin with correct MIME types, which file:// does not reliably give.
/// Bound to the loopback address only: "manter API local em 127.0.0.1 ...
/// nao expor sem autorizacao para a LAN" (Fase 10 task, section 9).
/// </summary>
internal sealed class StaticFileServer : IDisposable
{
    private readonly HttpListener _listener = new();
    private readonly string _root;
    private readonly CancellationTokenSource _cts = new();

    private static readonly Dictionary<string, string> MimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".html"] = "text/html; charset=utf-8",
        [".js"] = "text/javascript; charset=utf-8",
        [".mjs"] = "text/javascript; charset=utf-8",
        [".css"] = "text/css; charset=utf-8",
        [".json"] = "application/json; charset=utf-8",
        [".svg"] = "image/svg+xml",
        [".png"] = "image/png",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".woff2"] = "font/woff2",
        [".ico"] = "image/x-icon",
    };

    public int Port { get; }

    public StaticFileServer(string root, int preferredPort = 51820)
    {
        _root = Path.GetFullPath(root);
        Port = preferredPort;
        _listener.Prefixes.Add($"http://127.0.0.1:{Port}/");
    }

    public void Start()
    {
        _listener.Start();
        Logging.Log("webview2", $"servidor estatico local em http://127.0.0.1:{Port}/, servindo {_root}");
        _ = Task.Run(AcceptLoop);
    }

    private async Task AcceptLoop()
    {
        while (!_cts.IsCancellationRequested)
        {
            HttpListenerContext ctx;
            try
            {
                ctx = await _listener.GetContextAsync();
            }
            catch (Exception) when (_cts.IsCancellationRequested)
            {
                return;
            }
            catch (Exception ex)
            {
                Logging.Log("webview2", $"erro aceitando conexao local: {ex.Message}");
                continue;
            }
            _ = Task.Run(() => HandleRequest(ctx));
        }
    }

    private void HandleRequest(HttpListenerContext ctx)
    {
        try
        {
            var path = ctx.Request.Url?.AbsolutePath ?? "/";
            if (path == "/") path = "/index.html";
            var fullPath = Path.GetFullPath(Path.Combine(_root, path.TrimStart('/')));

            // Refuse anything that escaped _root via "..", and fall back to
            // index.html for client-side routes (this app has none today,
            // but costs nothing to handle correctly).
            if (!fullPath.StartsWith(_root, StringComparison.OrdinalIgnoreCase))
            {
                ctx.Response.StatusCode = 403;
                ctx.Response.Close();
                return;
            }
            if (!File.Exists(fullPath))
            {
                fullPath = Path.Combine(_root, "index.html");
            }

            var ext = Path.GetExtension(fullPath);
            ctx.Response.ContentType = MimeTypes.GetValueOrDefault(ext, "application/octet-stream");
            var bytes = File.ReadAllBytes(fullPath);
            ctx.Response.ContentLength64 = bytes.Length;
            ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
        }
        catch (Exception ex)
        {
            Logging.Log("webview2", $"erro servindo requisicao: {ex.Message}");
            ctx.Response.StatusCode = 500;
        }
        finally
        {
            ctx.Response.Close();
        }
    }

    public void Dispose()
    {
        _cts.Cancel();
        _listener.Stop();
        _listener.Close();
        _cts.Dispose();
    }
}
