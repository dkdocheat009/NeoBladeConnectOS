# Guia rápido — compilar e instalar no ETS2

## 1. Compilar

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\COMPILAR_NO_PC.ps1
```

Detecta Node, CMake, MSVC (via `vswhere`, sem presumir caminho fixo),
Windows SDK, .NET SDK e o WebView2 Runtime; mostra exatamente o que falta
e onde baixar. Compila o frontend, o plugin nativo (CMake + MSVC Release
x64) e o host (.NET self-contained), verifica os exports/arquitetura da
DLL com `dumpbin`, e monta `dist\NeoBladeConnectOS-ETS2\`.

## 2. Instalar

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INSTALAR_NO_ETS2.ps1
```

Detecta sua instalação do ETS2 via Steam (ou aceite `-GamePath "<pasta>"`
manualmente), mostra o que vai fazer, pede confirmação, faz backup de
qualquer plugin anterior com o mesmo nome e copia o novo para
`bin\win_x64\plugins`.

Depois, rode `dist\NeoBladeConnectOS-ETS2\host\NeoBladeConnectOS.Host.exe`
(uma vez, antes ou depois de abrir o jogo) e abra o ETS2.

## 3. Testar

Ver `docs/ETS2_TESTING.md` para os 7 passos, o que esperar de cada um, e
o que já foi verificado versus o que só o seu PC pode confirmar.

## 4. Diagnosticar um problema

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\DIAGNOSTICAR_ETS2.ps1
```

## 5. Desinstalar

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\DESINSTALAR_NEOBLADE.ps1
```

Remove só os arquivos que o NeoBladeConnectOS instalou e restaura o
backup do plugin anterior, se houver um.

## 6. Gerar o mapa real (opcional)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\GERAR_MAPA_ETS2.ps1 -GamePath "<pasta do ETS2>"
```

Ver `docs/ETS2_ARCHITECTURE.md`, seção 6, para o que isso já produz hoje
(mapa estático) e o que ainda falta (marcador do caminhão ao vivo).

## Limitações conhecidas desta entrega

- A substituição da textura 3D do GPS depende de duas assinaturas de
  padrão que **ainda não foram preenchidas** (ver
  `docs/ETS2_ARCHITECTURE.md`, seção 4, com o passo a passo para
  preenchê-las no seu PC com um disassembler). Sem elas, o plugin continua
  funcionando (telemetria, pipe, hook de Present) mas não altera nada na
  tela 3D do caminhão ainda.
- O marcador do caminhão no mapa real não está calibrado (mesma seção 6 do
  `ETS2_ARCHITECTURE.md`).
- Multiplayer/anticheat: esta integração foi pensada e documentada só para
  single-player; não foi testada online e não deve ser presumida compatível.
