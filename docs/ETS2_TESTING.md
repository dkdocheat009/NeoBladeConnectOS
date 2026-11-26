# Testes — Fase 10 (ETS2 nativo)

Sete passos cumulativos, na ordem do mais seguro (não mexe no jogo) para o
mais arriscado (dentro do próprio ETS2). Pare em qualquer passo que falhar
e rode `DIAGNOSTICAR_ETS2.ps1` antes de tentar o próximo — ele aponta a
causa provável.

Todo passo marcado **[SEU PC]** só pode ser executado e confirmado por
você — nenhuma IA/sessão remota pode validar isso sem o ETS2 instalado de
verdade. Os marcados **[JÁ VERIFICADO]** foram confirmados nesta sessão de
desenvolvimento (ver `docs/ETS2_ARCHITECTURE.md`, seção 2).

## 1. Build e autochecagem (exports da DLL e do host)

**[JÁ VERIFICADO]** nesta sessão (native + host; frontend testado em
separado com `npm run build`). Para repetir no seu PC:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\COMPILAR_NO_PC.ps1
```

**Resultado esperado**: termina sem erro, imprime a tabela de arquivos em
`dist\NeoBladeConnectOS-ETS2\` (plugin\\\*.dll, host\\\*.exe, web\\\*),
e a seção de exports/arquitetura mostra "OK: Exports e arquitetura (x64)
verificados com dumpbin."

## 2. Host sem o jogo (mostra o bundle, fornece frames)

**[SEU PC]**

```powershell
.\dist\NeoBladeConnectOS-ETS2\host\NeoBladeConnectOS.Host.exe
```

**Resultado esperado**: nenhuma janela visível no seu desktop (a janela
fica fora da tela de propósito). Confira em
`%LOCALAPPDATA%\NeoBladeConnectOS\logs\neoblade_host_webview2.log` uma
linha "WebView2 inicializado e navegando para o bundle local." Para
confirmar visualmente que o conteúdo carregou, edite temporariamente
`MainForm.cs` trocando `OffscreenLocation` por `new Point(100, 100)` e
rode de novo — deve aparecer a Home do NeoBladeConnectOS normalmente (esse
passo manual de depuração não faz parte do fluxo final; reverta depois).

## 3. Canal local + telemetria (mock primeiro, depois jogo real)

**[SEU PC]**

Sem o jogo: o host conecta ao pipe e falha silenciosamente (não há servidor
ainda) — confira `neoblade_host_net.log` mostrando tentativas de conexão
repetidas sem erro fatal.

Com o jogo aberto e o plugin instalado (ver passo 4):
`neoblade_sdk.log` deve conter "telemetria inicializada; N canais
registrados" com N > 0, e `neoblade_host_net.log` deve conter "conectado
ao plugin." Abra o Veículo no app (dentro do host, ou no navegador comum
apontando para `http://127.0.0.1:<porta>` enquanto o jogo roda) e confira o
selo "ETS2 ao vivo" no painel de Visão Geral.

## 4. Teste gráfico no GPS (diagnóstico, depois HTML real)

**[SEU PC]** — este é o passo que depende das assinaturas de padrão (ver
`docs/ETS2_ARCHITECTURE.md`, seção 4). **Nesta entrega, as assinaturas
estão vazias de propósito**, então o resultado esperado HOJE é:

```
neoblade_render.log deve conter:
  "D3D11Hook: IDXGISwapChain::Present hookado com sucesso (modo diagnostico ativo)."
  "D3D11Hook: assinaturas de substituicao da textura do GPS ainda nao foram preenchidas..."
```

Isso prova que o hook de Present está vivo (seguro, genérico, não
depende da versão do jogo) mas a textura do GPS em si **ainda não muda** —
não espere ver nada diferente na tela do GPS até preencher as assinaturas
seguindo o guia da seção 4 do `ETS2_ARCHITECTURE.md`. Depois de preenchidas
e recompiladas, o resultado esperado passa a ser o quadro "NeoBlade — DX11
OK" aparecendo literalmente na textura da tela de GPS dentro da cabine.

## 5. Interação (abrir apps, tema, Home, Navegação, soltar foco)

**[SEU PC]**

1. No jogo, pressione `Ctrl+Alt+I`.
2. **Resultado esperado**: `neoblade_input.log` registra "modo de interacao
   agora ATIVO"; a janela do host (antes fora da tela) aparece centralizada
   no seu monitor principal, por cima de tudo.
3. Clique/arraste normalmente dentro dela — Home, Dashboard, Ajustes, Siri
   (`Ctrl+Alt+V`, já existente) devem funcionar exatamente como no
   navegador comum.
4. Pressione `Escape`. **Resultado esperado**: a janela volta para fora da
   tela; teclas/mouse voltam a controlar o caminhão normalmente (buzina,
   câmera etc. não devem ter sido afetadas enquanto a interação estava
   ativa).

## 6. Mapa real (posição/orientação, ambos os painéis)

**[SEU PC]** — depende de `tools\GERAR_MAPA_ETS2.ps1` ter rodado com
sucesso contra a sua instalação:

```powershell
.\tools\GERAR_MAPA_ETS2.ps1 -GamePath "C:\...\steamapps\common\Euro Truck Simulator 2"
```

**Resultado esperado desta fase**: `src\integrations\ets2\map-data\*.geojson`
aparece, e `RealMapPanel` (hoje **não conectado** ao Dashboard/Navegação —
ver `ETS2_ARCHITECTURE.md` seção 6) renderia as estradas se fosse montado
em uma tela de teste. **Não espere** um marcador do caminhão se movendo —
isso é um próximo passo explicitamente não resolvido nesta entrega.

## 7. Retomada (alt-tab, recarregar caminhão, trocar câmera, reiniciar host, sair do jogo)

**[SEU PC]**

- Alt-tab para fora do jogo e volte: `neoblade_sdk.log`/`neoblade_render.log`
  não devem ter nenhuma linha de erro/exceção nesse intervalo.
- Recarregue o caminhão (F7 no ETS2 ou similar): `truck.valid` deve voltar
  a `false` brevemente (evento `paused`) e depois `true` de novo (`started`).
- Feche o host (`NeoBladeConnectOS.Host.exe`) com o jogo ainda aberto: o
  jogo não deve travar nem fechar; `neoblade_net.log` do lado do plugin
  deve mostrar "host desconectado; aguardando reconexao."
- Feche o ETS2 normalmente: `neoblade_sdk.log` deve terminar com
  "scs_telemetry_shutdown recebido; desligando."

## Relatório para enviar de volta

Depois de rodar os passos que puder, rode:

```powershell
.\DIAGNOSTICAR_ETS2.ps1
```

e envie o arquivo `%LOCALAPPDATA%\NeoBladeConnectOS\diagnostico_*.txt`
mais recente — ele já reúne o essencial de cada passo acima em um único
lugar, sem dados sensíveis (sem transcrições de voz, tokens, ou qualquer
captura pessoal).
