import type { Screen } from '../types';

export interface VoiceCommandContext {
  onOpenScreen: (screen: Screen) => void;
  onGoHome: () => void;
  musicPlay: () => void;
  musicPause: () => void;
}

export interface VoiceCommandResult {
  spokenText: string;
  handled: boolean;
}

const WEEKDAYS_PT = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

/**
 * Conjunto PEQUENO e REAL de comandos locais (Fase 5). Casamento por
 * substring/normalização simples — não é compreensão de linguagem natural
 * nem um modelo de IA; fora desta lista, responde honestamente que ainda
 * não tem a função.
 */
export function resolveVoiceCommand(rawTranscript: string, ctx: VoiceCommandContext): VoiceCommandResult {
  const t = normalize(rawTranscript);

  if (t.includes('que horas')) {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    return { spokenText: `Agora são ${h} e ${m}.`, handled: true };
  }

  if (t.includes('que dia') && (t.includes('hoje') || t.includes('e hoje'))) {
    const now = new Date();
    return {
      spokenText: `Hoje é ${WEEKDAYS_PT[now.getDay()]}, dia ${now.getDate()} de ${MONTHS_PT[now.getMonth()]}.`,
      handled: true,
    };
  }

  if (t.includes('abrir musica') || t.includes('abrir spotify')) {
    ctx.onOpenScreen('music');
    return { spokenText: 'Abrindo Música.', handled: true };
  }

  if (t.includes('abrir radio')) {
    ctx.onOpenScreen('radio');
    return { spokenText: 'Abrindo Rádio.', handled: true };
  }

  if (t.includes('abrir clima')) {
    ctx.onOpenScreen('clima');
    return { spokenText: 'Abrindo Clima.', handled: true };
  }

  if (t.includes('abrir veiculo')) {
    ctx.onOpenScreen('veiculo');
    return { spokenText: 'Abrindo Veículo.', handled: true };
  }

  if (t.includes('abrir trabalho')) {
    ctx.onOpenScreen('trabalho');
    return { spokenText: 'Abrindo Trabalho.', handled: true };
  }

  if (t.includes('abrir esportes')) {
    ctx.onOpenScreen('esportes');
    return { spokenText: 'Abrindo Esportes.', handled: true };
  }

  if (t.includes('abrir dashboard') || t.includes('abrir painel')) {
    ctx.onOpenScreen('dashboard');
    return { spokenText: 'Abrindo o Dashboard.', handled: true };
  }

  if (t.includes('tela inicial') || t.includes('ir para home') || t.includes('ir para a home') || t === 'home') {
    ctx.onGoHome();
    return { spokenText: 'Voltando para a tela inicial.', handled: true };
  }

  if (t.includes('pausar musica') || t.includes('pausar a musica') || t.includes('pause')) {
    ctx.musicPause();
    return { spokenText: 'Música pausada.', handled: true };
  }

  if (t.includes('continuar musica') || t.includes('tocar musica') || t.includes('retomar musica')) {
    ctx.musicPlay();
    return { spokenText: 'Continuando a música.', handled: true };
  }

  return { spokenText: 'Ainda não tenho essa função disponível.', handled: false };
}
