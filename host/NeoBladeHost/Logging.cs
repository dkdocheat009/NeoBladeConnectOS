namespace NeoBladeHost;

/// <summary>
/// Mirrors native/NeoBladeETS2/src/logging.hpp's category set and
/// %LOCALAPPDATA% location, so a single DIAGNOSTICAR_ETS2.ps1 run can
/// collect both sides' logs from one folder. Deliberately simple (no
/// external logging package): one small rotating-by-session file per
/// category, same rate-limit discipline as the native side.
/// </summary>
internal static class Logging
{
    private static readonly object Lock = new();
    private static readonly Dictionary<string, StreamWriter> Writers = new();
    private static readonly Dictionary<string, int> LineCounts = new();
    private const int MaxLinesPerCategory = 200_000;

    private static readonly string LogDirectory = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "NeoBladeConnectOS", "logs");

    public static void Log(string category, string message)
    {
        lock (Lock)
        {
            Directory.CreateDirectory(LogDirectory);
            if (!Writers.TryGetValue(category, out var writer))
            {
                var path = Path.Combine(LogDirectory, $"neoblade_host_{category}.log");
                writer = new StreamWriter(new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read))
                {
                    AutoFlush = true,
                };
                Writers[category] = writer;
                LineCounts[category] = 0;
            }

            var count = LineCounts[category];
            if (count > MaxLinesPerCategory) return;
            LineCounts[category] = count + 1;

            var line = count == MaxLinesPerCategory
                ? $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] limite de {MaxLinesPerCategory} linhas atingido; silenciando o restante desta sessao."
                : $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] {message}";
            writer.WriteLine(line);
        }
    }
}
