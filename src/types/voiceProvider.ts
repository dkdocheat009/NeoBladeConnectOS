/**
 * Contrato de um provedor de voz (Fase 9, seção 10 da tarefa) — a camada
 * que `useVoiceAssistant` poderia passar a consumir no lugar de chamar
 * `window.SpeechRecognition`/`window.speechSynthesis` diretamente, para
 * permitir trocar o motor de voz (navegador, serviço local em
 * 127.0.0.1, nuvem) sem mexer na lógica de comandos/UI.
 *
 * NESTA FASE SÓ O CONTRATO E O STATUS SÃO REAIS: `WEB_SPEECH_PROVIDER`
 * abaixo descreve o único provedor realmente ativo (o mesmo
 * SpeechRecognition/SpeechSynthesis do navegador que `useVoiceAssistant`
 * já usa). Os provedores locais (sherpa-onnx/Kokoro, Piper) e o de nuvem
 * (Azure Speech) estão listados apenas como METADADOS — nenhum binário,
 * modelo ou serviço foi baixado/instalado/iniciado nesta sessão. Ver
 * `docs/EXTERNAL_SOURCES_AND_LICENSES.md` para o porquê (download de
 * múltiplos GB, instalação de runtime nativo e execução de um processo
 * próprio não são ações razoáveis para um agente autônomo tomar sem
 * confirmação explícita do usuário) e para os links de referência citados
 * na tarefa. Ativar um provedor local de verdade é trabalho futuro
 * opcional, descrito aqui para não "inventar" que já funciona.
 */

export interface VoiceProviderHealth {
  available: boolean;
  /** true quando o provedor já foi testado com sucesso nesta máquina. */
  installed: boolean;
  detail: string;
}

export interface VoiceProvider {
  id: 'web-speech' | 'local-tts' | 'local-stt' | 'cloud';
  label: string;
  kind: 'stt' | 'tts';
  startListening?: () => void;
  stopListening?: () => void;
  speak?: (text: string) => void;
  cancel?: () => void;
  listVoices?: () => Promise<string[]>;
  health: () => Promise<VoiceProviderHealth>;
  getAudioLevel?: () => number;
}

/**
 * Único provedor ativo nesta fase: WebSpeech do próprio navegador — é
 * exatamente o que `useVoiceAssistant.ts` já implementa diretamente, só
 * descrito aqui com os mesmos metadados que os demais para a tela de
 * Ajustes > Siri e Voz > Vozes poder listar todos de forma honesta.
 */
export async function webSpeechHealth(): Promise<VoiceProviderHealth> {
  const hasSTT = typeof window !== 'undefined' && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
  if (hasSTT && hasTTS) {
    return { available: true, installed: true, detail: 'Reconhecimento e fala do navegador (Chrome/Edge).' };
  }
  if (hasTTS) {
    return { available: true, installed: true, detail: 'Só síntese de fala — reconhecimento não suportado neste navegador.' };
  }
  return { available: false, installed: false, detail: 'Navegador sem suporte a voz.' };
}

/**
 * Metadados informativos dos provedores citados na tarefa (seção 10) —
 * `installed` é sempre `false` porque nada foi instalado por este agente;
 * `sourceUrl` é só a referência, não um link de download automático.
 */
export const VOICE_PROVIDER_CATALOG: Array<{
  id: string;
  label: string;
  kind: 'stt' | 'tts';
  installed: false;
  license: string;
  detail: string;
  sourceUrl: string;
}> = [
  {
    id: 'sherpa-onnx',
    label: 'Kokoro / sherpa-onnx (TTS local)',
    kind: 'tts',
    installed: false,
    license: 'Apache-2.0 (projeto); verificar a licença de cada voz/modelo específico',
    detail: 'Motor TTS local via ONNX Runtime, rodando em 127.0.0.1. Não baixado/instalado nesta sessão.',
    sourceUrl: 'https://github.com/k2-fsa/sherpa-onnx',
  },
  {
    id: 'piper',
    label: 'Piper (TTS local, leve)',
    kind: 'tts',
    installed: false,
    license: 'GPL-3.0 (piper1-gpl); vozes com licenças independentes (ver piper-voices)',
    detail: 'Alternativa mais leve ao sherpa-onnx. Não baixado/instalado nesta sessão.',
    sourceUrl: 'https://github.com/OHF-Voice/piper1-gpl',
  },
  {
    id: 'whisper-cpp',
    label: 'whisper.cpp (STT local, offline)',
    kind: 'stt',
    installed: false,
    license: 'MIT',
    detail: 'Reconhecimento de fala offline em pt-BR. Não baixado/instalado nesta sessão.',
    sourceUrl: 'https://github.com/ggml-org/whisper.cpp',
  },
  {
    id: 'azure-speech',
    label: 'Azure Speech (nuvem, ex.: pt-BR-FranciscaNeural)',
    kind: 'tts',
    installed: false,
    license: 'Serviço pago da Microsoft — exige conta e chave própria do usuário',
    detail: 'Requer conexão e uma chave de API que o usuário forneceria; nenhuma chave está embutida no app.',
    sourceUrl: 'https://learn.microsoft.com/pt-br/azure/ai-services/speech-service/language-support',
  },
];
