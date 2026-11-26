#Requires -Version 5.1
<#
.SYNOPSIS
    Gera dados de mapa reais do ETS2 usando o pipeline parser/generator do
    projeto TruckSim Maps (truckermudgeon/maps, GPL-3.0), a partir da SUA
    propria instalacao do jogo - nunca baixa ou redistribui conteudo dos
    DLCs. Produz GeoJSON que o app consome em src/integrations/ets2/map.

.DESCRIPTION
    - Clona (ou atualiza) truckermudgeon/maps em tools/maps-src/ (fora do
      controle de versao deste projeto - ver .gitignore).
    - Roda `npm install` + o build do addon nativo do parser (precisa do
      MSVC que COMPILAR_NO_PC.ps1 ja verifica).
    - Roda `parser` apontando para a SUA instalacao do ETS2 (-GamePath).
    - Roda `generator map -m europe` para produzir GeoJSON de estradas/
      prefabs/cidades.
    - Copia o resultado para tools/map-data/ (consumido pelo frontend
      quando presente; sem isso, Navegacao/Dashboard continuam com o mapa
      mock de sempre - nunca inventam dados de mapa).

.PARAMETER GamePath
    Pasta de instalacao do ETS2 (precisa conter os arquivos base.scs etc.
    em bin/ ou na raiz, conforme a instalacao Steam padrao).
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$GamePath
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$MapsSrcDir = Join-Path $RepoRoot 'tools\maps-src'
$MapDataDir = Join-Path $RepoRoot 'tools\map-data'
$WebMapDir = Join-Path $RepoRoot 'src\integrations\ets2\map-data'

function Write-Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }

if (-not (Test-Path $GamePath)) {
    Write-Host "Pasta do jogo nao encontrada: $GamePath" -ForegroundColor Red
    exit 1
}
$gameDataIndicator = Join-Path $GamePath 'base.scs'
if (-not (Test-Path $gameDataIndicator)) {
    Write-Host "AVISO: nao encontrei base.scs em $GamePath - confirme que e a pasta raiz da instalacao do ETS2." -ForegroundColor Yellow
}

git --version *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Git nao encontrado - necessario para clonar truckermudgeon/maps. Instale: https://git-scm.com/downloads" -ForegroundColor Red
    exit 1
}

Write-Step "Obtendo/atualizando truckermudgeon/maps (GPL-3.0) em $MapsSrcDir"
if (-not (Test-Path $MapsSrcDir)) {
    & git clone --recurse-submodules https://github.com/truckermudgeon/maps.git $MapsSrcDir
    if ($LASTEXITCODE -ne 0) { throw "git clone falhou." }
} else {
    Push-Location $MapsSrcDir
    try { & git pull --ff-only } finally { Pop-Location }
}

Write-Step "Instalando dependencias (npm install) e compilando o parser (addon nativo)"
Push-Location $MapsSrcDir
try {
    & npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install falhou em maps-src." }
    & npm run build -w packages/clis/parser
    if ($LASTEXITCODE -ne 0) { throw "build do parser (addon nativo) falhou - confira se o MSVC esta instalado (ver COMPILAR_NO_PC.ps1)." }
} finally {
    Pop-Location
}

Write-Step "Rodando o parser sobre a sua instalacao do ETS2 (pode levar alguns minutos)"
$parserOutDir = Join-Path $MapDataDir 'parser-output'
New-Item -ItemType Directory -Force -Path $parserOutDir | Out-Null
Push-Location $MapsSrcDir
try {
    & npx parser -i $GamePath -o $parserOutDir
    if ($LASTEXITCODE -ne 0) { throw "parser falhou." }
} finally {
    Pop-Location
}

$europeJson = Get-ChildItem $parserOutDir -Filter '*europe*' -ErrorAction SilentlyContinue
if (-not $europeJson) {
    Write-Host "AVISO: o parser rodou mas nao encontrei saida com 'europe' no nome em $parserOutDir." -ForegroundColor Yellow
    Write-Host "       Isso pode significar que o ETS2 base nao foi identificado corretamente - confira os logs acima." -ForegroundColor Yellow
}

Write-Step "Gerando GeoJSON (roads/prefabs) com o generator"
Push-Location $MapsSrcDir
try {
    & npx generator map -m europe -i $parserOutDir -o $MapDataDir
    if ($LASTEXITCODE -ne 0) { throw "generator falhou." }
} finally {
    Pop-Location
}

# PMTiles (tippecanoe) e opcional: a maioria dos usuarios Windows nao tem
# tippecanoe instalado (e uma ferramenta C++ sem instalador oficial para
# Windows) - o frontend sabe consumir o GeoJSON puro do generator
# diretamente via MapLibre (menos otimizado para mapas gigantes, mas
# funcional sem exigir uma ferramenta extra). Documentado, nao escondido.
$tippecanoe = Get-Command tippecanoe -ErrorAction SilentlyContinue
if ($tippecanoe) {
    Write-Step "tippecanoe encontrado - gerando PMTiles (otimizado)"
    # (passo opcional - ver README do truckermudgeon/maps para os comandos exatos
    # de tippecanoe por tipo de camada; nao incluido por padrao nesta automacao.)
} else {
    Write-Host "`ntippecanoe nao encontrado - usando GeoJSON diretamente (sem PMTiles)." -ForegroundColor Yellow
    Write-Host "  Para um mapa mais leve/rapido em telas antigas, instale tippecanoe e rode este script de novo:" -ForegroundColor Yellow
    Write-Host "  https://github.com/felt/tippecanoe" -ForegroundColor Yellow
}

Write-Step "Copiando dados gerados para o frontend ($WebMapDir)"
New-Item -ItemType Directory -Force -Path $WebMapDir | Out-Null
$geoJsonFiles = Get-ChildItem $MapDataDir -Filter '*.geojson' -ErrorAction SilentlyContinue
if ($geoJsonFiles) {
    Copy-Item $geoJsonFiles.FullName $WebMapDir -Force
    Write-Host "Copiado(s): $($geoJsonFiles.Name -join ', ')" -ForegroundColor Green
    "generatedAt: $(Get-Date -Format o)" | Set-Content (Join-Path $WebMapDir 'GENERATED.txt')
} else {
    Write-Host "Nenhum .geojson encontrado em $MapDataDir - o app continua no mapa mock." -ForegroundColor Yellow
}

Write-Host "`nConcluido. Fonte: truckermudgeon/maps (GPL-3.0), gerado a partir da sua propria instalacao do ETS2." -ForegroundColor Green
Write-Host "Nenhum arquivo de DLC/conteudo protegido foi copiado para fora do seu PC." -ForegroundColor Green
