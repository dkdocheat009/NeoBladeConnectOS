# Auditoria Fase 9 — Figma CarPlay Design System vs. NeoBladeConnectOS

## Acesso ao Figma (registro honesto)

O link fornecido (`https://www.figma.com/design/5YnAt2GoVDqhC3X5cvrZW7/...?m=dev`) foi
aberto no navegador interno desta sessão. A página carregou (207 requisições de
`webpack-artifacts`, sem erro de rede), mas o canvas do Figma é renderizado
inteiramente em `<canvas>`/WebGL, sem conteúdo exposto à árvore de
acessibilidade nem a capturas de tela utilizáveis neste ambiente (a captura
ficou em branco mesmo após múltiplas esperas). Não há um MCP do Figma
disponível nesta sessão. **Portanto nenhuma cor, medida, asset ou variante foi
extraída ao vivo do arquivo Figma** — nada aqui alega ter sido "visto" no
arquivo além dos nomes de frame/nó já listados textualmente na própria tarefa
(`33:2375` Home, `33:2393` Vehicle Settings, `33:2440` Climate Settings,
`4:229` Components, `21:2203` Settings-list, `21:2131` Toggle, `21:2004`
Snackbar, `33:3149` Pagination, `21:1103`/`28:1568` Home-icons, etc.).

Em vez disso, esta fase usou como referência visual real:

- As capturas locais do projeto (`imagens/*.png`, `imagens/de/*`,
  `imagens/en/*`) — como em todas as fases anteriores.
- `imagens/de/apple-dark.png`: uma captura real de CarPlay (Apple Maps)
  mostrando a bandeja lateral com ícones reais e um cartão de instrução de
  navegação — usada para confirmar que a bandeja lateral (dock) é, na
  própria Apple, uma cápsula escura translúcida *fixa*, independente do
  conteúdo por trás (ver decisão sobre o Dock abaixo).
- `imagens/de/voice.png`: captura real do Siri em CarPlay — usada para
  redesenhar o cartão do Assistente de Voz (pílula compacta no canto
  inferior esquerdo, não um cartão largo centralizado) e confirmar que o
  brilho de borda cobre o contorno inteiro do stage.
- A documentação pública da Apple (HIG CarPlay, Liquid Glass) e o
  vocabulário do iOS 27 já em uso desde a Fase 7 (`src/styles/ios-tokens.css`,
  `src/components/ios/`), para os componentes de lista/Ajustes.

## Tabela de auditoria (tela → referência → divergência → mudança → prioridade → teste)

| Tela | Referência usada | Divergência encontrada | Mudança aplicada na Fase 9 | Prioridade | Teste |
|---|---|---|---|---|---|
| Home/Dock | `home.png`, `apple-dark.png` | Tema Claro não existia (toda a Home ficava escura); reorganização de ícones saltava sem animação; sem roda do mouse | Wallpaper com paleta própria clara/escura (`--wallpaper-*`); `AppGrid` anima `left/top` ao reorganizar; `MainCarousel` aceita `onWheel` (deltaX/Shift+roda) | Alta | `test-fase9.mjs` (cartões de tema, roda do mouse) |
| Stage (todas as telas) | — | `Stage.tsx` já tinha um comentário alegando "scaled uniformly to fit the real viewport", mas o CSS só centralizava a tela em 1280×720 fixos — em qualquer display maior/menor sobrava borda preta sem escalar | `Stage.tsx` agora mede o contêiner com `ResizeObserver` e aplica `transform: scale()` de verdade (`min(largura/1280, altura/720)`), preenchendo proporcionalmente qualquer display 16:9 maior ou menor, sem redesenhar como site responsivo | Alta | checagem manual em 1920×1080 (`stage-canvas` ocupa a viewport inteira) |
| Dashboard (mapa/NavCard/MusicCard) | `dashboard-dark/light.png`, `ats-dashboard.png` | Mapa, cartão de navegação e cartão de música só tinham paleta escura fixa | Tokens `--map-*`, `--nav-card-*`, `--music-*` com par claro/escuro; SVG do mapa lê `stop-color` via `var()` | Alta | `test-fase9.mjs` (checa `background-image` do painel) |
| Ajustes | `21:2203` (Settings-list, textual), HIG Apple Ajustes | Lista de tema era só texto "Claro/Escuro/Automático"; faltavam Sistema e Integrações como categorias próprias; Siri/Voz sem controles reais | Cartões de prévia visual do tema; seção Sistema (relógio 12h/24h real); Integrações promovida; sliders reais de velocidade/brilho/duração do Assistente; lista "Vozes" honesta | Alta (prioridade explícita da tarefa) | `test-fase9.mjs` |
| Assistente de Voz (Siri) | `voice.png` | Cartão era um toast largo centralizado, não a pílula compacta da referência | Cartão reduzido a uma pílula no canto inferior esquerdo (orb + 2 linhas), brilho com intensidade configurável | Alta | `test-fase9.mjs` (posição/largura do cartão) |
| Música | `music.png` | "Letra"/"Fila" só mostravavam um aviso (Fase 8); não havia navegação real para uma lista | "Fila" abre uma lista real da playlist de demonstração e troca de faixa ao clicar; "Letra" mostra um estado vazio honesto (sem letra licenciada) | Média | `test-fase9.mjs` |
| Rádio, Veículo, Trabalho, Clima, Esportes, Radar, Chamadas | `radio.png`, `fahrzeug.png`/`truck.png`, `job.png`, `wetter.png`, `sport.png`, `blitzer.png`, `call.png` | Todas ficavam escuras mesmo no tema Claro; Clima não tinha NENHUM fundo próprio (herdava o preto do stage) | Migradas para tokens de tema (`--panel-*`, `--radio-*`, `--carplay-*`, `--clima-*`, `--radar-*`, `--call-card-*`); Clima ganhou gradiente de céu noturno/diurno | Alta | `test-fase9.mjs` (Clima), inspeção visual `comparacoes/` |
| Esportes (detalhe) | — | O segmented control "Jogos/Tabela" ficava ilegível no tema Claro (texto quase invisível); `BackButton` cobria "Competições" (pendência da Fase 6) | `SegmentedControl` tokenizado (`--ios-fill`/`--ios-label`); `esportes-screen__sidebar` com `top: 70px` | Alta | `test-fase9.mjs` (conta os 2 tabs) |
| Navegação | `navi-dunkel.png`/`navi-hell.png` | Já tinha tema claro/escuro dedicado desde a Fase 5 — preservado sem mudança | Nenhuma (fora de escopo desta auditoria) | — | `test-fase5.mjs` |

## Tokens visuais (medidos no código existente, não "estimados" como se fossem do Figma)

- Raio do dock: `26px` (fixado na Fase 4, ver `Dock.css`).
- Tipografia iOS: `11–30px` conforme `ios-tokens.css` (`.ios-caption-strong` a `.ios-large-title`), já dentro da faixa 11–34pt pedida.
- Espaçamento interno padrão das telas: `left: 143px` (margem após o dock), reutilizado por `BackButton`, `MusicScreen`, `RadioScreen`, `VoiceCard` etc.
- Cores de sistema iOS: ver `:root` em `src/styles/ios-tokens.css` (`--ios-blue` `#0a84ff`, `--ios-green` `#30d158` etc.) — mesmas em claro/escuro, como no HIG real.

## Inventário de assets

- **Reproduzíveis legalmente**: ícones de sistema em SVG próprio (Notificações, Mensagens, Calendário, Esportes, Radar), logos de marcas de caminhão (ver `docs/EXTERNAL_SOURCES_AND_LICENSES.md` e a seção já existente no README), ícone do Assistente (`SiriIconGlyph`, desenho original).
- **Requerem substituição própria**: nenhum ícone/asset proprietário da Apple foi extraído do Figma ou de capturas oficiais nesta fase — todos os ícones novos/ajustados são SVG desenhados para o projeto.
- **Dependem de marcas de terceiros**: logos de caminhão (Scania, Volvo, Mercedes-Benz, DAF, MAN, Iveco, Renault Trucks) e o ícone/paleta do Spotify — inalterados desde fases anteriores.

## Comportamentos: reais vs. mockados vs. indisponíveis

Ver `docs/FINAL_UI_REVIEW.md` para a lista completa por tela.
