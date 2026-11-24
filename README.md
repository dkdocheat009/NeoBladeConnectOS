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

**Fase 4 (atual):** correção definitiva do bug de alinhamento do dock (a
causa raiz era a forma do próprio dock, não só o `padding` do `StatusBar` —
ver detalhes abaixo), dock com slot contextual (mostra o app aberto, como
nas referências), e quatro novos apps completos em modo demonstração:
**Veículo**, **Trabalho**, **Clima** e **Esportes**, cada um com 4–5
visões/estados navegáveis. Veja limitações e evidências abaixo.

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
node scripts/capture-apps.mjs http://localhost:5173/          # salva fase4_veiculo/trabalho/esportes/clima.png
node scripts/check-statusbar.mjs http://localhost:5173/       # comprova o alinhamento do dock em 09:09 e 17:59
node scripts/test-edit-mode.mjs     # long-press, remover, restaurar, persistência
node scripts/test-mocks.mjs         # badges + navegação Home/Dashboard/Música
node scripts/test-brands.mjs        # cicla e captura as 7 marcas (dentro do app Veículo)
node scripts/test-music-radio.mjs   # navegação Home/Dashboard/Música/Rádio
node scripts/test-fase4-apps.mjs    # abre os 4 apps, testa controles e volta
node scripts/check-console.mjs      # garante ausência de erros de console
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
    Esportes/        # Fase 4 — ligas fictícias, jogos/tabela, detalhe de partida
    BackButton/      # botão de voltar compartilhado (Música/Rádio/Veículo/Trabalho/Clima/Esportes)
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
    sportsMock.ts         # Fase 4 — ligas/clubes/partidas fictícios + tabela derivada
  hooks/
    useLongPress.ts        # detecta pressionar-e-segurar sem quebrar o clique curto
    useRemovedApps.ts      # persistência dos atalhos removidos (localStorage)
    useHomeMockState.ts    # estado mock (badges, marca do veículo) + abrir cada app
    useMusicPlayerState.ts # estado do player compartilhado entre Dashboard e tela Música
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
- **Esportes**: ligas, clubes, datas e placares são inventados. Os
  "escudos" são iniciais em círculo colorido — não reproduzem nenhum
  escudo oficial de clube real.
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
  Trabalho, Clima e Esportes foi implementado: os demais ícones (Google
  Maps, Configurações, Diário de Bordo, Abastecer e Descansar) continuam
  apenas dando feedback de toque e registrando um log.

## Tecnologias

- React 19 + TypeScript + Vite
- CSS puro (sem frameworks de UI)
- [Motion](https://motion.dev) para as transições de toque e entre telas
- Playwright (apenas para captura/comparação visual e testes de interação
  em desenvolvimento — não é dependência de produção)
