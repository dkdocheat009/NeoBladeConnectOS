# Fontes externas e licenças — Fase 9

Este documento lista as fontes/skills consultadas nesta fase e a origem de
cada tipo de asset, conforme pedido pela tarefa da Fase 9 (seção 12). Nenhum
arquivo proprietário da Apple (ícones SF Symbols, sons de sistema, fontes,
glifo oficial da Siri) foi extraído ou redistribuído neste repositório.

## Skills e documentação consultadas (e como influenciaram o design)

| Fonte | Como foi usada |
|---|---|
| `.claude/skills/fidelidade-visual/SKILL.md` | Guia de comparação pixel a pixel contra as capturas locais, mantido como processo de trabalho. |
| iOS 27 Design System (`seunghan91/ios27-design-system`) — já adotado desde a Fase 7 | Vocabulário de tokens (cores de sistema, raios, tipografia, Liquid Glass) reaproveitado e **estendido** nesta fase (`src/styles/ios-tokens.css`) para os tokens de tema das telas CarPlay (`--panel-*`, `--map-*`, `--music-*`, `--radio-*`, `--carplay-*`, `--clima-*`, `--radar-*`, `--call-card-*`, `--nav-card-*`). Nenhum pacote `@ios27_design_system/*` foi instalado — os componentes continuam React próprio. |
| Apple HIG — CarPlay e Liquid Glass (developer.apple.com) | Referência conceitual para a hierarquia de Ajustes, materiais translúcidos e o comportamento da bandeja lateral (capsula escura fixa, confirmada também pela captura real `imagens/de/apple-dark.png`). |
| Anthropic frontend-design / Vercel web-design-guidelines / react-best-practices | Diretrizes gerais de hierarquia visual, estados de hover/pressed e organização de componentes — sem biblioteca nova instalada. |
| SwiftUI Agent Skill | Consultado **só como referência de princípios** (hierarquia, animação, acessibilidade) — nenhum código Swift/SwiftUI foi portado; o projeto continua 100% React/TypeScript. |
| Figma "CarPlay Design System (Community)" | **Não foi possível inspecionar ao vivo nesta sessão** (ver `docs/FIGMA_CARPLAY_AUDIT.md` para o motivo técnico). Os nomes/dimensões de frame citados na própria tarefa foram usados apenas como contexto textual, nunca como "captura vista" — nenhuma cor/asset foi alegada como extraída de lá. |

## Repositórios de efeito do Assistente de Voz (seção 9 da tarefa) — comparação, não cópia

A tarefa pediu para "estudar, comparar e reaproveitar se a licença permitir"
quatro repositórios de efeito de brilho (`ios-siri-animation`, `voiceorbs`,
`AppleIntelligenceGlowEffect`, o componente web de `ui.wensity.com`). **Nenhum
código desses repositórios foi baixado, copiado ou importado nesta sessão** —
não houve acesso de rede a eles neste ambiente. O anel/halo de borda e o
cartão compacto (`VoiceAssistantOverlay.tsx/css`) continuam uma implementação
CSS/SVG original do projeto (gradiente cônico girando + sombras internas),
desenhada a partir da captura real `imagens/de/voice.png`, não um clone do
código de terceiros. Isso é uma limitação desta sessão (sem acesso de rede
amplo), registrada aqui em vez de alegar uma comparação que não foi feita.

## Voz local/nuvem (seção 10 da tarefa)

`src/types/voiceProvider.ts` documenta o contrato `VoiceProvider` e lista os
provedores citados na tarefa como metadados — **nenhum modelo, binário ou
serviço foi baixado ou instalado nesta sessão**:

| Projeto | Papel | Licença (conforme repositório) | Instalado nesta sessão? |
|---|---|---|---|
| [k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) | TTS local (Kokoro) via ONNX Runtime | Apache-2.0 (verificar a licença de cada voz/modelo) | Não |
| [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) | TTS local leve | GPL-3.0 (vozes com licenças independentes, ver [rhasspy/piper-voices](https://github.com/rhasspy/piper-voices)) | Não |
| [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp) | STT local offline | MIT | Não |
| [Azure Speech](https://learn.microsoft.com/pt-br/azure/ai-services/speech-service/language-support) | TTS em nuvem (ex. `pt-BR-FranciscaNeural`) | Serviço pago da Microsoft — exige conta/chave própria do usuário | Não |
| [ollama/ollama](https://github.com/ollama/ollama) | IA conversacional local opcional (fora dos comandos determinísticos) | MIT | Não |

Motivo de não instalar: cada um exige baixar de centenas de MB a vários GB de
modelo/runtime nativo e iniciar um processo próprio no Windows do usuário —
uma ação irreversível/pesada que este agente não toma sem confirmação
explícita. O único provedor **realmente ativo e testado** continua sendo o
Web Speech do navegador (`window.SpeechRecognition`/`window.speechSynthesis`),
exatamente como nas fases anteriores — ver `webSpeechHealth()` em
`src/types/voiceProvider.ts`, exibido honestamente em Ajustes > Siri e Voz >
Vozes.

## Sons de interface

Todos os bipes/avisos sonoros (`src/data/beep.ts`) continuam gerados por
osciladores Web Audio **compostos nesta sessão**, não baixados de nenhum
banco de sons — não há risco de licença, e nada foi extraído de sons oficiais
do iOS/CarPlay.

## Marcas de veículo e apps (inalterado desde fases anteriores)

Ver a seção "Origem dos logos de marca (Veículo)" do `README.md` — não foi
alterada nesta fase.
