# NeoBladeConnectOS

Interface estilo Apple CarPlay, construída com React + TypeScript + Vite.

**Fase 1 (atual):** reprodução da Home Screen (`home.png`), com dock lateral,
relógio/status, grade de aplicativos, paginação e interações básicas de
toque. Nenhum outro aplicativo foi implementado ainda — tocar em um ícone
apenas registra um aviso no console, sem abrir telas inventadas.

## Como executar

```powershell
npm install
npm run dev
```

Abra `http://localhost:5173` com a janela/viewport em **1280×720** para
comparação fiel com a referência.

## Build de produção

```powershell
npm run build
npm run preview
```

## Comparação visual com a referência

Há um script auxiliar que renderiza a Home em 1280×720 via Playwright e
salva um PNG para comparação manual com a captura original:

```powershell
npx playwright install chromium   # só na primeira vez
npm run dev                       # em outro terminal, mantenha rodando
node scripts/capture.mjs http://localhost:5173/ comparacoes/atual.png
```

A pasta `comparacoes/` é local (ignorada pelo git).

## Estrutura

```
src/
  components/
    Stage/        # canvas fixo 1280x720
    HomeScreen/    # composição da tela inicial
    Wallpaper/     # papel de parede (SVG, aproximação do original)
    Dock/          # dock lateral (status, atalhos, botão home)
    StatusBar/     # relógio, sinal e bateria
    AppGrid/       # grade de aplicativos
    AppIcon/       # ícone + legenda individual
    Pagination/    # indicador de páginas
  data/apps.ts     # lista de apps da Home (id, label, ícone)
  assets/icons/    # recortes dos ícones a partir da referência local
```

## Fidelidade visual e limitações conhecidas

- Dock, grade de ícones, legendas, paginação e status bar foram medidos
  pixel a pixel a partir da referência local (`home.png`, 1280×720) e
  posicionados com a mesma geometria.
- Os ícones de aplicativo (Google Maps, Spotify, Scania/Fahrzeug, etc.)
  são recortes da própria captura de referência, com máscara de cantos
  arredondados — não são redesenhados.
- O **papel de parede** (linhas curvas sobre azul-marinho) é uma
  aproximação em SVG ajustada a partir de amostras de brilho da imagem
  original, e não um recorte da captura — portanto não é pixel-idêntico
  às curvas originais, apenas visualmente próximo.
- Relógio é dinâmico (hora real do sistema); sinal/5G e bateria são
  indicadores estáticos, pois não há integração de telemetria nesta fase
  (fora de escopo, conforme `CLAUDE.md`).
- Nenhum aplicativo da grade foi implementado: o toque apenas dá feedback
  visual (animação de toque) e registra um log no console.

## Tecnologias

- React 19 + TypeScript + Vite
- CSS puro (sem frameworks de UI)
- [Motion](https://motion.dev) para as transições de toque
- Playwright (apenas para captura/comparação visual em desenvolvimento)
