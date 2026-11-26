#Requires -Version 5.1
<#
.SYNOPSIS
    Coleta evidencias (arquivos, versoes, logs) sobre o estado da
    instalacao do NeoBladeConnectOS para ETS2 e escreve um relatorio local
    com causa provavel - nunca "tudo OK" sem evidencia real de cada item.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
$logsDir = Join-Path $env:LOCALAPPDATA 'NeoBladeConnectOS\logs'
$stateFile = Join-Path $env:LOCALAPPDATA 'NeoBladeConnectOS\install-state.json'
$reportPath = Join-Path $env:LOCALAPPDATA "NeoBladeConnectOS\diagnostico_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

$lines = New-Object System.Collections.Generic.List[string]
function Add($text) { $lines.Add($text); Write-Host $text }

Add "NeoBladeConnectOS - Diagnostico ETS2 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add "================================================================"

# --- Estado de instalacao -------------------------------------------------
Add "`n[Instalacao]"
if (Test-Path $stateFile) {
    $state = Get-Content $stateFile -Raw | ConvertFrom-Json
    Add "  install-state.json encontrado."
    Add "  Jogo: $($state.gamePath)"
    Add "  Plugin registrado: $($state.pluginPath)"
    if (Test-Path $state.pluginPath) {
        $dll = Get-Item $state.pluginPath
        Add "  OK: DLL presente ($($dll.Length) bytes, modificado em $($dll.LastWriteTime))."
    } else {
        Add "  PROBLEMA: DLL registrada mas NAO esta mais no disco. Rode INSTALAR_NO_ETS2.ps1 de novo."
    }
    if (Test-Path $state.hostPath) {
        Add "  OK: host presente em $($state.hostPath)."
    } else {
        Add "  PROBLEMA: host nao encontrado em $($state.hostPath). Rode COMPILAR_NO_PC.ps1 de novo (ou confira o caminho)."
    }
} else {
    Add "  Nao instalado por este projeto ainda (ou install-state.json foi apagado). Rode .\INSTALAR_NO_ETS2.ps1."
}

# --- Jogo: versao e game.log.txt -------------------------------------------
Add "`n[Jogo]"
$gameLogPath = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Euro Truck Simulator 2\game.log.txt'
if (Test-Path $gameLogPath) {
    $gameLog = Get-Content $gameLogPath -Tail 4000
    Add "  game.log.txt encontrado ($($gameLog.Count) linhas lidas das ultimas - caminho: $gameLogPath)."

    $versionLine = $gameLog | Where-Object { $_ -match 'game version' } | Select-Object -Last 1
    if ($versionLine) { Add "  Versao do jogo (do log): $versionLine" }

    $sdkLines = $gameLog | Where-Object { $_ -match 'NeoBlade|sdk|plugin' -and $_ -notmatch 'NVIDIA|AMD' } | Select-Object -Last 15
    if ($sdkLines) {
        Add "  Linhas relevantes (SDK/plugins), ultimas 15:"
        $sdkLines | ForEach-Object { Add "    $_" }
    } else {
        Add "  Nenhuma linha mencionando SDK/plugins encontrada - o jogo rodou com algum plugin carregado?"
    }
} else {
    Add "  PROBLEMA: nao encontrei $gameLogPath - o ETS2 ja foi aberto pelo menos uma vez nesta conta?"
}

# --- WebView2 Runtime -------------------------------------------------------
Add "`n[WebView2 Runtime]"
$webview2Key = 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
if (Test-Path $webview2Key) {
    $pv = (Get-ItemProperty $webview2Key -ErrorAction SilentlyContinue).pv
    Add "  OK: WebView2 Runtime instalado (versao $pv)."
} else {
    Add "  PROBLEMA: WebView2 Runtime nao encontrado no registro. Instale em https://developer.microsoft.com/microsoft-edge/webview2/"
}

# --- Host process ------------------------------------------------------------
Add "`n[Processo do host]"
$hostProc = Get-Process -Name 'NeoBladeConnectOS.Host' -ErrorAction SilentlyContinue
if ($hostProc) {
    Add "  OK: host rodando (PID $($hostProc.Id), iniciado em $($hostProc.StartTime))."
} else {
    Add "  AVISO: host nao esta rodando agora. Inicie host\NeoBladeConnectOS.Host.exe (de dist\NeoBladeConnectOS-ETS2\host\)."
}

# --- Logs do NeoBladeConnectOS ------------------------------------------------
Add "`n[Logs do NeoBladeConnectOS] ($logsDir)"
if (Test-Path $logsDir) {
    Get-ChildItem $logsDir -Filter '*.log' | ForEach-Object {
        Add "  $($_.Name): $($_.Length) bytes, modificado em $($_.LastWriteTime)"
    }
    $sdkLog = Join-Path $logsDir 'neoblade_sdk.log'
    if (Test-Path $sdkLog) {
        Add "`n  Ultimas linhas de neoblade_sdk.log:"
        Get-Content $sdkLog -Tail 10 | ForEach-Object { Add "    $_" }
    }
    $renderLog = Join-Path $logsDir 'neoblade_render.log'
    if (Test-Path $renderLog) {
        Add "`n  Ultimas linhas de neoblade_render.log:"
        Get-Content $renderLog -Tail 10 | ForEach-Object { Add "    $_" }
    }
} else {
    Add "  PROBLEMA: pasta de logs nao existe ainda - o plugin nunca rodou (scs_telemetry_init nunca foi chamado)."
    Add "  Causa provavel: o jogo nao carregou a DLL. Confira se ela esta em <ETS2>\bin\win_x64\plugins\ e se o"
    Add "  aviso de 'recursos de SDK' do jogo foi aceito na Configuracao > Mods/SDK."
}

Add "`n================================================================"
Add "Relatorio salvo em: $reportPath"
Add "Envie este arquivo se for pedir ajuda - ele nao contem transcricoes de voz, tokens nem dados pessoais."

New-Item -ItemType Directory -Force -Path (Split-Path $reportPath) | Out-Null
Set-Content -Path $reportPath -Value ($lines -join "`r`n") -Encoding UTF8
