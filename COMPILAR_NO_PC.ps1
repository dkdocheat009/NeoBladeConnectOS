#Requires -Version 5.1
<#
.SYNOPSIS
    Fase 10 - compila o frontend, o plugin nativo (DLL) e o host WebView2,
    verifica os exports da DLL e monta dist/NeoBladeConnectOS-ETS2/.

.DESCRIPTION
    Uso no seu Windows:
        powershell -NoProfile -ExecutionPolicy Bypass -File .\COMPILAR_NO_PC.ps1

    Este script NAO instala nada no ETS2 (isso e INSTALAR_NO_ETS2.ps1). Ele
    so detecta as ferramentas necessarias, mostra exatamente o que falta
    (com link oficial) quando algo nao e encontrado, e compila os tres
    componentes do projeto:
      1. Frontend React/Vite (npm ci + npm run build)       -> dist/ (raiz)
      2. Plugin nativo C++ (CMake + MSVC, Release x64)      -> native/NeoBladeETS2/build
      3. Host WebView2 (.NET, self-contained, single-file)  -> host/NeoBladeHost/bin

    Falha (exit code != 0) se qualquer etapa falhar ou se a DLL/EXE finais
    nao existirem/nao estiverem na arquitetura certa - nunca copia um
    binario incompleto para dist/.
#>

[CmdletBinding()]
param(
    [switch]$SkipFrontend,
    [switch]$SkipNative,
    [switch]$SkipHost
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PSScriptRoot
$DistRoot = Join-Path $RepoRoot 'dist\NeoBladeConnectOS-ETS2'

function Write-Step($message) { Write-Host "`n==> $message" -ForegroundColor Cyan }
function Write-Ok($message) { Write-Host "    OK: $message" -ForegroundColor Green }
function Write-Missing($tool, $link) {
    Write-Host "    FALTANDO: $tool" -ForegroundColor Red
    Write-Host "       Baixe em: $link" -ForegroundColor Yellow
}

$missing = @()

Write-Step "Verificando ferramentas necessarias"

# --- Node / npm --------------------------------------------------------
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Ok "Node.js $(node --version) encontrado em $($node.Source)"
} else {
    Write-Missing "Node.js (LTS)" "https://nodejs.org/"
    $missing += 'node'
}

# --- CMake ---------------------------------------------------------------
$cmake = Get-Command cmake -ErrorAction SilentlyContinue
if ($cmake) {
    Write-Ok "CMake $((cmake --version | Select-Object -First 1) -replace 'cmake version ','') encontrado"
} else {
    Write-Missing "CMake" "https://cmake.org/download/"
    $missing += 'cmake'
}

# --- .NET SDK --------------------------------------------------------------
$dotnet = Get-Command dotnet -ErrorAction SilentlyContinue
if ($dotnet) {
    $sdks = & dotnet --list-sdks 2>$null
    Write-Ok ".NET SDK encontrado: $($sdks -join '; ')"
} else {
    Write-Missing ".NET SDK 8.0+" "https://dotnet.microsoft.com/download"
    $missing += 'dotnet'
}

# --- MSVC (via vswhere, nao assume caminho fixo) --------------------------
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$vsInstallPath = $null
$vcvars64 = $null
if (Test-Path $vswhere) {
    $vsInstallPath = & $vswhere -latest -products * `
        -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 `
        -property installationPath 2>$null
}
if ($vsInstallPath) {
    $vcvars64 = Join-Path $vsInstallPath 'VC\Auxiliary\Build\vcvars64.bat'
}
if ($vcvars64 -and (Test-Path $vcvars64)) {
    Write-Ok "MSVC x64 encontrado em: $vsInstallPath"
} else {
    Write-Missing "Visual Studio 2022/2026 (Community/Build Tools) com 'Desenvolvimento para desktop com C++'" `
        "https://visualstudio.microsoft.com/downloads/ (role ate 'Tools for Visual Studio' para so o Build Tools)"
    $missing += 'msvc'
}

# --- Windows SDK (vem com o componente C++ do VS, mas confirma mesmo assim)
$windowsSdkRoot = "${env:ProgramFiles(x86)}\Windows Kits\10\Include"
if (Test-Path $windowsSdkRoot) {
    $sdkVersions = Get-ChildItem $windowsSdkRoot -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
    Write-Ok "Windows SDK encontrado: $($sdkVersions -join ', ')"
} else {
    Write-Missing "Windows 10/11 SDK" "https://developer.microsoft.com/windows/downloads/windows-sdk/"
    $missing += 'windows-sdk'
}

# --- WebView2 Runtime (necessario para RODAR o host, nao para compilar) ---
$webview2Key = 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
$webview2Installed = Test-Path $webview2Key
if ($webview2Installed) {
    Write-Ok "WebView2 Runtime instalado (necessario para RODAR o host depois)."
} else {
    Write-Host "    AVISO: WebView2 Runtime nao detectado no registro. Normalmente ja vem com o Windows 11/Edge atualizado;" -ForegroundColor Yellow
    Write-Host "       se o host falhar ao iniciar depois, instale em: https://developer.microsoft.com/microsoft-edge/webview2/" -ForegroundColor Yellow
}

if ($missing.Count -gt 0) {
    Write-Host "`nFerramentas faltando: $($missing -join ', '). Instale-as e rode este script de novo." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $DistRoot | Out-Null

# ===========================================================================
# 1) Frontend
# ===========================================================================
if (-not $SkipFrontend) {
    Write-Step "Compilando o frontend (npm ci + npm run build)"
    Push-Location $RepoRoot
    try {
        & npm ci
        if ($LASTEXITCODE -ne 0) { throw "npm ci falhou (exit $LASTEXITCODE)." }
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build falhou (exit $LASTEXITCODE)." }
    } finally {
        Pop-Location
    }
    $indexHtml = Join-Path $RepoRoot 'dist\index.html'
    if (-not (Test-Path $indexHtml)) { throw "npm run build terminou mas dist/index.html nao existe." }
    Write-Ok "Frontend compilado em dist/."

    $webDist = Join-Path $DistRoot 'web'
    Remove-Item -Recurse -Force $webDist -ErrorAction SilentlyContinue
    # Copia so o dist/ da RAIZ (o build do Vite), nao o dist/NeoBladeConnectOS-ETS2
    # que estamos montando agora, para nao se copiar recursivamente.
    robocopy (Join-Path $RepoRoot 'dist') $webDist /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    Write-Ok "Copiado para $webDist"
} else {
    Write-Step "Pulando o frontend (-SkipFrontend)"
}

# ===========================================================================
# 2) Plugin nativo (C++ / CMake / MSVC)
# ===========================================================================
if (-not $SkipNative) {
    Write-Step "Compilando o plugin nativo (CMake + MSVC, Release x64)"
    $nativeDir = Join-Path $RepoRoot 'native\NeoBladeETS2'
    $buildDir = Join-Path $nativeDir 'build'

    Push-Location $nativeDir
    try {
        & cmake -B build -A x64
        if ($LASTEXITCODE -ne 0) { throw "cmake (configure) falhou (exit $LASTEXITCODE)." }
        & cmake --build build --config Release
        if ($LASTEXITCODE -ne 0) { throw "cmake --build falhou (exit $LASTEXITCODE)." }
    } finally {
        Pop-Location
    }

    $dllPath = Join-Path $buildDir 'bin\Release\NeoBladeConnectOS_ETS2.dll'
    if (-not (Test-Path $dllPath)) { throw "Build terminou mas $dllPath nao existe." }

    # Verifica arquitetura (precisa ser x64) e exports (precisa ter as duas
    # funcoes que o ETS2 procura) antes de aceitar o binario - "nao copiar
    # uma DLL sem os exports que o jogo vai carregar" (Fase 10, secao 8).
    $dumpbin = Get-ChildItem -Path "${env:ProgramFiles}\Microsoft Visual Studio" -Recurse -Filter 'dumpbin.exe' -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match 'Hostx64\\x64' } | Select-Object -First 1
    if ($dumpbin) {
        # Join to one string before matching: dumpbin's output comes back as
        # an array of lines, and "-notmatch" on an array filters elements
        # rather than giving one boolean, so checking it with `if` (an
        # array of "lines that didn't match" is truthy whenever ANY line
        # fails to match, i.e. almost always) would silently always throw.
        $dumpOut = (& $dumpbin.FullName /exports /headers $dllPath 2>&1) -join "`n"
        if ($dumpOut -notmatch '8664 machine \(x64\)') { throw "NeoBladeConnectOS_ETS2.dll nao e x64 - build invalido." }
        if ($dumpOut -notmatch 'scs_telemetry_init') { throw "NeoBladeConnectOS_ETS2.dll nao exporta scs_telemetry_init." }
        if ($dumpOut -notmatch 'scs_telemetry_shutdown') { throw "NeoBladeConnectOS_ETS2.dll nao exporta scs_telemetry_shutdown." }
        Write-Ok "Exports e arquitetura (x64) verificados com dumpbin."
    } else {
        Write-Host "    AVISO: dumpbin.exe nao encontrado; pulando a verificacao automatica de exports/arquitetura." -ForegroundColor Yellow
        Write-Host "       (nao deveria acontecer se o MSVC foi detectado acima - confira a instalacao do Visual Studio.)" -ForegroundColor Yellow
    }

    $pluginDist = Join-Path $DistRoot 'plugin'
    New-Item -ItemType Directory -Force -Path $pluginDist | Out-Null
    Copy-Item $dllPath (Join-Path $pluginDist 'NeoBladeConnectOS_ETS2.dll') -Force
    Write-Ok "Plugin copiado para $pluginDist\NeoBladeConnectOS_ETS2.dll"
} else {
    Write-Step "Pulando o plugin nativo (-SkipNative)"
}

# ===========================================================================
# 3) Host WebView2 (.NET, self-contained, single-file)
# ===========================================================================
if (-not $SkipHost) {
    Write-Step "Compilando o host (.NET, self-contained win-x64)"
    $hostDir = Join-Path $RepoRoot 'host\NeoBladeHost'
    $hostPublish = Join-Path $hostDir 'bin\Release\net8.0-windows\win-x64\publish'

    Push-Location $hostDir
    try {
        & dotnet publish -c Release -r win-x64 --self-contained true
        if ($LASTEXITCODE -ne 0) { throw "dotnet publish falhou (exit $LASTEXITCODE)." }
    } finally {
        Pop-Location
    }

    $hostExe = Join-Path $hostPublish 'NeoBladeConnectOS.Host.exe'
    if (-not (Test-Path $hostExe)) { throw "Publish terminou mas $hostExe nao existe." }

    $hostDist = Join-Path $DistRoot 'host'
    Remove-Item -Recurse -Force $hostDist -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path $hostDist | Out-Null
    Copy-Item $hostExe $hostDist -Force
    Write-Ok "Host copiado para $hostDist\NeoBladeConnectOS.Host.exe"
} else {
    Write-Step "Pulando o host (-SkipHost)"
}

# ===========================================================================
# README_INSTALACAO.txt
# ===========================================================================
$readme = @"
NeoBladeConnectOS para ETS2 - pacote compilado em $(Get-Date -Format 'yyyy-MM-dd HH:mm')

Estrutura:
  plugin\NeoBladeConnectOS_ETS2.dll   -> vai para bin\win_x64\plugins do ETS2
  host\NeoBladeConnectOS.Host.exe     -> roda no seu PC, fora da pasta do jogo
  web\                                -> build do frontend que o host serve localmente

PROXIMO PASSO: rode .\INSTALAR_NO_ETS2.ps1 (na raiz do repositorio) para instalar
o plugin na sua instalacao do ETS2, com backup automatico e confirmacao antes de
qualquer alteracao.

Depois de instalar:
  1. Feche o ETS2 se estiver aberto.
  2. Rode host\NeoBladeConnectOS.Host.exe (ou deixe o instalador configurar
     para iniciar com o jogo - ver docs/ETS2_INSTALL_GUIDE.md).
  3. Abra o ETS2. O plugin grava logs em
     %LOCALAPPDATA%\NeoBladeConnectOS\logs\ - confira neoblade_sdk.log para
     confirmar que a telemetria inicializou.
  4. Ctrl+Alt+I alterna o modo de interacao (mouse/teclado); Escape solta.
  5. Testes detalhados e o que cada um prova: ver docs/ETS2_TESTING.md.

Este pacote NAO afirma ter sido testado dentro do ETS2 - isso só é possível no
seu PC, com o jogo instalado. Ver docs/ETS2_ARCHITECTURE.md para o que foi
verificado nesta maquina (build/exports) versus o que depende do seu teste.
"@
Set-Content -Path (Join-Path $DistRoot 'README_INSTALACAO.txt') -Value $readme -Encoding UTF8

Write-Step "Concluido"
Write-Host "Pacote em: $DistRoot" -ForegroundColor Green
Get-ChildItem -Recurse $DistRoot | Select-Object FullName, Length | Format-Table -AutoSize
