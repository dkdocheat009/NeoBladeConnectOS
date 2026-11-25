# Revisão final de UI — Fase 9

Checklist por tela: o que é real, o que é demonstração (mock) e o que
depende de integração externa indisponível. Nenhuma tela aqui é alegada como
"100% idêntica" a uma referência oficial da Apple — ver limitações no final.

## Por tela

| Tela | Real | Demo/mock | Depende de integração externa |
|---|---|---|---|
| Home | Swipe/arraste, paginação por clique/teclado/roda do mouse, long-press/jiggle, remover/restaurar atalho (persistido), tema Claro/Escuro/Automático | Badge de apps = contagem local | — |
| Dashboard | NavCard sincronizado com Navegação, player de música real (estado compartilhado) | Rota/mapa são demonstrativos (sem GPS/TruckSimMap) | — |
| Ajustes | Todas as 11 seções com efeito real e persistido (tema, áudio, Siri/voz, acessibilidade, privacidade, sistema, integrações) | — | football-data.org (ver Esportes) |
| Música | Play/pause/seek/shuffle/repeat, "Fila" troca de faixa de verdade | Playlist de demonstração (3 faixas fictícias); "Letra" honestamente vazia (sem conteúdo licenciado) | — |
| Rádio | Troca de estação/categoria, volume | Estações 100% fictícias, sem fluxo de áudio real | — |
| Veículo / Trabalho | Navegação por abas, troca de marca, estados de progresso | Todos os valores são mock (sem leitura de ECU/ETS2) | — |
| Clima | Seleção de hora/dia, detalhe | Dados 100% fictícios, sem API/localização real | — |
| Esportes | Brasileirão/Champions com placares e tabela reais quando configurado | — | football-data.org (precisa de `FOOTBALL_DATA_API_KEY`; sem chave mostra estado honesto "Conecte a fonte de resultados") |
| Mensagens / Notificações / Calendário | Listas, leitura por voz, ditado, banners, badges reais | Conteúdo inicial de exemplo | — |
| Navegação / Radar | Navegação entre visões, troca de tema interna, alerta de radar | Rota/mapa/velocidade são mock (sem GPS/TruckSimMap) | — |
| Chamadas | Atender/recusar/mudo com cartão flutuante | Nome/número 100% fictícios, sem telefonia real | — |
| Abastecer e Descansar / Diário de Bordo | Busca, filtro, favoritos, detalhe | Dados de exemplo locais | — |
| Assistente de Voz (Siri) | Atalho `Ctrl+Alt+V`/Escape, reconhecimento e fala reais (navegador), cartão compacto com transcrição ao vivo, controles de velocidade/brilho/duração reais | Conjunto fixo e pequeno de comandos; qualquer outro pedido recebe resposta honesta de "não disponível" | Reconhecimento/síntese dependem do suporte do navegador (Chrome/Edge); vozes locais (sherpa-onnx/Piper/whisper.cpp) e nuvem (Azure) aparecem corretamente como "Não instalado" — ver `docs/EXTERNAL_SOURCES_AND_LICENSES.md` |

## Light/Dark/Automático

Demonstrado e testado (`scripts/test-fase9.mjs`, mais inspeção visual em
`comparacoes/`, ignorado pelo Git) em: Home, Dock, Dashboard (mapa, NavCard,
MusicCard), Ajustes, Música, Rádio, Veículo, Trabalho, Clima, Esportes,
Mensagens, Notificações, Calendário, Diário de Bordo, Paradas, Siri. O modo
Automático reage a `prefers-color-scheme` ao vivo (testado via
`page.emulateMedia` nas fases anteriores e por inspeção manual nesta).
Navegação mantém seu próprio alternador claro/escuro dedicado (referências
`navi-dunkel.png`/`navi-hell.png`), sincronizado com a preferência global
como valor inicial.

**Exceção deliberada, documentada na própria tela de Ajustes**: a bandeja
lateral (dock) e o papel de parede da Home mantêm uma composição fixa
(a bandeja é sempre um material escuro translúcido, como na referência real
`imagens/de/apple-dark.png`); cores de marca (Spotify, logos de caminhão,
escudos de clube, mapa/rota) são preservadas em qualquer tema.

## Testes executados

- `npm run build` — sem erros.
- `npm run lint` — 0 avisos, 0 erros (`oxlint`).
- Suíte completa de regressão (`scripts/test-fase5.mjs` … `test-fase8.mjs`,
  `test-mocks.mjs`, `test-brands.mjs`, `test-fase4-apps.mjs`,
  `check-console.mjs`, `test-edit-mode.mjs`, `check-statusbar.mjs`,
  `check-dock-statusbar.mjs`) — todas passam sem regressão nova.
- `scripts/test-fase9.mjs` (novo) — cartões de prévia de tema, fundo próprio
  do Veículo/Clima no tema Claro, seções Sistema/Integrações, relógio
  12h/24h real, controles do Assistente, lista de Vozes honesta, cartão do
  Assistente compacto/ancorado ao dock, roda do mouse horizontal na Home,
  "Fila" trocando de faixa de verdade, segmented control do Esportes
  legível.
- Uma checagem rápida de escala proporcional em viewport alternativa
  (1920×1080), sem reconstruir layouts de celular — conforme pedido.

## Status do GitHub

Ver o commit desta fase (SHA e branch) na mensagem de commit — `main` de
`https://github.com/dkdocheat009/NeoBladeConnectOS`.

## Diferenças/pendências remanescentes (sem promessa falsa)

1. **Figma não inspecionado ao vivo** nesta sessão (canvas não renderizável
   no ambiente de automação disponível) — ver `docs/FIGMA_CARPLAY_AUDIT.md`.
   Os ajustes visuais desta fase vieram das capturas locais reais
   (`imagens/`), não do arquivo Figma.
2. **Efeitos de Siri de terceiros não comparados ao vivo** (sem acesso de
   rede a `voiceorbs`/`ios-siri-animation`/etc. nesta sessão) — o anel/halo é
   uma implementação original inspirada em `imagens/de/voice.png`, não uma
   adaptação literal de nenhum desses repositórios.
3. **Nenhuma voz local/nuvem foi instalada** (sherpa-onnx, Piper,
   whisper.cpp, Azure) — a tela de Ajustes mostra isso honestamente; ativar
   um provedor local de verdade é trabalho futuro opcional, fora do escopo
   que um agente autônomo deveria executar sem confirmação do usuário
   (download de múltiplos GB, instalação de runtime nativo).
4. **football-data.org não testado ponta a ponta** nesta sessão (sem
   `FOOTBALL_DATA_API_KEY` configurada neste ambiente).
5. **Ícones do sistema não foram redesenhados do zero** nesta fase — os SVGs
   já existentes (Notificações, Mensagens, Calendário, Esportes, Radar,
   ícone do Assistente) foram mantidos; só os elementos com cor fixa que
   quebravam o tema Claro foram corrigidos. Uma reconstrução pixel a pixel
   de cada ícone contra o Figma não foi possível sem acesso ao arquivo.
6. **Dependências de instalação para habilitar voz natural local** (opcional,
   não necessário para compilar/rodar o projeto): ver
   `docs/EXTERNAL_SOURCES_AND_LICENSES.md` para os links e licenças de cada
   motor, caso o usuário queira instalar manualmente no futuro.

Nenhuma alegação de "100% idêntico ao iOS 27/CarPlay oficial" é feita em
nenhum momento deste documento ou do README.
