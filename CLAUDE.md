# NeoBladeConnectOS — regras do projeto

- Projeto novo. Objetivo: reproduzir **com a maior fidelidade visual possível** as capturas fornecidas (localmente, fora do repositório público), no estilo Apple CarPlay. A referência tem prioridade sobre qualquer preferência estética do agente.
- Tecnologias: React + TypeScript + Vite, CSS preciso e Motion apenas onde uma transição for necessária. Componentes reais em HTML/CSS; **não** use a captura completa como fundo da interface. Use assets adequados quando a licença permitir; nunca invente uma logo/marca quando faltar um asset — registre a pendência e use um fallback neutro.
- Não desenvolver GPS, TruckSimMap, telemetria ETS2, backend, plugins do simulador nem outros aplicativos além do combinado em cada fase. Um clique em aplicativo/tela ainda não implementado não deve exibir algo inventado.
- Use a skill `.claude/skills/fidelidade-visual/SKILL.md`. Meça e compare com a imagem original na viewport **1280×720**. Teste `npm run build`, `npm run lint` e a navegação visual no navegador com Playwright; corrija os desvios antes de considerar concluído. Não afirme “100% idêntico” sem evidência visual.
- Adicione instruções mínimas de execução ao `README.md`; mantenha código limpo, sem dependências/plugins desnecessários. Imagens de referência e arquivos de captura são somente locais e **não** devem ser publicadas no repositório público (ver `.gitignore`).
- Ao concluir cada fase, faça commit e push dos **arquivos de código** para `https://github.com/dkdocheat009/NeoBladeConnectOS` (`main`), verificando antes que `origin` corresponde a esse repositório. Se houver impedimento de autenticação ou divergência remota, informe sem forçar alterações. Resuma o que está pronto, o que foi testado e quais limitações visuais ainda existem.

## Fase 1 (concluída)

Reproduzida a Home Screen (1280×720): papel de parede, dock lateral, relógio/status, grade de apps, ícones, legendas, paginação e interações básicas de toque. Textos preservados como na captura original (inclusive alemão), sem tradução nesta fase.

## Fase 2 (concluída) — ajustes da Home + Dashboard

- Home: legendas dos aplicativos traduzidas para português (lista fixa definida na tarefa da fase); Google Maps e Spotify preservados. Badges de Mensagens/Notificações são elementos reais, controlados por estado mock. Calendário mostra data real do sistema em português. Veículo tem seleção mock de marca. Legendas sem fundos/sombras inconsistentes.
- Home ganha um modo de edição estilo iPhone: pressionar e segurar (~600 ms) ativa jiggle + botão de remover atalho (apenas o atalho, não o app); remoção persiste em `localStorage`; há um jeito simples de restaurar atalhos removidos; clique curto continua funcionando normalmente. O dock lateral é fixo e não entra no modo de edição.
- Nova tela de **Dashboard** (estilo CarPlay, modo escuro), acessível pelo botão inferior do dock (alterna com a Home). Painel de mapa e cartões (navegação, player de música) são uma representação visual de demonstração com dados mock — não há integração real de mapa/GPS/telemetria.
- Pendências identificadas ao final da Fase 2 (corrigidas na Fase 3): ícones de Mensagens/Notificações com retângulo claro visível no canto (artefato do recorte com badge removido); apenas a marca Scania tinha logo real (demais marcas usavam fallback); alinhamento do bloco de status do dock não era estruturalmente robusto a mudanças de hora.

## Fase 3 (atual) — correções da Fase 2 + Música e Rádio

- Corrigidos os 3 defeitos acima: ícones de Notificações/Mensagens reconstruídos do zero em SVG (sem asset recortado, sem retângulo residual); as 7 marcas de veículo pedidas (Scania, Volvo, Mercedes-Benz, DAF, MAN, Iveco, Renault Trucks) têm logo real e verificável (ver README para origem/licença de cada arquivo); `StatusBar` reestruturado (grid com padding único) para alinhamento consistente em qualquer horário.
- Novas telas **Música** (reproduz `de/music.png`/`en/music.png`) e **Rádio** (reproduz `de/radio.png`/`en/radio.png`), abertas a partir do app/atalho correspondente na Home ou no dock, com botão de voltar para Home/Dashboard. Estado de reprodução de Música é compartilhado entre a tela cheia e o cartão do Dashboard. Rádio usa estações/categorias 100% fictícias (sem emissoras reais). Controles sem efeito real (ex.: "Letra"/"Fila" da tela Música) ficam documentados no README, não escondidos.
- Home, Dashboard e o modo de edição por pressionar-e-segurar foram preservados sem alterações de comportamento além das correções listadas acima.
- Não avançar para outras telas/apps além de Home, Dashboard, Música e Rádio nesta fase; sem GPS/TruckSimMap/telemetria real.
