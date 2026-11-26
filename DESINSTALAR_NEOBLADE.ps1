#Requires -Version 5.1
<#
.SYNOPSIS
    Remove SOMENTE os arquivos que o NeoBladeConnectOS instalou (ver
    install-state.json, gravado por INSTALAR_NO_ETS2.ps1) e restaura o
    backup do plugin anterior, se houver um gerenciado por este projeto.
    Nunca mexe em outros mods/plugins de terceiros.
#>

[CmdletBinding()]
param([switch]$Force)

$ErrorActionPreference = 'Stop'
$stateFile = Join-Path $env:LOCALAPPDATA 'NeoBladeConnectOS\install-state.json'
$BackupRoot = Join-Path $env:LOCALAPPDATA 'NeoBladeConnectOS\backups'

if (-not (Test-Path $stateFile)) {
    Write-Host "Nao encontrei $stateFile - nada para desinstalar (ou a instalacao foi feita manualmente)." -ForegroundColor Yellow
    exit 0
}

$state = Get-Content $stateFile -Raw | ConvertFrom-Json
Write-Host "Instalacao registrada:"
Write-Host "  Plugin: $($state.pluginPath)"
Write-Host "  Instalado em: $($state.installedAt)"

if (-not $Force) {
    $answer = Read-Host "`nConfirma a remocao do plugin NeoBladeConnectOS do ETS2? (s/N)"
    if ($answer -notmatch '^[sS]') {
        Write-Host "Cancelado." -ForegroundColor Yellow
        exit 0
    }
}

if (Test-Path $state.pluginPath) {
    Remove-Item $state.pluginPath -Force
    Write-Host "Removido: $($state.pluginPath)" -ForegroundColor Green
} else {
    Write-Host "Plugin ja nao estava em $($state.pluginPath) (removido manualmente?)." -ForegroundColor Yellow
}

# Restaura o backup mais recente DESTE plugin, se existir (nunca mexe em
# qualquer outro arquivo .dll de terceiros na pasta plugins).
$latestBackup = Get-ChildItem $BackupRoot -Filter 'NeoBladeConnectOS_ETS2.dll.*.bak' -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($latestBackup) {
    Copy-Item $latestBackup.FullName $state.pluginPath -Force
    Write-Host "Backup restaurado: $($latestBackup.Name) -> $($state.pluginPath)" -ForegroundColor Green
}

Remove-Item $stateFile -Force
Write-Host "`nDesinstalacao concluida. Logs em %LOCALAPPDATA%\NeoBladeConnectOS\logs\ foram mantidos (apague manualmente se quiser)." -ForegroundColor Green
