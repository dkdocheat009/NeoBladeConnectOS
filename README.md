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

**Fase 5:** segunda correção do dock (o raio já estava certo, mas o
`StatusBar` ainda não separava corretamente o alinhamento do relógio/sinal
do alinhamento — centralizado — da bateria), quatro módulos novos
(**Navegação**, **Chamadas**, **Radar** e um **Assistente de Voz** estilo
Siri funcional, com reconhecimento e síntese de fala reais), e reforma do
app **Esportes** para usar dados reais do Campeonato Brasileiro e da
Champions League via football-data.org. Veja a seção "Fase 5" abaixo para
detalhes, evidências e limitações.

**Fase 6 (atual):** correção do Esportes (a seção "Demonstração" com ligas
fictícias foi **removida por completo** — só Brasileirão/Champions reais
ficam na tela — e o proxy da football-data.org ganhou uma lista de
endpoints permitidos); o cartão do Assistente de Voz foi redesenhado como
uma notificação flutuante estilo Siri (ícone multicolorido, transcrição
"Você:"/"Assistente:" em tempo real, fade de saída); e quatro novos apps:
**Mensagens**, **Notificações** (com banner transitório), **Calendário** e
**Configurações** (persistidas em `localStorage`), cada um com 4–5 estados
navegáveis reais. Veja a seção "Fase 6" abaixo para detalhes, evidências e
limitações.

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
League (as únicas competições listadas; não há mais um modo de
demonstração com ligas fictícias — ver seção "Fase 6"). Para ver
jogos/tabelas reais:

1. Crie uma conta gratuita em https://www.football-data.org/client/register
   (plano grátis: 10 requisições/minuto) e copie seu token.
2. Copie `.env.example` para `.env` (já ignorado pelo git) e preencha
   `FOOTBALL_DATA_API_KEY=seu_token`.
3. Reinicie `npm run dev` (ou `npm run build && npm run preview`) — o
   proxy só lê a variável de ambiente ao subir.
4. Abra o app Esportes: se a chave estiver correta, Brasileirão/Champions
   mostram jogos/tabela reais em vez do aviso de configuração.

A chave **nunca** chega ao navegador: ela só é lida pelo processo Node do
Vite (`vite.config.ts`), que expõe `/api/football/...` como um pequeno
repasse para `https://api.football-data.org/v4/...` adicionando o header
`X-Auth-Token` no servidor — restrito a uma lista de caminhos permitidos
(`/competitions/BSA|CL/matches|standings|teams`; qualquer outro caminho
recebe 403) e com um pequeno cache de 30 s para não estourar o limite de
requisições. O frontend só conhece a URL relativa — nunca o token, nunca em
`localStorage`, nunca no bundle publicado. Isso não é um backend: é só esse
repasse de poucas linhas, exigido porque um token de API nunca deve ficar
em código que roda no navegador do usuário.

**Nota sobre esta validação:** neste ambiente de desenvolvimento não havia
uma `FOOTBALL_DATA_API_KEY` configurada, então as chamadas reais à API
não puderam ser testadas ponta a ponta — o que foi verificado é que, sem
chave, o proxy responde `503` corretamente e a tela mostra o aviso de
configuração (nunca um placar inventado). Ao configurar uma chave válida,
teste você mesmo os quatro endpoints usados pelo app antes de considerar a
integração validada.

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
node scripts/test-mocks.mjs         # badges reais + navegação Home/Notificações/Dashboard/Música
node scripts/test-brands.mjs        # cicla e captura as 7 marcas (dentro do app Veículo)
node scripts/test-music-radio.mjs   # navegação Home/Dashboard/Música/Rádio
node scripts/test-fase4-apps.mjs    # abre os 4 apps, testa controles e volta
node scripts/check-console.mjs      # garante ausência de erros de console
node scripts/check-dock-statusbar.mjs  # Fase 5: prova visual (overlay/diff), não só bounding box
node scripts/test-fase5.mjs         # Navegação, Chamadas, Radar, Assistente de voz, Esportes, regressão
node scripts/test-fase6.mjs         # Esportes só-real, cartão do Siri, Mensagens/Notificações/Calendário/Configurações
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

## Fase 6

### Esportes — correção obrigatória: remoção total do modo Demonstração

A Fase 5 deixava as ligas fictícias ("Demonstração (ficção)") visíveis ao
lado de Brasileirão/Champions, o que não atendia ao pedido de dados
exclusivamente reais. Nesta fase:

- A seção "Demonstração (ficção)" e as 8 ligas fictícias foram **removidas
  por completo** da UI — `src/data/sportsMock.ts` foi apagado, e
  `EsportesScreen.tsx` só conhece `SPORTS_COMPETITIONS` (Brasileirão `BSA`
  e Champions League `CL`). Não há mais nenhum dado simulado misturado aos
  reais.
- O proxy (`vite.config.ts`) passou a **restringir os caminhos
  permitidos** a `/competitions/(BSA|CL)/(matches|standings|teams)` —
  qualquer outra rota recebe `403 path_not_allowed` — e ganhou um cache de
  30 s por caminho no próprio servidor (além do cache de 90 s já existente
  no cliente), para não estourar o limite de 10 requisições/minuto do
  plano gratuito.
- Investigamos uma alternativa gratuita sem conta própria (TheSportsDB,
  chave pública `123`, documentada para uso livre) como exigido pela
  tarefa: consultando `all_leagues.php`/`search_all_leagues.php` da sua
  API v1, confirmamos que o catálogo gratuito **não inclui** o Campeonato
  Brasileiro Série A (principal) nem a UEFA Champions League — só grandes
  ligas europeias de clube (Premier League, Bundesliga, La Liga etc.) — e
  que `eventspastleague.php` respondeu `403` nos testes. Por não cobrir as
  duas competições exigidas, **não foi integrada**: manter apenas
  football-data.org, com o estado honesto de configuração, foi a escolha
  correta em vez de forçar uma fonte incompleta.
- Escudos continuam vindo da URL real da football-data.org, com fallback
  discreto só em caso de falha de carregamento (nunca como padrão quando
  há escudo válido).
- **Não foi possível testar as chamadas reais ponta a ponta nesta sessão**
  por não haver uma `FOOTBALL_DATA_API_KEY` configurada no ambiente — ver
  nota na seção de configuração acima.

### Assistente de voz — cartão de notificação estilo Siri

A animação do brilho nas bordas do stage e o atalho `Ctrl+Alt+V` foram
**preservados exatamente como estavam** (nenhuma linha de
`VoiceAssistantOverlay.css` referente ao anel/halo foi alterada). O que
mudou foi a apresentação do texto, antes solta no rodapé:

- Um **cartão flutuante** dentro do stage (nunca fora dele), com um ícone
  multicolorido original (`SiriIconGlyph.tsx`, desenhado em SVG — não é
  uma cópia do glifo oficial da Siri nem de nenhuma captura da Apple) e
  fundo translúcido com desfoque, legível sobre qualquer app por baixo.
- Durante a escuta: **"Você: <transcrição>"** atualizado em tempo real a
  cada resultado parcial do reconhecimento.
- Durante a fala: **"Assistente: <resposta>"** visível do início ao fim da
  síntese de voz e por mais ~2 s depois, com um **fade de saída suave**
  (não desaparece no instante exato em que a fala termina).
- 4 estados visuais rotulados: Ouvindo / Processando / Respondendo / Erro
  — erros de permissão/suporte aparecem no mesmo cartão.
- Continua nunca ouvindo e falando ao mesmo tempo, nunca registrando a
  fala completa no console, nunca persistindo transcrições, e respeitando
  `prefers-reduced-motion`.
- Em Configurações > Voz/Siri, "Mostrar transcrição em tempo real" pode
  desligar as linhas "Você:"/"Assistente:" (mensagens de erro continuam
  visíveis); "Ativar assistente de voz" desliga o atalho e esconde o
  botão de acionamento por completo.

### Mensagens (atalho existente na Home)

Estado compartilhado com a Home (`useMessagesState`, em memória — não
persiste ao recarregar, assim como os demais apps mock da Home). 100%
local: nenhuma mensagem é enviada a uma pessoa real, sem integração com
SMS/WhatsApp/contatos.

1. **Recentes** (visão minimalista orientada a voz): as 3 mensagens mais
   recentes + um botão "Perguntar por voz", que abre o Assistente de Voz.
2. **Não lidas**: lista filtrada.
3. **Leitura de uma mensagem**: abre o detalhe, marca como lida (reflete
   no badge da Home) e oferece "🔊 Ouvir mensagem" — fala o texto em voz
   alta de verdade via `SpeechSynthesisUtterance`.
4. **Ditar resposta**: "🎙️ Ditar resposta" usa `SpeechRecognition` real
   para capturar a fala, mostra uma etapa de revisão (texto editável) e só
   então "Confirmar envio (simulado)" — nunca envia a lugar nenhum de
   verdade, só marca a resposta simulada na própria mensagem.
5. **Caixa vazia**: ao apagar todas as mensagens, com botão de teste para
   repor o conteúdo de exemplo.

### Notificações (ícone existente na Home)

Store comum (`useNotificationsState`) compartilhada entre a Home (badge),
o banner transitório e a própria tela — nenhuma notificação fica embutida
permanentemente nos ícones.

1. **Lista agrupada** por origem (Veículo, Trabalho, Esportes, Sistema).
2. **Banner não intrusivo**: "Simular notificação (teste)" adiciona um
   item novo e mostra um cartão no topo do stage, sobre qualquer app, por
   ~4 s, sem bloquear a tela por baixo; inclui um aviso sonoro curto (Web
   Audio, sem asset) que respeita o volume/interruptor de Configurações.
3. **Marcar como lida**: toque no corpo do item; reflete no badge da Home
   na hora.
4. **Apagar/limpar**: remoção individual (✕) ou "Limpar tudo".
5. **Estado vazio**: com botão de teste para repor o conteúdo de exemplo.

O cartão da Siri é um componente totalmente separado
(`VoiceAssistantOverlay`) e não aparece nesta lista.

### Calendário (ícone existente na Home)

Agenda 100% mock (`src/data/calendarMock.ts`), com o dia 0 sempre sendo
"hoje" pela data real do sistema (o ícone da Home continua mostrando
dia/mês reais via `CalendarGlyph`, sem nenhuma alteração). Sem integração
com calendário real.

1. **Agenda de hoje**: compromissos do dia, por horário.
2. **Próximos dias**: lista de 5 dias com contagem de compromissos cada.
3. **Detalhe de evento**: horário, local, notas.
4. **Ação de navegação/destino DEMO**: quando o evento tem um destino,
   "🧭 Navegar até o destino (demo)" abre o módulo Navegação (mock já
   existente da Fase 5) — não define uma rota real nem usa GPS.
5. **Nenhum compromisso**: um dos próximos dias é deliberadamente vazio
   para demonstrar esse estado (determinístico, sempre o mesmo dia
   relativo a "hoje").

### Configurações (engrenagem do dock)

Preferências reais, persistidas em `localStorage` (`useSettingsState`),
cada uma com um efeito restrito ao que já existe — nenhuma liga um recurso
futuro fictício:

1. **Aparência**: Escuro/Claro. Só a tela de **Navegação** tem referência
   visual clara/escura (`navi-hell.png`); por isso é o único lugar que
   muda de verdade — as demais telas aprovadas permanecem no visual escuro
   original, documentado explicitamente na própria tela de Configurações
   (sem fingir um tema claro completo que quebraria telas já aprovadas).
2. **Áudio**: volume mestre (0–100%) e interruptor de "sons de
   notificação" — controlam o bipe do banner de Notificações.
3. **Voz/Siri**: ativar/desativar o assistente por completo (esconde o
   atalho e o botão), mostrar/ocultar a transcrição em tempo real, e um
   campo informativo de idioma (só Português (Brasil) é suportado — não
   há seletor fictício de idiomas que não funcionam).
4. **Aplicativos**: lista os atalhos removidos da Home (reaproveitando
   `useRemovedApps`, o mesmo hook do modo de edição) com restauração
   individual ou total.
5. **Informações do sistema**: versão/fase, resolução do stage, navegador
   detectado e modo (desenvolvimento/produção) — dados reais do ambiente,
   somente leitura.

### Regressão

`scripts/test-fase6.mjs` cobre as quatro telas novas, a remoção do modo
Demonstração do Esportes e o novo cartão do Assistente de Voz;
`scripts/test-fase5.mjs` e os scripts de fases anteriores continuam
passando sem alteração de comportamento em Home, Dashboard, Música, Rádio,
Veículo, Trabalho, Clima, Navegação, Chamadas e Radar (dois scripts mais
antigos — `test-mocks.mjs` e `test-fase4-apps.mjs` — foram atualizados
para refletir mudanças de comportamento **intencionais** desta fase:
clicar em Notificações agora abre o app em vez de ciclar um contador, e o
Esportes lista só 2 competições).

### Limitação visual conhecida (não introduzida nesta fase)

Ao revisar as telas com layout de barra lateral (`Esportes`, e a nova
`Configurações`, que segue o mesmo padrão), notamos que o `BackButton`
fica visualmente coberto pelo texto do primeiro item da barra lateral
(ambos ocupam a mesma região, canto superior esquerdo) — o botão continua
funcionando ao toque, só não fica visível com clareza. Esse posicionamento
já existia desde a Fase 4 (Esportes) e não foi alterado nesta fase; registra-se
aqui para transparência, já que apareceu também na tela nova. Corrigi-lo
exigiria reposicionar a barra lateral do Esportes (tela já aprovada), o
que preferimos não fazer sem um pedido explícito.

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
    Esportes/        # Fase 4-6 — só Brasileirão/Champions reais (football-data.org); sem modo demo
    Navegacao/       # Fase 5 — mock de navegação (temas escuro/claro + visão geral)
    Chamadas/        # Fase 5 — cartão de chamada mock sobre a tela atual
    Radar/           # Fase 5 — alertas de radar/velocidade mock
    VoiceAssistant/  # Fase 5 (pipeline) + Fase 6 (cartão de notificação estilo Siri)
    Mensagens/       # Fase 6 — recentes/não lidas/detalhe/ditar resposta/vazio
    Notificacoes/    # Fase 6 — lista agrupada + banner transitório
    Calendario/      # Fase 6 — agenda mock (hoje/próximos dias/detalhe/nav demo/vazio)
    Configuracoes/   # Fase 6 — preferências persistidas (aparência/áudio/voz/apps/sistema)
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
    sportsApi.ts          # Fase 5-6 — cliente football-data.org (proxy allowlisted, cache, estados honestos)
    sportsFormat.ts        # Fase 5 — tradução de status/datas da API para pt-BR
    navMock.ts             # Fase 5 — rota/instrução fictícia da Navegação + alerta de radar
    callMock.ts            # Fase 5 — nome/assunto fictícios da Chamada
    voiceCommands.ts        # Fase 5-6 — conjunto fixo de comandos do assistente de voz
    messagesMock.ts         # Fase 6 — mensagens fictícias iniciais
    notificationsMock.ts    # Fase 6 — notificações fictícias iniciais + item simulado
    calendarMock.ts         # Fase 6 — agenda fictícia determinística (dia 0 = hoje)
    beep.ts                 # Fase 6 — bipe curto via Web Audio (aviso de notificação)
  hooks/
    useLongPress.ts        # detecta pressionar-e-segurar sem quebrar o clique curto
    useRemovedApps.ts      # persistência dos atalhos removidos (localStorage)
    useHomeMockState.ts    # abre cada app da Home + marca do veículo (badges vêm de outros hooks, Fase 6)
    useMusicPlayerState.ts # estado do player compartilhado entre Dashboard e tela Música
    useIncomingCall.ts      # Fase 5 — estado mock da chamada (tocando/ativa/encerrada)
    useVoiceAssistant.ts    # Fase 5-6 — pipeline real de reconhecimento/síntese de fala
    useSportsData.ts        # Fase 5 — busca jogos/tabela reais de uma competição
    useMessagesState.ts     # Fase 6 — store de Mensagens (badge real, ler/ditar/apagar)
    useNotificationsState.ts # Fase 6 — store de Notificações + banner transitório
    useOneShotDictation.ts  # Fase 6 — captura de fala avulsa (ditar resposta de mensagem)
    useSettingsState.ts     # Fase 6 — preferências persistidas em localStorage
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
- **Esportes**: só lista Brasileirão (`BSA`) e Champions League (`CL`),
  usando dados e escudos reais da football-data.org quando uma chave é
  configurada (ver seção "Configuração opcional" acima); sem chave, sem
  internet ou em caso de erro/limite de requisições, a tela mostra os
  estados honestos "Conecte a fonte de resultados"/"Sem dados
  disponíveis" — nunca inventa um placar, uma tabela ou um jogo "ao vivo".
  Não há mais nenhum modo de demonstração com ligas fictícias (removido na
  Fase 6).
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
- **Mensagens/Notificações**: conteúdo 100% fictício, em memória (não
  persiste ao recarregar a página). Os badges da Home refletem a contagem
  real de não lidos de cada store (0 = badge oculto, 1–99 = número, acima
  de 99 = "99+") — clicar no ícone abre o app correspondente, não cicla
  mais um contador de teste (comportamento da Fase 2–5, substituído nesta
  fase pelos apps reais).
- **Calendário**: agenda 100% fictícia e determinística; "hoje" usa a data
  real do sistema (mesma lógica do ícone da Home), mas os compromissos em
  si são fixos, não vindos de um calendário real.
- **Configurações**: preferências persistem em `localStorage` e têm efeito
  real, mas restrito ao que já existe — ver a seção "Fase 6" acima para o
  escopo exato de cada uma (em especial o tema claro, que só se aplica à
  tela de Navegação).
- Relógio e calendário usam data/hora real do sistema (sem backend); sinal
  5G e bateria continuam sendo indicadores estáticos (sem telemetria).
- Modo de edição: toque curto continua abrindo os apps/mocks normalmente;
  apenas pressionar e segurar (~600 ms) ativa a edição (jiggle + botão "−").
  A remoção de atalhos persiste em `localStorage`; a restauração (individual
  ou "restaurar todos") não usa nenhuma tela/loja de apps adicional.
- Nenhum aplicativo além de Home, Dashboard, Música, Rádio, Veículo,
  Trabalho, Clima, Esportes, Navegação, Chamadas, Radar, Assistente de Voz,
  Mensagens, Notificações, Calendário e Configurações foi implementado: os
  ícones restantes (Diário de Bordo, Abastecer e Descansar) continuam
  apenas dando feedback de toque e registrando um log — um clique neles
  nunca abre uma tela inventada.

## Tecnologias

- React 19 + TypeScript + Vite
- CSS puro (sem frameworks de UI)
- [Motion](https://motion.dev) para as transições de toque e entre telas
- Web Speech API do navegador (`SpeechRecognition`/`SpeechSynthesis`) para
  o Assistente de Voz e para "Ouvir"/"Ditar resposta" em Mensagens —
  nenhuma dependência nova adicionada para isso
- Web Audio API para o bipe curtíssimo do banner de Notificações (sem
  arquivo de áudio)
- Playwright (apenas para captura/comparação visual e testes de interação
  em desenvolvimento — não é dependência de produção)
