import { useEffect, useState } from 'react';

export type ThemeMode = 'escuro' | 'claro' | 'automatico';
export type TextSize = 'pequeno' | 'padrao' | 'grande';

export interface AppSettings {
  theme: ThemeMode;
  masterVolume: number;
  notificationSound: boolean;
  assistantEnabled: boolean;
  assistantShowTranscript: boolean;
  glassIntensity: number;
  reduceTransparency: boolean;
  reduceMotion: boolean;
  textSize: TextSize;
}

const STORAGE_KEY = 'neoblade:settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'escuro',
  masterVolume: 80,
  notificationSound: true,
  assistantEnabled: true,
  assistantShowTranscript: true,
  glassIntensity: 70,
  reduceTransparency: false,
  reduceMotion: false,
  textSize: 'padrao',
};

function loadSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function resolveEffectiveTheme(mode: ThemeMode, prefersDark: boolean): 'claro' | 'escuro' {
  if (mode === 'automatico') return prefersDark ? 'escuro' : 'claro';
  return mode;
}

const TEXT_SCALE: Record<TextSize, number> = { pequeno: 0.92, padrao: 1, grande: 1.14 };

/**
 * Preferências do app, persistidas em localStorage. Cada valor tem um
 * efeito real: `theme` (Claro/Escuro/Automático — Automático segue
 * `prefers-color-scheme` do sistema, com atualização ao vivo) é aplicado
 * como `data-theme` no `<html>`, fazendo os tokens semânticos de
 * `src/styles/ios-tokens.css` cascatearem para TODO o app sem remount
 * (Fase 8 — antes só chegava à tela de Navegação via prop). Os demais
 * campos (volume/som de notificação, assistente, intensidade do Liquid
 * Glass, reduzir transparência/movimento, tamanho do texto) também viram
 * variáveis/atributos CSS globais — nenhum é decorativo.
 */
export function useSettingsState() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [prefersDark, setPrefersDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage indisponível — segue só em memória.
    }
  }, [settings]);

  const effectiveTheme = resolveEffectiveTheme(settings.theme, prefersDark);

  // Tema global real (Fase 8): atributo no <html>, lido por todos os
  // tokens CSS — nenhum componente precisa remontar para refletir a troca.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme === 'claro' ? 'light' : 'dark');
  }, [effectiveTheme]);

  // "Intensidade/transparência" do material Liquid Glass — efeito real
  // sobre o blur/opacidade usados pelo cartão do Assistente de Voz e pelo
  // banner de Notificações. "Reduzir transparência" força opacidade alta e
  // desfoque mínimo, como no iOS.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.reduceTransparency) {
      root.style.setProperty('--ios-glass-blur', '4px');
      root.style.setProperty('--ios-glass-bg-dark', 'rgba(20, 20, 22, 0.97)');
      root.style.setProperty('--ios-glass-bg-light', 'rgba(255, 255, 255, 0.97)');
      return;
    }
    const pct = Math.max(0, Math.min(100, settings.glassIntensity)) / 100;
    root.style.setProperty('--ios-glass-blur', `${(6 + pct * 24).toFixed(0)}px`);
    root.style.setProperty('--ios-glass-bg-dark', `rgba(28, 28, 30, ${(0.35 + pct * 0.45).toFixed(2)})`);
    root.style.setProperty('--ios-glass-bg-light', `rgba(255, 255, 255, ${(0.35 + pct * 0.45).toFixed(2)})`);
  }, [settings.glassIntensity, settings.reduceTransparency]);

  // "Reduzir movimento": atributo próprio além do prefers-reduced-motion
  // do sistema, para o usuário desligar animações sem depender do SO.
  useEffect(() => {
    document.documentElement.setAttribute('data-reduce-motion', String(settings.reduceMotion));
  }, [settings.reduceMotion]);

  // "Tamanho do texto": escala real aplicada às classes tipográficas
  // (ver .ios-* em ios-tokens.css).
  useEffect(() => {
    document.documentElement.style.setProperty('--ios-text-scale', String(TEXT_SCALE[settings.textSize]));
  }, [settings.textSize]);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, update, effectiveTheme };
}

export type SettingsState = ReturnType<typeof useSettingsState>;
