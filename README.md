# NeoBladeConnectOS

Interface estilo Apple CarPlay, construída com React + TypeScript + Vite.

**Fase 1:** Home Screen (dock lateral, relógio/status, grade de aplicativos,
legendas, paginação, toque).

**Fase 2 (atual):** legendas da Home traduzidas para português, badges reais
(mock) em Notificações/Mensagens, calendário com data real do sistema,
seleção mock de marca do veículo, modo de edição estilo iPhone (long-press
para remover/restaurar atalhos, com persistência em `localStorage`), e uma
nova tela de **Dashboard** (estilo CarPlay escuro) acessível pelo botão
inferior do dock. Veja limitações abaixo.

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
outro terminal, e ajustar a porta no comando se necessário):

```powershell
npx playwright install chromium   # só na primeira vez
node scripts/capture.mjs http://localhost:5173/ comparacoes/home.png
node scripts/capture-dashboard.mjs http://localhost:5173/ comparacoes/dashboard.png
node scripts/test-edit-mode.mjs   # long-press, remover, restaurar, persistência
node scripts/test-mocks.mjs       # badges, troca de marca, navegação Home/Dashboard
node scripts/check-console.mjs   # garante ausência de erros de console
```

A pasta `comparacoes/` é local (ignorada pelo git).

## Estrutura

```
src/
  components/
    Stage/          # canvas fixo 1280x720
    Shell/          # papel de parede + dock fixos + navegação Home/Dashboard
    HomeScreen/      # grade de apps, paginação, modo de edição
    Dashboard/       # tela de Dashboard (mapa demo, nav card, player mock)
    Wallpaper/       # papel de parede (SVG, aproximação do original)
    Dock/            # dock lateral (status, atalhos, botão home/grid)
    StatusBar/       # relógio, sinal e bateria
    AppGrid/         # grade de aplicativos
    AppIcon/         # ícone + legenda + badge + jiggle/remover (edição)
    Badge/           # badge real independente (contagem mock)
    EditModeBar/     # barra "Restaurar / Concluir" do modo de edição
    Pagination/      # indicador de páginas (Home)
  data/
    apps.ts          # lista de apps da Home (id, label, ícone)
    truckBrands.ts   # marcas de caminhão (mock) + logos disponíveis
  hooks/
    useLongPress.ts      # detecta pressionar-e-segurar sem quebrar o clique curto
    useRemovedApps.ts    # persistência dos atalhos removidos (localStorage)
    useHomeMockState.ts  # estado mock (badges, marca do veículo)
  assets/icons/      # recortes/ativos locais usados pelos ícones
```

## Fidelidade visual e limitações conhecidas

- Dock, grade de ícones, legendas, paginação, status bar e o layout do
  Dashboard (painel de mapa + cartões) foram medidos pixel a pixel a partir
  das referências locais (`home.png` e `dashboard-dunkel.png`, 1280×720).
- Os ícones de aplicativo e o logo Scania são recortes da própria captura de
  referência, com máscara de cantos arredondados.
- **Papel de parede**: aproximação em SVG ajustada a partir de amostras de
  brilho da imagem original — não é um recorte da captura nem pixel-idêntico
  às curvas originais, apenas visualmente próximo.
- **Mapa do Dashboard**: ilustração SVG de demonstração (terrenos, rota,
  marcador) inspirada na composição da referência — não há integração real
  de mapa/GPS. Sinal, velocidade, ETA, instrução de navegação e player de
  música usam dados mock fixos/cíclicos, coerentes com os elementos
  visíveis na referência.
- **Marca do veículo**: apenas a Scania tem logo real (recorte da
  referência local). Volvo, Mercedes-Benz, DAF, MAN, Iveco e Renault não
  têm asset de logo correto disponível localmente — a tarefa pede
  explicitamente para não inventar uma logo nesses casos, então essas
  marcas usam um selo neutro (silhueta genérica + inicial). **Pendência:**
  obter os logos oficiais com licença adequada para essas marcas.
  Clicar no atalho "Veículo" cicla entre as marcas (mock, estado local).
- Badges de Notificações/Mensagens são mock: clicar no ícone cicla a
  contagem (0, 1, 2, 5) para fins de demonstração/teste.
- Relógio e calendário usam data/hora real do sistema (sem backend); sinal
  5G e bateria continuam sendo indicadores estáticos (sem telemetria).
- Modo de edição: toque curto continua abrindo os mocks normalmente; apenas
  pressionar e segurar (~600 ms) ativa a edição. A remoção de atalhos
  persiste em `localStorage`; a restauração (individual ou "restaurar
  todos") não usa nenhuma tela/loja de apps adicional.
- Nenhum aplicativo além de Home e Dashboard foi implementado: os demais
  ícones continuam apenas dando feedback de toque e registrando um log.

## Tecnologias

- React 19 + TypeScript + Vite
- CSS puro (sem frameworks de UI)
- [Motion](https://motion.dev) para as transições de toque e entre telas
- Playwright (apenas para captura/comparação visual e testes de interação
  em desenvolvimento — não é dependência de produção)
