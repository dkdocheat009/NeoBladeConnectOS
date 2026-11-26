namespace NeoBladeHost;

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();

        // "sem depender de npm run dev": the host always serves a prebuilt
        // dist/ folder. Default assumes the layout COMPILAR_NO_PC.ps1
        // produces (dist/NeoBladeConnectOS-ETS2/host/NeoBladeConnectOS.Host.exe
        // next to a ../web/ folder); --web-root overrides it for manual runs.
        string webRoot = Path.Combine(AppContext.BaseDirectory, "..", "web");
        foreach (var arg in args)
        {
            if (arg.StartsWith("--web-root=", StringComparison.OrdinalIgnoreCase))
            {
                webRoot = arg["--web-root=".Length..];
            }
        }
        webRoot = Path.GetFullPath(webRoot);

        if (!File.Exists(Path.Combine(webRoot, "index.html")))
        {
            MessageBox.Show(
                $"Nao encontrei o build do NeoBladeConnectOS em:\n{webRoot}\n\n" +
                "Rode \"npm run build\" na raiz do projeto (gera dist/) e confirme o layout, " +
                "ou passe --web-root=<pasta> ao iniciar o host.",
                "NeoBladeConnectOS Host", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Environment.Exit(1);
            return;
        }

        Application.Run(new MainForm(webRoot));
    }
}
