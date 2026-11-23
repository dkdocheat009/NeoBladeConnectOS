# NeoBladeConnectOS

Interface estilo Apple CarPlay, construída com React + TypeScript + Vite.

**Fase 1:** Home Screen (dock lateral, relógio/status, grade de aplicativos,
legendas, paginação, toque).

**Fase 2:** legendas da Home traduzidas para português, badges reais (mock)
em Notificações/Mensagens, calendário com data real do sistema, seleção mock
de marca do veículo, modo de edição estilo iPhone (long-press para
remover/restaurar atalhos, com persistência em `localStorage`), e a tela de
**Dashboard** (estilo CarPlay escuro).

**Fase 3 (atual):** correção dos 3 defeitos visíveis da Fase 2 (ícones de
Notificações/Mensagens reconstruídos em SVG sem o retângulo branco; as 7
marcas de veículo agora têm logo real; alinhamento do `StatusBar` corrigido
de forma estrutural) + novas telas **Música** e **Rádio**, com navegação
completa Home ↔ Dashboard ↔ Música/Rádio. Veja limitações abaixo.

## Como executar

```powershell
npm install
npm run dev
```

Abra a URL impressa pelo Vite (porta `5173` ou a próxima livre) com a
janela/viewport em **1280×720** para comparação fiel com a referência.

## Build de produção

```powershell
npm run build
npm run preview
```

## Comparação visual e testes de interação

Scripts auxiliares em `scripts/` usam Playwright para renderizar as telas em
1280×720 e exercitar as interações mock (requer `npm run dev` rodando em
outro terminal, ajustando a porta no comando se necessário):

```powershell
npx playwright install chromium   # só na primeira vez
node scripts/capture.mjs http://localhost:5173/ comparacoes/home.png
node scripts/capture-dashboard.mjs http://localhost:5173/ comparacoes/dashboard.png
node scripts/capture-music-radio.mjs http://localhost:5173/   # salva music_screen.png e radio_screen.png
node scripts/test-edit-mode.mjs     # long-press, remover, restaurar, persistência
node scripts/test-mocks.mjs         # badges, troca de marca
node scripts/test-brands.mjs        # cicla e captura as 7 marcas de veículo
node scripts/test-music-radio.mjs   # navegação Home/Dashboard/Música/Rádio
node scripts/check-console.mjs      # garante ausência de erros de console
```

**Para testar a troca de marca do veículo manualmente:** clique no ícone
"Veículo" na Home repetidamente — ele cicla, em ordem, por Scania → Volvo →
Mercedes-Benz → DAF → MAN → Iveco → Renault Trucks → (volta a Scania). Não
há painel de seleção separado nem tela extra: é só esse ciclo no próprio
atalho, como pedido na tarefa.

A pasta `comparacoes/` é local (ignorada pelo git).

## Estrutura

```
src/
  components/
    Stage/          # canvas fixo 1280x720
    Shell/          # papel de parede + dock fixos + navegação entre todas as telas
    HomeScreen/      # grade de apps, paginação, modo de edição
    Dashboard/       # tela de Dashboard (mapa demo, nav card, player mock)
    Music/           # tela Música em tela cheia (estado compartilhado com o card do Dashboard)
    Radio/           # tela Rádio (categorias, lista de estações, volume — tudo mock)
    BackButton/      # botão de voltar compartilhado (Música/Rádio)
    Wallpaper/       # papel de parede (SVG, aproximação do original)
    Dock/            # dock lateral (status, atalhos, botão home/grid)
    StatusBar/       # relógio, sinal e bateria (layout em grid, alinhamento estrutural)
    AppGrid/         # grade de aplicativos
    AppIcon/         # ícone + legenda + badge + jiggle/remover (edição)
      NotificationGlyph.tsx / MessageGlyph.tsx  # ícones reconstruídos em SVG (sem asset com badge embutido)
      CalendarGlyph.tsx         # ícone de calendário com data real
      BrandLogoGlyph.tsx / VehicleFallbackGlyph.tsx  # logo da marca atual / selo neutro (marca desconhecida)
    Badge/           # badge real independente (contagem mock)
    EditModeBar/     # barra "Restaurar / Concluir" do modo de edição
    Pagination/      # indicador de páginas (Home)
  data/
    apps.ts            # lista de apps da Home (id, label, ícone)
    truckBrands.ts      # as 7 marcas de veículo + logo de cada uma
    radioStations.ts    # categorias e estações mock do Rádio
  hooks/
    useLongPress.ts        # detecta pressionar-e-segurar sem quebrar o clique curto
    useRemovedApps.ts      # persistência dos atalhos removidos (localStorage)
    useHomeMockState.ts    # estado mock (badges, marca do veículo) + abrir Música/Rádio
    useMusicPlayerState.ts # estado do player compartilhado entre Dashboard e tela Música
  assets/
    icons/    # recortes/ativos locais usados pelos ícones (apps, Scania, arte do álbum)
    brands/   # logos de Volvo, Mercedes-Benz, DAF, MAN, Iveco, Renault Trucks (ver origem abaixo)
```

## Origem dos logos de marca (Veículo)

Todas as 7 marcas têm logo real — nenhuma usa letra/emoji como substituto:

| Marca | Fonte do arquivo | Licença |
|---|---|---|
| Scania | Recorte de `home.png` (referência local do projeto) | — (ver nota abaixo) |
| Volvo | commons.wikimedia.org/wiki/File:Volvo-Iron-Mark-Black.svg | {{PD-textlogo}} (geometria simples, sem direito autoral próprio) |
| Mercedes-Benz | commons.wikimedia.org/wiki/File:Mercedes-Benz_Star_2022.svg | {{PD-textlogo}} |
| DAF | commons.wikimedia.org/wiki/File:DAF_logo.svg | {{PD-textlogo}} (fonte: site oficial da DAF) |
| MAN | commons.wikimedia.org/wiki/File:MAN_Truck_%26_Bus_-_Logo.svg | {{PD-textlogo}} / CC BY-SA 4.0 |
| Iveco | commons.wikimedia.org/wiki/File:Iveco_Logo_2023.svg | {{PD-textlogo}} (fonte: ivecogroup.com) |
| Renault Trucks | commons.wikimedia.org/wiki/File:Renault_Trucks_logo.svg | {{PD-textlogo}} (fonte: renault-trucks.de) |

Os 6 arquivos do Wikimedia Commons estão marcados `{{PD-textlogo}}`: são
simples demais (texto/geometria básica) para gerar direito autoral próprio,
mas continuam sendo **marcas registradas** dos respectivos fabricantes — a
licença de copyright não remove a proteção de marca. Eles são usados aqui
apenas para **identificação visual** do veículo selecionado em um projeto
pessoal, não comercial (uso nominativo), nunca para sugerir endosso das
fabricantes. O logo da Scania é um recorte da captura de referência que já
fazia parte do projeto desde a Fase 1 (não foi baixado da internet); o
mesmo raciocínio de uso nominativo se aplica a ele. Nenhum logo foi
inventado — onde um logo verificável não existisse, a marca usaria o selo
neutro de `VehicleFallbackGlyph` (silhueta + inicial), mas isso não foi
necessário: as 7 marcas pedidas têm logo real.

## Fidelidade visual e limitações conhecidas

- Dock, grade de ícones, legendas, paginação, status bar e o layout do
  Dashboard, Música e Rádio foram posicionados a partir das referências
  locais (`home.png`, `dashboard-dunkel.png`, `de/music.png`, `de/radio.png`,
  1280×720), mas Música e Rádio não passaram por medição pixel a pixel tão
  exaustiva quanto a Home/Dashboard — proporções e posições são próximas,
  não garantidamente idênticas ao pixel.
- Os ícones de aplicativo (Google Maps, Rádio, Trabalho, etc.) continuam
  sendo recortes da captura de referência local, com máscara de cantos
  arredondados. **Notificações e Mensagens foram reconstruídos do zero em
  SVG** (gradiente + símbolo vetorial) nesta fase — não são mais recortes,
  então não há mais o retângulo branco que aparecia no canto do asset
  antigo; o badge vermelho é um elemento `<Badge>` real e independente.
- **Papel de parede**: aproximação em SVG ajustada a partir de amostras de
  brilho da imagem original — não é um recorte da captura nem pixel-idêntico
  às curvas originais, apenas visualmente próximo.
- **Mapa do Dashboard**: ilustração SVG de demonstração (terrenos, rota,
  marcador) inspirada na composição da referência — não há integração real
  de mapa/GPS.
- **Música**: "Letra" e "Fila" (top-right) são botões visuais sem conteúdo
  real — ao clicar, registram um aviso no console em vez de abrir algo
  inventado. Play/pause, anterior/próxima, seek (clique na barra), shuffle e
  repeat são estados de demonstração reais (React state), compartilhados
  entre o cartão do Dashboard e a tela cheia — pausar em um reflete no
  outro. Progresso avança automaticamente enquanto "tocando" (simulado via
  `setInterval`, não é áudio real). "Adicionar à biblioteca" e o ícone de
  fila na barra inferior também só registram um log.
- **Rádio**: estações, categorias e logos de estação são 100% fictícios
  (ex.: "Radio Eins", "Kiesel FM") — a tarefa pede explicitamente para não
  integrar emissoras reais. Trocar de categoria muda a lista; selecionar uma
  estação atualiza a área principal e começa a "tocar" (mock); anterior/
  próxima navegam dentro da categoria atual; volume (+/-) e a categoria
  "Minhas" (lista vazia, estado vazio tratado) funcionam sobre estado local.
  Nenhum áudio real é reproduzido.
- **Marca do veículo**: as 7 marcas pedidas (Scania, Volvo, Mercedes-Benz,
  DAF, MAN, Iveco, Renault Trucks) têm logo real — ver tabela acima para a
  origem de cada arquivo. O tipo `TruckBrand` tem um ponto de extensão
  comentado para campos de telemetria futura (não implementados).
- Badges de Notificações/Mensagens são mock: clicar no ícone cicla a
  contagem (0, 1, 2, 5) para fins de demonstração/teste; 0 = badge oculto,
  1–99 = número, acima de 99 = "99+".
- Relógio e calendário usam data/hora real do sistema (sem backend); sinal
  5G e bateria continuam sendo indicadores estáticos (sem telemetria).
- Modo de edição: toque curto continua abrindo os apps/mocks normalmente;
  apenas pressionar e segurar (~600 ms) ativa a edição (jiggle + botão "−").
  A remoção de atalhos persiste em `localStorage`; a restauração (individual
  ou "restaurar todos") não usa nenhuma tela/loja de apps adicional.
- Navegação: o botão inferior do dock volta direto para a Home a partir de
  Música/Rádio, alterna Home↔Dashboard nas outras telas; o botão "←" de
  Música/Rádio volta para a tela principal de onde o usuário veio (Home ou
  Dashboard).
- Nenhum aplicativo além de Home, Dashboard, Música e Rádio foi
  implementado: os demais ícones continuam apenas dando feedback de toque e
  registrando um log.

## Tecnologias

- React 19 + TypeScript + Vite
- CSS puro (sem frameworks de UI)
- [Motion](https://motion.dev) para as transições de toque e entre telas
- Playwright (apenas para captura/comparação visual e testes de interação
  em desenvolvimento — não é dependência de produção)
