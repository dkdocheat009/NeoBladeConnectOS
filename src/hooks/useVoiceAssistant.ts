import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveVoiceCommand, type VoiceCommandContext } from '../data/voiceCommands';

export type AssistantState = 'idle' | 'ativando' | 'escutando' | 'processando' | 'falando' | 'erro';

function pickBestPtBrVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const ptBr = voices.filter((v) => v.lang?.toLowerCase() === 'pt-br');
  const ptAny = voices.filter((v) => v.lang?.toLowerCase().startsWith('pt'));
  const pool = ptBr.length ? ptBr : ptAny;
  if (!pool.length) return null;
  const feminine = pool.find((v) => /female|mulher|maria|luciana|francisca|natural/i.test(v.name));
  return feminine ?? pool[0];
}

/**
 * Assistente de voz funcional (Fase 5) — pipeline real, não um mock visual:
 * SpeechRecognition (pt-BR) para escuta real, SpeechSynthesis para resposta
 * falada, AnalyserNode opcional para o brilho reagir ao volume da fala.
 * Interface própria do NeoBladeConnectOS, inspirada visualmente no Apple
 * Intelligence/Siri — não é a Siri oficial nem usa SiriKit.
 */
export function useVoiceAssistant(ctx: VoiceCommandContext, options: { enabled?: boolean } = {}) {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const activeRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const recognitionRef = useRef<InstanceType<NonNullable<typeof window.SpeechRecognition>> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const speechRecognitionSupported =
    typeof window !== 'undefined' && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Pré-carrega a lista de vozes (getVoices() pode vir vazia até o evento
  // 'voiceschanged' disparar pela primeira vez em alguns navegadores).
  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [ttsSupported]);

  const stopAudioAnalysis = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setAudioLevel(0);
  }, []);

  const startAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setAudioLevel(Math.min(1, rms * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Análise de áudio é só um reforço visual — segue sem ela se falhar.
    }
  }, []);

  // Mantém o cartão legível por mais um instante após o fim da fala (ou de
  // um erro), com um fade suave de saída, em vez de sumir no instante exato
  // em que o evento dispara.
  const scheduleClose = useCallback((delayMs: number, fadeMs = 450) => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    window.setTimeout(() => setFadingOut(true), Math.max(0, delayMs - fadeMs));
    closeTimerRef.current = window.setTimeout(() => {
      activeRef.current = false;
      setState('idle');
      setFadingOut(false);
      closeTimerRef.current = null;
    }, delayMs);
  }, []);

  const speak = useCallback(
    (text: string) => {
      setResponseText(text);
      setState('falando');
      if (!ttsSupported) {
        scheduleClose(2600, 700);
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'pt-BR';
      const voice = pickBestPtBrVoice(voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices());
      if (voice) utter.voice = voice;
      utter.onend = () => {
        scheduleClose(2600, 700);
      };
      utter.onerror = () => {
        scheduleClose(2600, 700);
      };
      window.speechSynthesis.speak(utter);
    },
    [scheduleClose, ttsSupported],
  );

  const processTranscript = useCallback(
    (text: string) => {
      setState('processando');
      window.setTimeout(() => {
        if (!activeRef.current) return;
        const result = resolveVoiceCommand(text, ctx);
        speak(result.spokenText);
      }, 260);
    },
    [ctx, speak],
  );

  const startListening = useCallback(() => {
    if (!speechRecognitionSupported) {
      setErrorMessage('Reconhecimento de voz não é suportado neste navegador. Use Chrome ou Edge.');
      setState('erro');
      scheduleClose(2600);
      return;
    }
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let finalTranscript = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalTranscript += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript((finalTranscript + interim).trim());
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setErrorMessage('Permissão de microfone negada.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('Não ouvi nenhuma fala.');
      } else if (event.error === 'network') {
        setErrorMessage('Falha de rede no reconhecimento de voz.');
      } else {
        setErrorMessage('Não foi possível reconhecer a fala.');
      }
      recognitionRef.current = null;
      stopAudioAnalysis();
      setState('erro');
      scheduleClose(2400);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      stopAudioAnalysis();
      if (!activeRef.current) return; // cancelado pelo usuário nesse meio tempo
      const text = finalTranscript.trim();
      if (!text) {
        setErrorMessage('Não ouvi nenhuma fala.');
        setState('erro');
        scheduleClose(2200);
        return;
      }
      processTranscript(text);
    };

    recognitionRef.current = recognition;
    setState('escutando');
    setTranscript('');
    setErrorMessage(null);
    if (streamRef.current) startAudioAnalysis(streamRef.current);
    try {
      recognition.start();
    } catch {
      setState('erro');
      setErrorMessage('Não foi possível iniciar o microfone.');
      scheduleClose(2200);
    }
  }, [speechRecognitionSupported, processTranscript, startAudioAnalysis, stopAudioAnalysis, scheduleClose]);

  const cancel = useCallback(() => {
    activeRef.current = false;
    window.speechSynthesis?.cancel();
    try {
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
    stopAudioAnalysis();
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setState('idle');
    setTranscript('');
    setResponseText('');
    setErrorMessage(null);
    setFadingOut(false);
  }, [stopAudioAnalysis]);

  const activate = useCallback(async () => {
    if (activeRef.current) {
      cancel();
      return;
    }
    if (!enabled) return;
    activeRef.current = true;
    setErrorMessage(null);
    setTranscript('');
    setResponseText('');
    setFadingOut(false);
    setState('ativando');

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setErrorMessage('Permissão de microfone negada.');
        setState('erro');
        scheduleClose(2400);
        return;
      }
    }

    window.setTimeout(() => {
      if (activeRef.current) startListening();
    }, 200);
  }, [cancel, enabled, scheduleClose, startListening]);

  // Atalho único Ctrl+Alt+V: abre e já começa a escutar; ignora
  // event.repeat; Escape cancela com segurança.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return;
      if (event.ctrlKey && event.altKey && event.code === 'KeyV') {
        event.preventDefault();
        void activate();
        return;
      }
      if (event.code === 'Escape' && activeRef.current) {
        cancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activate, cancel]);

  // Limpa recursos se o componente desmontar com o assistente ativo.
  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopAudioAnalysis();
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
      window.speechSynthesis?.cancel();
    };
  }, [stopAudioAnalysis]);

  return {
    state,
    isActive: state !== 'idle',
    transcript,
    responseText,
    errorMessage,
    audioLevel,
    fadingOut,
    activate,
    cancel,
    speechRecognitionSupported,
    ttsSupported,
  };
}

export type VoiceAssistant = ReturnType<typeof useVoiceAssistant>;
