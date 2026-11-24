import { useCallback, useRef, useState } from 'react';

/**
 * Captura de fala avulsa (um "start"/um resultado), reaproveitando a mesma
 * Web Speech API do assistente de voz, mas isolada dele — usada para
 * ditar uma resposta de mensagem (ver MensagensScreen). Não mantém estado
 * global nem interfere com o Assistente de Voz.
 */
export function useOneShotDictation() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<NonNullable<typeof window.SpeechRecognition>> | null>(null);

  const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!supported) {
      setError('Ditado por voz não é suportado neste navegador.');
      return;
    }
    setError(null);
    setTranscript('');
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let finalText = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript((finalText + interim).trim());
    };
    recognition.onerror = (event) => {
      setError(event.error === 'not-allowed' ? 'Permissão de microfone negada.' : 'Não foi possível reconhecer a fala.');
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setError('Não foi possível iniciar o microfone.');
      setListening(false);
    }
  }, [supported]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return { listening, transcript, error, supported, start, stop, reset, setTranscript };
}
