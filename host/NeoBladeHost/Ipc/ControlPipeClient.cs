using System.IO.Pipes;
using System.Text;
using System.Text.Json;

namespace NeoBladeHost.Ipc;

/// <summary>
/// Client side of native/NeoBladeETS2/src/ipc/control_pipe.*: connects to
/// \\.\pipe\NeoBladeConnectOS_Control (the plugin is always the server,
/// since it's guaranteed to load before this host exists), reads
/// newline-delimited telemetry JSON, and can send small control messages
/// back. Reconnects on its own if the game/plugin isn't up yet or the pipe
/// drops — "reconexao... sem bloquear" per the Fase 10 task.
/// </summary>
internal sealed class ControlPipeClient : IDisposable
{
    private const string PipeName = "NeoBladeConnectOS_Control";
    private readonly CancellationTokenSource _cts = new();
    private NamedPipeClientStream? _pipe;
    private readonly object _writeLock = new();

    public event Action<JsonElement>? TelemetryReceived;
    public event Action<bool>? ConnectionChanged;

    public void Start() => _ = Task.Run(RunLoop);

    public void SendMessage(object message)
    {
        lock (_writeLock)
        {
            if (_pipe is not { IsConnected: true }) return;
            try
            {
                var line = JsonSerializer.Serialize(message) + "\n";
                var bytes = Encoding.UTF8.GetBytes(line);
                _pipe.Write(bytes, 0, bytes.Length);
                _pipe.Flush();
            }
            catch (Exception ex)
            {
                Logging.Log("net", $"control pipe: falha ao enviar mensagem: {ex.Message}");
            }
        }
    }

    private async Task RunLoop()
    {
        while (!_cts.IsCancellationRequested)
        {
            try
            {
                using var pipe = new NamedPipeClientStream(".", PipeName, PipeDirection.InOut, PipeOptions.Asynchronous);
                await pipe.ConnectAsync(2000, _cts.Token);
                _pipe = pipe;
                ConnectionChanged?.Invoke(true);
                Logging.Log("net", "control pipe: conectado ao plugin.");

                using var reader = new StreamReader(pipe, Encoding.UTF8, leaveOpen: true);
                while (pipe.IsConnected && !_cts.IsCancellationRequested)
                {
                    var line = await reader.ReadLineAsync(_cts.Token);
                    if (line is null) break;
                    if (line.Length == 0) continue;
                    try
                    {
                        using var doc = JsonDocument.Parse(line);
                        TelemetryReceived?.Invoke(doc.RootElement.Clone());
                    }
                    catch (JsonException ex)
                    {
                        Logging.Log("net", $"control pipe: linha JSON invalida ignorada: {ex.Message}");
                    }
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (TimeoutException)
            {
                // Plugin not loaded yet (game not running, or still starting) — normal, retry quietly.
            }
            catch (Exception ex)
            {
                Logging.Log("net", $"control pipe: erro de conexao: {ex.Message}");
            }

            _pipe = null;
            ConnectionChanged?.Invoke(false);
            if (!_cts.IsCancellationRequested)
            {
                await Task.Delay(1000, _cts.Token).ContinueWith(_ => { });
            }
        }
    }

    public void Dispose()
    {
        _cts.Cancel();
        _pipe?.Dispose();
        _cts.Dispose();
    }
}
