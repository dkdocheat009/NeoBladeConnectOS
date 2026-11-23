import { useEffect, useState } from 'react';

const STORAGE_KEY = 'neoblade:removedHomeApps';

function loadRemovedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Persists which Home shortcuts were removed by the user (edit mode). */
export function useRemovedApps() {
  const [removedIds, setRemovedIds] = useState<string[]>(loadRemovedIds);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(removedIds));
    } catch {
      // localStorage indisponível (modo privado, etc.) — segue só em memória.
    }
  }, [removedIds]);

  const removeApp = (id: string) => {
    setRemovedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const restoreAll = () => setRemovedIds([]);

  const restoreOne = (id: string) => {
    setRemovedIds((prev) => prev.filter((removedId) => removedId !== id));
  };

  return { removedIds, removeApp, restoreAll, restoreOne };
}
