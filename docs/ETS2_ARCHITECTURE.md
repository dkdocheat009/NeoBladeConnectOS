# Arquitetura Fase 10 — Integração nativa ETS2 (GPS 3D, telemetria, mapa real)

Este documento registra o que foi efetivamente pesquisado, o que foi
**compilado e verificado nesta própria sessão** (não "deveria compilar" —
foi testado neste ambiente, que por acaso tinha Visual Studio, CMake e .NET
SDK instalados), e o que depende do PC/jogo do usuário para ser validado.

## 1. Pesquisa dos repositórios de referência (o que foi lido, não copiado)

| Repositório | O que foi lido | Licença | Decisão |
|---|---|---|---|
| [Baldywaldy09/PrismTextureStreamer](https://github.com/Baldywaldy09/PrismTextureStreamer) | README completo (técnica, não o `.cpp`): hook em `memserver_texture_queue_processor` para redirecionar o `.tobj` da GPS; hook em `ID3D11Device::CreateTexture2D` com fingerprint por dimensão, reescrevendo o `D3D11_TEXTURE2D_DESC` para `DYNAMIC`/`CPU_ACCESS_WRITE`; captura de janela via `PrintWindow`+`GetDIBits`; patch de um salto condicional (`JE`→`JMP`) para forçar o render da tela. | **Sem arquivo de licença no repositório** (confirmado: a árvore de arquivos só tem README/.sln/Include/Lib/código-fonte, sem `LICENSE`). | **Não copiado.** Usado só como referência conceitual da técnica — `native/NeoBladeETS2/src/render/d3d11_hook.cpp` e `gps_signatures.hpp` são implementação original, com as assinaturas de padrão **deliberadamente vazias** (ver seção 4). |
| [foodmaher/PrismMedia](https://github.com/foodmaher/PrismMedia) | Citado na tarefa; não foi possível abrir/ler o repositório nesta sessão (sem resultado acessível). | — | Não usado como base de código; qualquer técnica de tratamento de tela preta/reinicialização citada na tarefa foi implementada de forma independente nos comentários de `d3d11_hook.cpp`/`FrameCapture.cs`. |
| [timurmert/ets2-cabinplay](https://github.com/timurmert/ets2-cabinplay) | README completo: CabinPlay **não** reaproveita a tela de GPS existente dos caminhões — distribui seu próprio acessório 3D (`cabinplay.scs`, instalado como mod e encaixado no caminhão via oficina, nos slots de para-brisa), com plugin (`plugin/cabinplay.dll`) + app companion (`app/CabinPlay.exe`) + atalhos `Ctrl+Alt+<tecla>` que nunca chegam ao jogo. Licença GPL-3.0 (ver `LICENSE` do repo). | GPL-3.0 | **Não copiado** (GPL exigiria distribuir o derivado sob GPL, e o restante deste projeto não é GPL). A ideia arquitetural de "plugin fino + app companion separado, atalhos Ctrl+Alt+X que nunca vazam pro jogo" **foi reaproveitada como padrão de design**, implementada de forma original em `native/NeoBladeETS2` + `host/NeoBladeHost`. Construir um acessório 3D próprio (modelo+UV+.pmg via SCS Blender Tools) ficou **fora do escopo desta sessão** — é um pipeline de arte 3D separado, não uma tarefa de código; ver seção 4 para a alternativa escolhida (reaproveitar a tela de GPS existente). |
| [Ku3rb1s/CabPlay](https://github.com/Ku3rb1s/CabPlay) | Citado na tarefa; não foi possível abrir/ler o repositório nesta sessão. | — | Idem PrismMedia — não usado como base de código. |
| [truckermudgeon/scs-sdk-plugin](https://github.com/truckermudgeon/scs-sdk-plugin) | README completo + **os headers reais** (`scssdk.h`, `scssdk_telemetry.h`, `scssdk_telemetry_event.h`, `scssdk_telemetry_channel.h`, `scssdk_value.h`, `common/scssdk_telemetry_truck_common_channels.h`) foram lidos na íntegra para confirmar assinaturas exatas de função e nomes de canal antes de escrever `telemetry.cpp`. | MIT (confirmado lendo `LICENSE` no GitHub) para o wrapper; o SDK em si (`scs_sdk/`) tem seu próprio `sdk_license.txt` da SCS Software, redistribuído dentro do mesmo repositório. | **Usado via CMake `FetchContent`** (baixado pelo CMake no PC do usuário, não copiado à mão para este repositório) — ver `native/NeoBladeETS2/CMakeLists.txt`. |
| [jvanstraten/TruckTel](https://github.com/jvanstraten/TruckTel) | Citado na tarefa; não aberto nesta sessão (scs-sdk-plugin já deu a base de telemetria necessária). | — | Não usado. |
| [truckermudgeon/maps](https://github.com/truckermudgeon/maps) (TruckSim Maps) | README completo: pipeline `parser` (CLI + addon nativo C++, lê a instalação local do jogo) → `generator` (GeoJSON/PMTiles/MapLibre) → `demo-app` (React+MapLibre). | GPL-3.0 (confirmado no README) | **Usado como ferramenta externa, não copiado para este repositório** — `tools/GERAR_MAPA_ETS2.ps1` clona o repo deles para `tools/maps-src/` (gitignorado) e roda `parser`/`generator` contra a instalação do ETS2 do próprio usuário. Nenhum arquivo/dado deles ou do jogo é copiado para dentro de `NeoBladeConnectOS`. |
| [Microsoft WebView2](https://learn.microsoft.com/en-us/microsoft-edge/webview2/) | Documentação oficial + o pacote NuGet `Microsoft.Web.WebView2` (versão real `1.0.4370.26`, confirmada na API do NuGet antes de usar — não adivinhada). | Licença Microsoft (gratuita para uso em apps) | Usado no host (`host/NeoBladeHost`) — ver seção 3. |
| [Windows Graphics Capture](https://learn.microsoft.com/en-us/windows/apps/develop/media-authoring-processing/screen-capture) | Documentação lida; API `Windows.Graphics.Capture` **não foi usada** nesta primeira versão (ver seção 3 para o porquê — `PrintWindow(..., PW_RENDERFULLCONTENT)` resolve a captura do WebView2 com uma API mais simples e sem precisar de um `GraphicsCaptureItem`/`Direct3D11CaptureFramePool` completo; `Windows.Graphics.Capture` fica documentado aqui como alternativa futura se a captura por `PrintWindow` se mostrar insuficiente em hardware real). | — | Não usado nesta versão; documentado como alternativa. |

### MinHook (biblioteca de hooking)

[TsudaKageyu/minhook](https://github.com/TsudaKageyu/minhook) — licença
BSD de 2 cláusulas (ver `LICENSE.txt` do repo). Consumido via CMake
`FetchContent` fixado no tag real `v1.3.4` (confirmado na lista de tags do
GitHub antes de usar — a primeira tentativa usando um SHA de commit
parcialmente adivinhado foi corrigida para usar o nome do branch real em
vez de completar um hash que eu só tinha visto abreviado). Usado só para o
hook de `IDXGISwapChain::Present`/`ID3D11Device::CreateTexture2D` — nunca
para mexer em código de física/controle do caminhão.

## 2. O que foi REALMENTE compilado e verificado nesta sessão

Diferente de uma entrega "confie em mim, deveria compilar", este ambiente
de execução tinha Visual Studio 2022/2026 (Community + Build Tools) com o
componente `VC.Tools.x86.x64`, Windows SDK 10.0.22621/26100, CMake 4.5 e
.NET SDK 8.0/10.0 instalados — então os três componentes foram
**efetivamente compilados aqui**, não apenas escritos:

- **Plugin nativo** (`native/NeoBladeETS2`): `cmake -B build -A x64` +
  `cmake --build build --config Release` produziu
  `NeoBladeConnectOS_ETS2.dll` com sucesso. Verificado com `dumpbin
  /exports /headers`:
  ```
  8664 machine (x64)
  ordinal hint RVA      name
        1    0 00001F20 scs_telemetry_init
        2    1 00002620 scs_telemetry_shutdown
  ```
  Exatamente os dois exports que o ETS2 procura, arquitetura x64 confirmada
  — nenhum export a mais, nenhum a menos. Dependências (`dumpbin
  /dependents`): `d3d11.dll`, `USER32.dll`, `GDI32.dll`, `KERNEL32.dll` e o
  runtime padrão do MSVC (`MSVCP140.dll`, `VCRUNTIME140*.dll`,
  `api-ms-win-crt-*.dll`) — nada incomum, o mesmo runtime que praticamente
  todo jogo/app já traz via o "Microsoft Visual C++ Redistributable"
  (quase sempre já instalado em PCs com Steam; `COMPILAR_NO_PC.ps1` não
  verifica isso à parte porque é extremamente comum já estar presente, mas
  é a primeira coisa a checar se o jogo "não carregar" o plugin).
- **Host WebView2** (`host/NeoBladeHost`): `dotnet publish -c Release -r
  win-x64 --self-contained true` produziu
  `NeoBladeConnectOS.Host.exe` (~163 MB, o runtime .NET inteiro embutido —
  o usuário não precisa instalar .NET para RODAR o host, só para
  COMPILAR). Build com 0 erros (só um aviso benigno e esperado de conflito
  de versão do `WindowsBase`, porque o pacote do WebView2 inclui DLLs WPF
  que este host não usa — não afeta o funcionamento).
- **`COMPILAR_NO_PC.ps1`**: rodado de ponta a ponta nesta sessão (native +
  host; o passo de frontend foi verificado separadamente com `npm run
  build` porque um processo `vite` desta própria sessão de trabalho
  estava com um arquivo de `node_modules` bloqueado — não é um problema do
  script, é um artefato de eu mesmo ter um dev server rodando em paralelo).
  Um bug real foi encontrado e corrigido durante este teste: a checagem de
  exports via `dumpbin` comparava um **array de linhas** com `-notmatch`
  em vez de uma string única, o que no PowerShell sempre retorna um array
  não-vazio (= verdadeiro) e faria o script falhar mesmo com uma DLL
  perfeita — corrigido unindo a saída com `-join` antes de comparar.
- **`DIAGNOSTICAR_ETS2.ps1`**: rodado nesta sessão. Esta máquina tinha uma
  instalação real do ETS2 (Steam, detectada automaticamente em
  `C:\...\steamapps\common\Euro Truck Simulator 2`) e um `game.log.txt`
  real com 623 linhas — o script leu e reportou corretamente. Um bug real
  foi encontrado e corrigido: o relatório tentava gravar em
  `%LOCALAPPDATA%\NeoBladeConnectOS\...` antes de garantir que essa pasta
  existisse.
- **`INSTALAR_NO_ETS2.ps1`**: a função de autodetecção (`Find-Ets2InstallPath`,
  lendo `libraryfolders.vdf` da Steam) foi testada separadamente, em modo
  somente-leitura, e encontrou corretamente a instalação real do ETS2 desta
  máquina. **A instalação em si (copiar a DLL para dentro da pasta do jogo)
  NÃO foi executada nesta sessão** — isso modificaria a instalação real do
  usuário, uma ação que requer a confirmação explícita dele, feita por ele
  mesmo (o script já pede essa confirmação interativamente, com `-Force`
  disponível só para quem quiser pular o prompt conscientemente).

**O que isso prova e o que não prova**: prova que o código compila de
verdade, produz os binários certos, com os exports certos, na arquitetura
certa, e que os scripts de automação rodam sem erro neste Windows. **Não
prova** que o ETS2 carrega o plugin, que a telemetria chega, que a
substituição de textura do GPS funciona, ou que o host renderiza
corretamente dentro da cabine — esses testes só acontecem com o plugin de
fato instalado e o jogo rodando, que é uma ação que só o usuário deve
decidir fazer (ver `docs/ETS2_TESTING.md`).

## 3. Arquitetura escolhida

```
ets2.exe (processo do jogo)
  └─ NeoBladeConnectOS_ETS2.dll (carregada pelo SDK de plugins da SCS)
       ├─ telemetry.cpp          — registra canais/eventos SCS, mantém TelemetrySnapshot
       ├─ ipc/control_pipe.cpp   — Named Pipe \\.\pipe\NeoBladeConnectOS_Control
       │                           (DLL = servidor; publica telemetria a 10 Hz,
       │                           recebe mensagens de controle do host)
       ├─ input/hotkey_hook.cpp  — WH_KEYBOARD_LL: Ctrl+Alt+I / Escape
       └─ render/d3d11_hook.cpp  — hook de IDXGISwapChain::Present (técnica
                                    padrão de vtable, não é reverse-engineering
                                    específico do jogo) + hook de
                                    ID3D11Device::CreateTexture2D (esse sim
                                    específico da tela de GPS — ver seção 4)
                    │
                    │ memória compartilhada "NeoBladeConnectOS_FrameBuffer"
                    │ (host escreve frames BGRA8, DLL só lê)
                    ▼
NeoBladeConnectOS.Host.exe (processo separado, fora da pasta do jogo)
  ├─ MainForm.cs       — janela WebView2 1280x720, normalmente fora da tela
  ├─ StaticFileServer  — serve dist/ (build do Vite) em http://127.0.0.1
  ├─ ControlPipeClient — cliente do pipe acima (conecta, reconecta sozinho)
  └─ FrameCapture      — PrintWindow(..., PW_RENDERFULLCONTENT) no HWND do
                          WebView2, publica na memória compartilhada
```

Por que processos separados: uma falha no WebView2/captura/pipe nunca
derruba o jogo — o pior caso é o plugin ficar sem frame novo e continuar
mostrando o último quadro (ou o padrão de diagnóstico), nunca travar
`ets2.exe`. A DLL nunca escreve em memória do jogo além dos hooks
explicitamente instalados, e cada hook tem sua própria checagem de versão/
padrão (ver seção 4).

### Por que WebView2 (não Windows Graphics Capture puro nem CEF)

- **WebView2** foi escolhido porque é a solução oficial da Microsoft para
  hospedar conteúdo web em um app Win32/.NET, já tem binding `.NET`
  maduro (NuGet oficial), e não exige instalar o Chrome — o WebView2
  Runtime já vem com o Windows 11 atualizado e é instalável separadamente
  no Windows 10 (`COMPILAR_NO_PC.ps1` confere a chave de registro dele).
- **CEF (Chromium Embedded Framework)** foi considerado e descartado por
  exigir empacotar um runtime Chromium inteiro à parte (centenas de MB
  adicionais, sem o benefício de já vir pré-instalado como o WebView2 no
  Windows moderno).
- Para capturar os pixels do WebView2, `Windows.Graphics.Capture` (a API
  mencionada na tarefa) seria o caminho "mais correto" a longo prazo, mas
  exige criar um `GraphicsCaptureItem` a partir de um `HWND`/monitor e
  rodar uma sessão de captura assíncrona completa — mais código e mais
  pontos de falha para a primeira versão. `PrintWindow` com a flag
  `PW_RENDERFULLCONTENT` (Windows 8.1+, documentada pela própria Microsoft
  como a correção para capturar conteúdo renderizado via
  DirectComposition — exatamente o caso do WebView2/Edge) é mais simples e
  foi escolhida para este primeiro corte; `Windows.Graphics.Capture` fica
  documentado aqui como o caminho a seguir se a performance/qualidade de
  `PrintWindow` não for suficiente em testes reais.

## 4. Renderização no GPS 3D — o que funciona de verdade vs. o que depende do seu PC

Esta é a parte mais honesta deste documento, porque é a mais arriscada
tecnicamente.

**O que é genérico e funciona em qualquer PC com DX11** (não depende da
versão exata do `ets2.exe`): o hook de `IDXGISwapChain::Present` via
vtable (índice 8, documentado publicamente em `<dxgi.h>`) e de
`ID3D11Device::CreateTexture2D` (índice 5, documentado em `<d3d11.h>`).
Isso é a mesma técnica usada por ferramentas como RTSS, ReShade ou o
capturador de jogos do OBS — hookar uma vtable COM pública, não é
engenharia reversa do jogo.

**O que É específico do `ets2.exe` e NÃO foi resolvido nesta sessão**: encontrar,
dentro do executável do jogo já carregado em memória, (a) a função que
decide qual `.tobj` carregar para a tela de GPS (para redirecionar para
uma textura nossa) e (b) o salto condicional que decide se a tela de GPS é
desenhada neste frame (para forçar seu render mesmo fora das condições
normais). PrismTextureStreamer descreve essa técnica em texto, mas (1) não
tem licença de reuso declarada e (2) os valores de assinatura de bytes
específicos não foram vistos nem copiados nesta sessão — e mesmo que
tivessem sido, usar os bytes exatos deles sem entender/verificar seria
exatamente o tipo de "endereço mágico" que a tarefa pede para evitar.

**Decisão**: `native/NeoBladeETS2/src/render/gps_signatures.hpp` contém a
infraestrutura completa (um `PatternScanner` genérico reutilizável, já
testado nesta sessão fazendo parte do build) mas as duas assinaturas reais
ficam **deliberadamente vazias**. `D3D11Hook::TryEnableGpsTextureSupport()`
detecta isso e desliga **só** a substituição de textura do GPS, deixando
telemetria/pipe/input funcionando normalmente — exatamente o
comportamento de "desligar só o recurso de render, preservar o jogo, log
claro" que a tarefa pede para o caso de um padrão não bater.

### Como preencher as assinaturas de verdade (próximo passo, no seu PC)

1. Instale um disassembler (ex.: [x64dbg](https://x64dbg.com/), gratuito)
   e abra o `eurotrucks2.exe` da sua instalação.
2. Procure referências à string `"/vehicle/truck/share/gps.tobj"` (ou o
   caminho real do `.tobj` usado pela tela de GPS do seu caminhão — pode
   variar por marca/mod) nas seções de dados; a partir de uma referência
   encontrada, suba para a função que a usa.
3. Anote um trecho de bytes da função (10–20 bytes) que inclua instruções
   estáveis entre patches (evite endereços relativos/imediatos — marque-os
   como `??` no padrão).
4. Preencha `TextureQueueProcessorSignature()`/`GpsScreenForceRenderJumpSignature()`
   em `gps_signatures.hpp` com esse padrão, recompile, e use
   `DIAGNOSTICAR_ETS2.ps1` + `neoblade_render.log` para confirmar se o
   scan encontrou (`"encontrado"`) ou não (`"nao encontrado"`) — o plugin
   nunca finge sucesso.
5. Esse processo precisa ser refeito a cada atualização relevante do ETS2
   que mude o código da função (o próprio PrismTextureStreamer documenta
   essa fragilidade como conhecida).

**Modo de diagnóstico** (`D3D11Hook::diagnosticMode`, ligado por padrão):
gera um frame sólido com o texto "NeoBlade — DX11 OK" e o número do frame
via GDI (`render/diagnostic_frame.cpp`) — é o teste visual pedido pela
tarefa para provar que o caminho de render está vivo, **antes** de depender
das assinaturas acima. Como as assinaturas estão vazias nesta entrega, o
quadro de diagnóstico nunca chega de fato à tela 3D do GPS ainda — ver
`docs/ETS2_TESTING.md` para o teste exato que confirma isso no seu PC.

## 5. Telemetria

Canais confirmados lendo o header real (não adivinhados):
`truck.world.placement`, `truck.speed`, `truck.engine.rpm`,
`truck.displayed.gear`, `truck.fuel.amount`, `truck.fuel.range`,
`truck.fuel.warning`, `truck.brake.parking`, `truck.brake.retarder`,
`truck.cruise_control`. Canais de desgaste/luzes/reboque/trabalho
(`truck.wear.*`, `truck.light.*`, `trailer.*`, `job.*`) são "melhor
esforço" — os nomes exatos não foram confirmados linha a linha nesta
sessão; cada um está isolado atrás de um `#ifdef`/registro que falha
graciosamente (sem crashar, só sem aquele campo) se o nome não bater com o
SDK vendido de verdade pelo CMake no seu build. Ver `telemetry.cpp` para a
lista completa e o comentário explicando essa distinção.

## 6. Mapa real (TruckSim Maps)

`tools/GERAR_MAPA_ETS2.ps1` automatiza o pipeline `parser`→`generator` do
truckermudgeon/maps contra a instalação local do ETS2 do usuário (nunca
baixa/redistribui dados de DLC). `src/integrations/ets2/map/RealMapPanel.tsx`
é um renderizador MapLibre GL real (compila e roda) que mostra a camada de
estradas gerada **quando ela existir** — mas **não** foi conectado ao
Dashboard/Navegação ainda, e **não** plota um marcador do caminhão: a
transformação exata de coordenadas mundiais do ETS2
(`truck.world.placement`, em metros) para a projeção que o `generator`
usa não foi inspecionada nesta sessão (precisaria do dado gerado + do jogo
rodando para validar o alinhamento, conforme a tarefa pede
explicitamente — "validar alinhamento com amostras de telemetria"). Marcar
isso como pronto sem essa validação seria inventar uma posição.

## 7. Segurança e licenças

- Nenhuma chave/token é logada (ver `logging.hpp`'s comentário de
  categorias — a lista de "nunca logar" inclui exatamente o que a tarefa
  pede: telemetria sensível não existe aqui, token do Esportes, áudio/
  transcrição da Siri).
- Named Pipe e memória compartilhada são locais (`\\.\pipe\...`,
  `Local\...`) — nunca expostos à rede.
- `MinHook` (BSD-2-Clause) e os headers do SCS SDK (MIT + licença própria
  da SCS para o SDK) são buscados via CMake `FetchContent` no PC do
  usuário — nenhum dos dois está vendido/copiado dentro deste repositório
  Git.
