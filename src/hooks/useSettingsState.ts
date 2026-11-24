import { useEffect, useState } from 'react';

export interface AppSettings {
  theme: 'escuro' | 'claro';
  masterVolume: number;
  notificationSound: boolean;
  assistantEnabled: boolean;
  assistantShowTranscript: boolean;
  glassIntensity: number;
}

const STORAGE_KEY = 'neoblade:settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'escuro',
  masterVolume: 80,
  notificationSound: true,
  assistantEnabled: true,
  assistantShowTranscript: true,
  glassIntensity: 70,
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

/**
 * Preferências do app, persistidas em localStorage (Fase 6). Cada valor
 * tem um efeito real e restrito ao que já existe: `theme` define o tema
 * inicial da tela de Navegação (único lugar com referência visual
 * clara/escura — as demais telas aprovadas continuam no visual escuro
 * original); `masterVolume`/`notificationSound` controlam o aviso sonoro
 * das Notificações; `assistantEnabled`/`assistantShowTranscript` controlam
 * o Assistente de Voz. Nenhuma opção aqui liga um recurso que não existe.
 */
export function useSettingsState() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage indisponível — segue só em memória.
    }
  }, [settings]);

  // "Intensidade/transparência" do material Liquid Glass (Fase 7) — efeito
  // real sobre o blur/opacidade usados pelo cartão do Assistente de Voz e
  // pelo banner de Notificações (ver src/styles/ios-tokens.css), não um
  // controle decorativo.
  useEffect(() => {
    const pct = Math.max(0, Math.min(100, settings.glassIntensity)) / 100;
    document.documentElement.style.setProperty('--ios-glass-blur', `${(6 + pct * 24).toFixed(0)}px`);
    document.documentElement.style.setProperty('--ios-glass-bg', `rgba(28, 28, 30, ${(0.35 + pct * 0.45).toFixed(2)})`);
  }, [settings.glassIntensity]);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, update };
}

export type SettingsState = ReturnType<typeof useSettingsState>;
