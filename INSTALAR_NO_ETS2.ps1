#Requires -Version 5.1
<#
.SYNOPSIS
    Instala o plugin NeoBladeConnectOS_ETS2.dll compilado por
    COMPILAR_NO_PC.ps1 na pasta bin\win_x64\plugins da sua instalacao do
    ETS2, com backup e confirmacao antes de qualquer alteracao.

.PARAMETER GamePath
    Caminho da instalacao do ETS2 (a pasta que contem bin\win_x64). Se
    omitido, o script tenta detectar pelo Steam.

.PARAMETER Force
    Pula a confirmacao interativa (ainda faz backup).
#>

[CmdletBinding()]
param(
    [string]$GamePath,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PSScriptRoot
$DistRoot = Join-Path $RepoRoot 'dist\NeoBladeConnectOS-ETS2'
$PluginSource = Join-Path $DistRoot 'plugin\NeoBladeConnectOS_ETS2.dll'
$BackupRoot = Join-Path $env:LOCALAPPDATA 'NeoBladeConnectOS\backups'

function Write-Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }

if (-not (Test-Path $PluginSource)) {
    Write-Host "Nao encontrei $PluginSource." -ForegroundColor Red
    Write-Host "Rode primeiro: powershell -NoProfile -ExecutionPolicy Bypass -File .\COMPILAR_NO_PC.ps1" -ForegroundColor Yellow
    exit 1
}

function Find-Ets2InstallPath {
    $candidates = @()

    # Steam libraryfolders.vdf costuma listar todas as bibliotecas, nao so a padrao.
    $steamPaths = @(
        "${env:ProgramFiles(x86)}\Steam",
        "${env:ProgramFiles}\Steam"
    )
    foreach ($steamPath in $steamPaths) {
        $vdf = Join-Path $steamPath 'steamapps\libraryfolders.vdf'
        if (Test-Path $vdf) {
            $content = Get-Content $vdf -Raw
            $libraryPaths = [regex]::Matches($content, '"path"\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value -replace '\\\\', '\' }
            foreach ($lib in ($libraryPaths + $steamPath)) {
                $candidates += Join-Path $lib 'steamapps\common\Euro Truck Simulator 2'
            }
        }
    }
    $candidates | Where-Object { Test-Path (Join-Path $_ 'bin\win_x64') } | Select-Object -First 1
}

if (-not $GamePath) {
    Write-Step "Procurando a instalacao do ETS2 (Steam)"
    $GamePath = Find-Ets2InstallPath
    if ($GamePath) {
        Write-Host "    Encontrado: $GamePath" -ForegroundColor Green
    } else {
        Write-Host "    Nao encontrei automaticamente. Rode de novo com -GamePath `"<pasta do ETS2>`"." -ForegroundColor Red
        Write-Host "    (a pasta certa e a que contem bin\win_x64 - ex.: ...\steamapps\common\Euro Truck Simulator 2)" -ForegroundColor Yellow
        exit 1
    }
}

$pluginsDir = Join-Path $GamePath 'bin\win_x64\plugins'
if (-not (Test-Path (Join-Path $GamePath 'bin\win_x64'))) {
    Write-Host "`"$GamePath`" nao parece uma instalacao valida do ETS2 (falta bin\win_x64)." -ForegroundColor Red
    exit 1
}

Write-Step "Resumo da instalacao"
Write-Host "  Origem : $PluginSource"
Write-Host "  Destino: $pluginsDir\NeoBladeConnectOS_ETS2.dll"
Write-Host "  Backup : $BackupRoot (se ja existir um plugin com esse nome)"

if (-not $Force) {
    $answer = Read-Host "`nConfirma a instalacao? (s/N)"
    if ($answer -notmatch '^[sS]') {
        Write-Host "Cancelado." -ForegroundColor Yellow
        exit 0
    }
}

New-Item -ItemType Directory -Force -Path $pluginsDir | Out-Null
New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$destDll = Join-Path $pluginsDir 'NeoBladeConnectOS_ETS2.dll'
if (Test-Path $destDll) {
    $stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupPath = Join-Path $BackupRoot "NeoBladeConnectOS_ETS2.dll.$stamp.bak"
    Copy-Item $destDll $backupPath -Force
    Write-Host "Backup da versao anterior salvo em: $backupPath" -ForegroundColor Green
}

Copy-Item $PluginSource $destDll -Force
Write-Host "`nPlugin instalado em: $destDll" -ForegroundColor Green

# Registra o caminho do host para referencia futura (INSTALAR nao cria
# atalho/inicializacao automatica do host - ver docs/ETS2_INSTALL_GUIDE.md
# para iniciar manualmente ou configurar junto com o Steam).
$stateFile = Join-Path $env:LOCALAPPDATA 'NeoBladeConnectOS\install-state.json'
New-Item -ItemType Directory -Force -Path (Split-Path $stateFile) | Out-Null
@{
    gamePath    = $GamePath
    pluginPath  = $destDll
    hostPath    = (Join-Path $DistRoot 'host\NeoBladeConnectOS.Host.exe')
    installedAt = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content -Path $stateFile -Encoding UTF8

Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host "  1. Abra o ETS2 uma vez; na primeira execucao com um plugin SDK novo, o jogo"
Write-Host "     mostra um aviso sobre 'recursos de SDK' - aceite para a telemetria funcionar."
Write-Host "  2. Rode $(Join-Path $DistRoot 'host\NeoBladeConnectOS.Host.exe') (pode rodar antes ou depois do jogo abrir)."
Write-Host "  3. Confira %LOCALAPPDATA%\NeoBladeConnectOS\logs\neoblade_sdk.log para ver se a"
Write-Host "     telemetria inicializou. Use .\DIAGNOSTICAR_ETS2.ps1 se algo nao bater."
Write-Host "  4. Para desinstalar: .\DESINSTALAR_NEOBLADE.ps1"
