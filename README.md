# NeoBladeConnectOS

Interface estilo Apple CarPlay, construída com React + TypeScript + Vite.

**Fase 1:** Home Screen (dock lateral, relógio/status, grade de aplicativos,
legendas, paginação, toque).

**Fase 2:** legendas da Home traduzidas para português, badges reais (mock)
em Notificações/Mensagens, calendário com data real do sistema, seleção mock
de marca do veículo, modo de edição estilo iPhone (long-press para
remover/restaurar atalhos, com persistência em `localStorage`), e a tela de
**Dashboard** (estilo CarPlay escuro).

**Fase 3:** correção dos 3 defeitos visíveis da Fase 2 (ícones de
Notificações/Mensagens reconstruídos em SVG sem o retângulo branco; as 7
marcas de veículo passam a ter logo real; alinhamento do `StatusBar`
reestruturado) + novas telas **Música** e **Rádio**.

**Fase 4:** correção definitiva do bug de alinhamento do dock (a
causa raiz era a forma do próprio dock, não só o `padding` do `StatusBar` —
ver detalhes abaixo), dock com slot contextual (mostra o app aberto, como
nas referências), e quatro novos apps completos em modo demonstração:
**Veículo**, **Trabalho**, **Clima** e **Esportes**, cada um com 4–5
visões/estados navegáveis.

**Fase 5 (atual):** segunda correção do dock (o raio já estava certo, mas o
`StatusBar` ainda não separava corretamente o alinhamento do relógio/sinal
do alinhamento — centralizado — da bateria), quatro módulos novos
(**Navegação**, **Chamadas**, **Radar** e um **Assistente de Voz** estilo
Siri funcional, com reconhecimento e síntese de fala reais), e reforma do
app **Esportes** para usar dados reais do Campeonato Brasileiro e da
Champions League via football-data.org. Veja a seção "Fase 5" abaixo para
detalhes, evidências e limitações.

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

## Configuração opcional: dados reais do Esportes (football-data.org)

O app Esportes funciona sem nenhuma configuração — sem chave, ele mostra o
estado honesto "Conecte a fonte de resultados" para Brasileirão/Champions
League e o modo "Demonstração" (ligas fictícias) continua disponível
normalmente. Para ver jogos/tabelas reais:

1. Crie uma conta gratuita em https://www.football-data.org/ (plano grátis:
   10 requisições/minuto) e copie seu token.
2. Copie `.env.example` para `.env` (já ignorado pelo git) e preencha
   `FOOTBALL_DATA_API_KEY=seu_token`.
3. Rode `npm run dev` (ou `npm run build && npm run preview`) normalmente.

A chave **nunca** chega ao navegador: ela só é lida pelo processo Node do
Vite (`vite.config.ts`), que expõe `/api/football/...` como um pequeno
repasse para `https://api.football-data.org/v4/...` adicionando o header
`X-Auth-Token` no servidor. O frontend só conhece a URL relativa — nunca o
token, nunca em `localStorage`, nunca no bundle publicado. Isso não é um
backend: é só esse repasse de poucas linhas, exigido porque um token de API
nunca deve ficar em código que roda no navegador do usuário.

## Comparação visual e testes de interação

Scripts auxiliares em `scripts/` usam Playwright para renderizar as telas em
1280×720 e exercitar as interações mock (requer `npm run dev` rodando em
outro terminal, ajustando a porta no comando se necessário):

```powershell
npx playwright install chromium   # só na primeira vez
node scripts/capture.mjs http://localhost:5173/ comparacoes/home.png
node scripts/capture-dashboard.mjs http://localhost:5173/ comparacoes/dashboard.png
node scripts/capture-music-radio.mjs http://localhost:5173/   # salva music_screen.png e radio_screen.png
node scripts/capture-apps.mjs http://localhost:5173/          # salva fase4_veiculo/trabalho/esportes/clima.png
node scripts/check-statusbar.mjs http://localhost:5173/       # comprova o alinhamento do dock em 09:09 e 17:59
node scripts/test-edit-mode.mjs     # long-press, remover, restaurar, persistência
node scripts/test-mocks.mjs         # badges + navegação Home/Dashboard/Música
node scripts/test-brands.mjs        # cicla e captura as 7 marcas (dentro do app Veículo)
node scripts/test-music-radio.mjs   # navegação Home/Dashboard/Música/Rádio
node scripts/test-fase4-apps.mjs    # abre os 4 apps, testa controles e volta
node scripts/check-console.mjs      # garante ausência de erros de console
node scripts/check-dock-statusbar.mjs  # Fase 5: prova visual (overlay/diff), não só bounding box
node scripts/test-fase5.mjs         # Navegação, Chamadas, Radar, Assistente de voz, Esportes, regressão
```

**Para testar a troca de marca do veículo:** abra o app "Veículo" (ícone na
Home), vá para a aba "Cavalo Mecânico" e toque em "Trocar marca (teste)" —
cicla, em ordem, por Scania → Volvo → Mercedes-Benz → DAF → MAN → Iveco →
Renault Trucks → (volta a Scania). A partir da Fase 4 isso acontece dentro
do app, não mais no ícone da Home (conforme pedido: "sem painel extra
permanente na Home").

A pasta `comparacoes/` é local (ignorada pelo git).

## O bug do dock — causa raiz e evidência

Nas Fases 2–3 o `StatusBar` (relógio/sinal/bateria) parecia "puxado" para a
direita em relação à referência, mesmo com um `padding` único e estrutural.
Medindo pixel a pixel `home.png`/`de/job.png` nesta fase, a causa real
apareceu: o `.dock` usava `border-radius: 51.5px` desde a Fase 1 — uma
cápsula/pílula completa — enquanto a referência usa um retângulo bem
arredondado de **~26px**. Com o raio errado, o canto arredondado "comia"
muito mais espaço do que deveria nas primeiras ~40px de altura, então
qualquer `padding` que deixasse o relógio visualmente correto acabava
puxando sinal/5G/bateria (que não têm texto variável) para mais longe da
borda real.

Correção: `border-radius` do dock ajustado para `26px` e o `padding` do
`StatusBar` recalibrado contra a forma correta (`5px 0 0 2px`, uma âncora
só, sem margens por ícone). Validado com `scripts/check-statusbar.mjs`, que:

1. renderiza o relógio em **09:09** e **17:59** (tempo "congelado" via
   `page.addInitScript` sobrescrevendo `Date`) e confirma que a posição X de
   relógio/barras/bateria é **idêntica** nos dois horários;
2. compara pixel a pixel a posição esquerda/superior do "1" do relógio
   contra `de/job.png` (ficou a 1–2px de diferença, dentro da tolerância de
   antialiasing da fonte).

Como o `Dock`/`StatusBar` são compartilhados, a correção vale para Home,
Dashboard, Música, Rádio e os 4 novos apps — não há CSS duplicado por tela.

## Fase 5

### Segunda correção do dock — evidência visual

Um usuário sinalizou, com uma captura anotada, que o alinhamento ainda
estava incorreto mesmo após a Fase 4: o relógio e as barras de sinal/5G
compartilham a borda esquerda, mas a **bateria deveria ficar centralizada
horizontalmente** no dock, e estava maior/alinhada à mesma borda esquerda
por engano — além de os três elementos estarem com tamanho menor do que a
referência real (`home.png`: barras ~37×18px, "5G" com ~18px de altura de
tinta, bateria ~46×22px). O `border-radius: 26px` do dock (corrigido na
Fase 4) continuava correto; o problema desta vez era só no `StatusBar`.

Correção: `StatusBar.tsx`/`StatusBar.css` reescritos para posicionamento
absoluto por elemento (em vez de um único padding compartilhado): relógio e
sinal/5G mantêm `left: 15px`; a bateria usa `left: 50%; transform:
translateX(-50%)`, centralizada no dock. Os três SVGs (barras, "5G",
bateria — com corpo em cápsula completa e raio interno `stroke`) foram
redimensionados para as medidas reais, não apenas re-escalados.

`scripts/check-dock-statusbar.mjs` gera, para 3 horários (09:09, 12:40,
17:59) e 3 telas (Home, Dashboard, Veículo), uma imagem lado a lado
[referência 4× | app atual 4× | diferença pixel a pixel 4×] em
`comparacoes/dock_check_<tela>_<hora>.png` — prova visual real, não apenas
`boundingBox()`, conforme exigido nesta fase.

### Navegação (`navi-dunkel.png` / `navi-hell.png` / `karte-3d.png`)

Mock de navegação (SVG/CSS, sem GPS/mapa real/TruckSimMap/ETS2):

1. **Ativa (tema escuro)**: cartão de instrução (manobra, faixas, distância),
   velocímetro/limite no canto superior direito, marcador de posição, cartão
   de chegada.
2. **Tema claro**: mesmo conteúdo, paleta clara (`navi-hell.png`) — alterna
   pelo botão "⋯" (mais opções).
3. **Visão geral / sem instrução ativa** (`karte-3d.png`): esconde o cartão
   de manobra, mostra o nome do destino, velocidade zerada — alterna pelo
   botão de rota (ícone de dois pontos).
4. O selo de velocidade/limite (canto superior direito) abre o módulo
   **Radar** — o mesmo selo aparece ampliado em `blitzer.png`.
5. Um cartão de **Chamadas** (ver abaixo) pode aparecer sobre esta tela sem
   travar a navegação por baixo.

O ícone "Google Maps" da Home e o atalho de mapa do dock abrem esta tela; o
dock mostra um ponto indicador junto ao ícone de mapa enquanto ela está
aberta (mesmo padrão visto em `navi-dunkel.png`).

### Chamadas (`call.png`)

Cartão de chamada (nome/número 100% fictícios — "Disponente/Transportadora"
— sem telefonia real, sem contatos, sem microfone):

1. Chamada tocando: avatar, nome/assunto, botões recusar/atender.
2. Chamada ativa: cronômetro, mudo, encerrar — sobreposta à tela atual sem
   congelar nada por baixo.
3. Chamada encerrada: aviso breve, depois some sozinho.

Disparo de teste: botão "Simular chamada (teste)" dentro da tela de
Navegação (mesmo padrão de botões de teste já usado em Trabalho/Veículo).

### Radar (`blitzer.png`)

Tela cheia de alertas de velocidade/radar (sem nenhum serviço real de
radar — tudo mock e local a esta demonstração):

1. Estrada livre (estado padrão).
2. Radar à frente (alerta, com distância e tipo fictícios).
3. "Reportar radar" — confirmação mock (nada é publicado de verdade),
   retorna sozinho ao estado anterior.
4. Botão de voltar retorna para a tela de Navegação de onde veio (não para
   a Home), preservando o contexto.

Acessível só a partir do selo de velocidade da Navegação (a referência não
mostra um ícone de Radar na Home, por isso nenhum foi adicionado); o dock
mostra o ícone de Radar (duplo chevron verde) no 4º slot contextual,
seguindo o mesmo padrão de Rádio/Veículo/Trabalho/Esportes.

### Assistente de voz (estilo Siri) — funcional, não um mock visual

Atalho único **Ctrl+Alt+V** (uma única tecla ativa e já começa a ouvir;
`Escape` cancela) abre um brilho colorido nas bordas de todo o stage
1280×720 (não um orb central) com 5 estados: `ativando` → `escutando` →
`processando` → `falando` → `encerrando/erro`. Um botão discreto no canto
inferior direito oferece o mesmo acionamento para acessibilidade/teste.

- Reconhecimento real via `SpeechRecognition`/`webkitSpeechRecognition`
  (`lang="pt-BR"`), com transcrição visível.
- Resposta real falada via `SpeechSynthesisUtterance` em pt-BR (tenta
  escolher automaticamente uma voz feminina natural, quando o navegador
  oferecer uma).
- Comandos reconhecidos (conjunto fixo, pequeno e documentado — qualquer
  outro pedido recebe a resposta falada "Ainda não tenho essa função
  disponível."): "que horas são?", "que dia é hoje?", "abrir
  música/rádio/clima/veículo/dashboard", "ir para a tela inicial", "pausar
  música", "continuar música".
- Nunca ouve e fala ao mesmo tempo (o reconhecimento é interrompido antes de
  falar); respeita `prefers-reduced-motion`; não grava nem envia áudio a
  nenhum servidor; não salva transcrições.
- Erros tratados com mensagem em português: navegador sem suporte,
  microfone negado, nenhuma fala detectada, tempo esgotado, falha do
  serviço de reconhecimento.

**Isto não é a Siri real nem usa SiriKit** — é uma interface própria do
NeoBladeConnectOS, só visualmente inspirada no efeito do Apple Intelligence/
Siri. Não há clonagem de voz, não há chave de API no frontend, e o Azure
Speech **não** é necessário para compilar ou rodar o projeto — o
`SpeechSynthesis` do navegador já cumpre o requisito de resposta falada
real.

**Como testar manualmente:** abra o app em um navegador baseado em Chromium
com microfone disponível, pressione `Ctrl+Alt+V`, permita o microfone
quando solicitado, e fale um dos comandos acima. `scripts/test-fase5.mjs`
confirma automaticamente que o atalho abre o overlay e que ele fecha
corretamente, mas a captura de voz humana real e a qualidade da fala
sintetizada exigem validação manual — Playwright não tem um microfone real
para simular.

### Esportes — dados reais (Campeonato Brasileiro e Champions League)

A barra lateral agora tem duas seções: **Competições** (Brasileirão `BSA` e
Champions League `CL`, dados reais da football-data.org) e **Demonstração
(ficção)** (as 8 ligas fictícias da Fase 4, inalteradas, sempre claramente
rotuladas e nunca misturadas com dados reais).

Para as competições reais: jogos, placares, status (`Agendado`/`Ao vivo`/
`Encerrado`/...), datas, nomes de time e escudos vêm **verbatim** da API
(ver `src/data/sportsApi.ts`) — nada é reescrito ou inventado. "Ao vivo" só
aparece quando a própria API reporta uma partida `IN_PLAY`/`PAUSED`; a
tabela de classificação respeita o formato que a API devolve (fase de
grupos da Champions não é forçada a virar uma tabela única de liga). Sem
chave configurada (ou em caso de erro/limite de requisições/sem internet),
a tela mostra honestamente "Conecte a fonte de resultados" ou "Sem dados
disponíveis", nunca um placar ou "ao vivo" inventado — com um botão para
tentar novamente. Ver a seção de configuração acima para a chave de API.

Os escudos reais vêm diretamente da URL fornecida pela football-data.org;
se uma imagem falhar ao carregar, o app cai discretamente para as iniciais
do time (nunca afirma que um escudo existe quando a imagem não carregou).
Os escudos pertencem às respectivas competições/clubes — são exibidos aqui
apenas para identificação visual, sem fins comerciais; consulte os termos
de uso da football-data.org (docs.football-data.org) antes de qualquer uso
além desta demonstração pessoal.

**Fonte de dados:** football-data.org v4 (plano gratuito, 10 requisições/
minuto). As respostas são mantidas em cache por 90 s no cliente para não
estourar o limite. Temporada e horário da última atualização aparecem no
cabeçalho da tela quando há dados reais carregados.

## Estrutura

```
src/
  components/
    Stage/          # canvas fixo 1280x720
    Shell/          # papel de parede + dock fixos + navegação entre todas as telas
    HomeScreen/      # grade de apps (3 linhas), paginação, modo de edição
    Dashboard/       # tela de Dashboard (mapa demo, nav card, player mock)
    Music/           # tela Música em tela cheia (estado compartilhado com o card do Dashboard)
    Radio/           # tela Rádio (categorias, lista de estações, volume — tudo mock)
    Veiculo/         # Fase 4 — visão geral + Cavalo Mecânico/Condição/Reboque
    Trabalho/        # Fase 4 — trabalho atual + Progresso/Parada/Detalhes + sem trabalho
    Clima/           # Fase 4 — condição atual + hora a hora + 6 dias + detalhe selecionado
    Esportes/        # Fase 4 + Fase 5 — BSA/CL reais (football-data.org) + ligas fictícias (demo)
    Navegacao/       # Fase 5 — mock de navegação (temas escuro/claro + visão geral)
    Chamadas/        # Fase 5 — cartão de chamada mock sobre a tela atual
    Radar/           # Fase 5 — alertas de radar/velocidade mock
    VoiceAssistant/  # Fase 5 — assistente de voz funcional (overlay + botão)
    BackButton/      # botão de voltar compartilhado por quase todas as telas internas
    common/          # StatBar, StatCard, SegmentedControl — reutilizados pelos 4 apps novos
    Wallpaper/       # papel de parede (SVG, aproximação do original)
    Dock/            # dock lateral (status, atalhos, slot contextual + ponto indicador)
    StatusBar/       # relógio, sinal e bateria (ver seção do bug do dock acima)
    AppGrid/         # grade de aplicativos
    AppIcon/         # ícone + legenda + badge + jiggle/remover (edição)
      NotificationGlyph.tsx / MessageGlyph.tsx  # ícones reconstruídos em SVG (sem asset com badge embutido)
      CalendarGlyph.tsx         # ícone de calendário com data real
      EsportesGlyph.tsx         # ícone do app Esportes, SVG (Fase 4)
      BrandLogoGlyph.tsx / VehicleFallbackGlyph.tsx  # logo da marca atual / selo neutro (marca desconhecida)
    Badge/           # badge real independente (contagem mock)
    EditModeBar/     # barra "Restaurar / Concluir" do modo de edição
    Pagination/      # indicador de páginas (Home)
  data/
    apps.ts             # lista de apps da Home (id, label, ícone)
    truckBrands.ts       # as 7 marcas de veículo + logo de cada uma
    radioStations.ts     # categorias e estações mock do Rádio
    vehicleMock.ts        # Fase 4 — visão geral/condição/reboque + modelo por marca
    jobMock.ts            # Fase 4 — trabalho ativo (origem/destino/carga/financeiro/parada)
    weatherMock.ts        # Fase 4 — condição atual/hora a hora/6 dias (determinístico)
    sportsMock.ts         # Fase 4 — ligas/clubes/partidas fictícios (modo Demonstração) + tabela derivada
    sportsApi.ts          # Fase 5 — cliente football-data.org (via proxy, cache, estados honestos)
    sportsFormat.ts        # Fase 5 — tradução de status/datas da API para pt-BR
    navMock.ts             # Fase 5 — rota/instrução fictícia da Navegação + alerta de radar
    callMock.ts            # Fase 5 — nome/assunto fictícios da Chamada
    voiceCommands.ts        # Fase 5 — conjunto fixo de comandos do assistente de voz
  hooks/
    useLongPress.ts        # detecta pressionar-e-segurar sem quebrar o clique curto
    useRemovedApps.ts      # persistência dos atalhos removidos (localStorage)
    useHomeMockState.ts    # estado mock (badges, marca do veículo) + abrir cada app
    useMusicPlayerState.ts # estado do player compartilhado entre Dashboard e tela Música
    useIncomingCall.ts      # Fase 5 — estado mock da chamada (tocando/ativa/encerrada)
    useVoiceAssistant.ts    # Fase 5 — pipeline real de reconhecimento/síntese de fala
    useSportsData.ts        # Fase 5 — busca jogos/tabela reais de uma competição
  assets/
    icons/    # recortes/ativos locais usados pelos ícones (apps, Scania, arte do álbum)
    brands/   # logos de Volvo, Mercedes-Benz, DAF, MAN, Iveco, Renault Trucks (ver origem abaixo)
```

## Telas e estados entregues (Fase 4)

**Veículo** (`fahrzeug.png` / `de/truck.png` / `en/truck.png`) — painel
esquerdo fixo + abas no painel direito:
1. Visão geral (sempre visível): velocidade, marcha, rotação, piloto
   automático, tanque/AdBlue, seta/luz/retarder, modelo e freio de
   estacionamento.
2. Condição: motor/transmissão/cabine/chassi/rodas + óleo/água/consumo/km.
3. Cavalo Mecânico: logo da marca atual, modelo, placa, potência, ano, e o
   botão de troca de marca (mock, 7 marcas).
4. Reboque: estado acoplado (carga/freios/pneus/luzes + peso/eixos) **ou**
   "sem reboque acoplado" — alternável por um botão de teste, mesmo painel.

**Trabalho** (`auftrag.png` / `de/job.png` / `en/job.png`) — painel
esquerdo fixo + abas no painel direito:
1. Trabalho atual: origem→destino, carga, pagamento/custos/líquido/
   distância/avaria.
2. Progresso: km restantes, barra, chegada + "no prazo", prazo, margem.
3. Próxima parada: card expandido com nome, distância, horário e comodidades.
4. Detalhes: cartões com carga, peso, reboque, origem, destino, distância.
5. Sem trabalho/concluído: estado vazio no mesmo sistema visual, com botão
   para "aceitar novo trabalho" (mock) e voltar ao estado 1–4.

**Clima** (`wetter.png` / `de/weather.png` / `en/weather.png`):
1. Condição atual: cidade, temperatura, descrição, sensação/vento.
2. Previsão horária: 12 horas, selecionável.
3. Previsão de 6 dias: dia, ícone, % de chuva (quando houver), barra mín/máx.
4. Detalhe do dia/hora selecionado: reaproveita o mesmo painel da condição
   atual (não é uma tela nova) trocando o conteúdo mostrado.

**Esportes** (`sport.png` / `de/sports.png` / `en/sports.png`):
1. Seletor lateral de 8 campeonatos fictícios.
2. Grade de partidas da liga selecionada (placar/status), 2 colunas.
3. Alternância Jogos/Tabela — a tabela é **derivada automaticamente** dos
   placares das partidas já finalizadas daquela liga (sem dado duplicado).
4. Detalhe da partida: modal com placar, status e artilheiros (quando houver).

Em todos os 4 apps: abrir pelo ícone correspondente (Veículo/Trabalho na
Home; Esportes na Home — novo 11º ícone, 3ª linha da grade; Clima pelo
ícone de clima do dock), botão "←" volta para Home ou Dashboard (de onde o
app foi aberto), e o botão inferior do dock sempre volta direto à Home.

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
mesmo raciocínio de uso nominativo se aplica a ele.

O ícone do app Esportes (campo de futebol estilizado) foi reconstruído em
SVG a partir do motivo visual do ícone de referência (não é um recorte),
para ficar nítido tanto na Home (96px) quanto no slot do dock (61px).

## Fidelidade visual e limitações conhecidas

- Dock, grade de ícones, legendas, paginação e status bar foram medidos
  pixel a pixel a partir das referências locais (`home.png`, `de/job.png`,
  1280×720) — ver a seção do bug do dock acima para o caso mais detalhado.
  Música, Rádio, Veículo, Trabalho, Clima e Esportes seguem a composição
  geral das respectivas referências (proporções, posições, hierarquia),
  mas não passaram por medição pixel a pixel tão exaustiva quanto Home/
  Dashboard — não é alegado 100% idêntico.
- **Veículo/Trabalho**: dados são mock fixos (não há telemetria real nem
  comunicação com o ETS2). "Trocar marca", "Simular acoplamento/
  desacoplamento" e "Concluir entrega"/"Aceitar novo trabalho" são
  claramente rotulados como teste/demonstração.
- **Clima**: dados determinísticos (não vêm de API nem de localização
  real); os rótulos de dia da semana usam a data real do sistema (mesma
  lógica do Calendário) só para exibir a semana correta em português.
- **Esportes**: o Brasileirão (`BSA`) e a Champions League (`CL`) usam
  dados e escudos reais da football-data.org quando uma chave é
  configurada (ver seção "Configuração opcional" acima); sem chave, sem
  internet ou em caso de erro/limite de requisições, a tela mostra os
  estados honestos "Conecte a fonte de resultados"/"Sem dados
  disponíveis" — nunca inventa um placar ou um jogo "ao vivo". O modo
  "Demonstração" (ligas/clubes/datas/placares 100% inventados, escudos
  como iniciais em círculo colorido) continua disponível separadamente e
  nunca é misturado aos dados reais.
- **Navegação/Radar**: mock em SVG/CSS — sem GPS, mapa real, TruckSimMap
  ou qualquer integração com o ETS2. Rota, manobras, velocidade e alertas
  de radar são fictícios e fixos.
- **Chamadas**: nome, assunto e número são 100% fictícios — sem telefonia
  real, sem acesso a contatos ou microfone neste módulo (o microfone real
  é usado apenas pelo Assistente de Voz, módulo separado).
- **Assistente de voz**: funcional (reconhecimento e síntese de fala
  reais do navegador), mas não é a Siri oficial, não usa SiriKit e não
  clona vozes. Reconhece apenas um conjunto fixo e pequeno de comandos
  (documentado acima); qualquer outro pedido recebe a resposta falada
  "Ainda não tenho essa função disponível." Exige um navegador com
  suporte a `SpeechRecognition`/`SpeechSynthesis` (Chromium) e permissão
  de microfone concedida pelo usuário.
- **Papel de parede**: aproximação em SVG ajustada a partir de amostras de
  brilho da imagem original — não é um recorte da captura nem pixel-idêntico
  às curvas originais, apenas visualmente próximo.
- **Mapa do Dashboard**: ilustração SVG de demonstração (terrenos, rota,
  marcador) inspirada na composição da referência — não há integração real
  de mapa/GPS.
- **Música**: "Letra" e "Fila" (top-right) são botões visuais sem conteúdo
  real — ao clicar, registram um aviso no console. Play/pause, anterior/
  próxima, seek, shuffle e repeat são estados de demonstração reais,
  compartilhados entre o cartão do Dashboard e a tela cheia.
- **Rádio**: estações e categorias são 100% fictícias — sem emissoras reais.
- Badges de Notificações/Mensagens são mock: clicar no ícone cicla a
  contagem (0, 1, 2, 5); 0 = badge oculto, 1–99 = número, acima de 99 = "99+".
- Relógio e calendário usam data/hora real do sistema (sem backend); sinal
  5G e bateria continuam sendo indicadores estáticos (sem telemetria).
- Modo de edição: toque curto continua abrindo os apps/mocks normalmente;
  apenas pressionar e segurar (~600 ms) ativa a edição (jiggle + botão "−").
  A remoção de atalhos persiste em `localStorage`; a restauração (individual
  ou "restaurar todos") não usa nenhuma tela/loja de apps adicional.
- Nenhum aplicativo além de Home, Dashboard, Música, Rádio, Veículo,
  Trabalho, Clima, Esportes, Navegação, Chamadas, Radar e o Assistente de
  Voz foi implementado: os ícones restantes (Configurações, Diário de
  Bordo, Abastecer e Descansar) continuam apenas dando feedback de toque e
  registrando um log — um clique neles nunca abre uma tela inventada.

## Tecnologias

- React 19 + TypeScript + Vite
- CSS puro (sem frameworks de UI)
- [Motion](https://motion.dev) para as transições de toque e entre telas
- Web Speech API do navegador (`SpeechRecognition`/`SpeechSynthesis`) para
  o Assistente de Voz — nenhuma dependência nova adicionada para isso
- Playwright (apenas para captura/comparação visual e testes de interação
  em desenvolvimento — não é dependência de produção)
