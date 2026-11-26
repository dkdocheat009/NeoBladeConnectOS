// tools/GERAR_MAPA_ETS2.ps1 copies the real ETS2 GeoJSON it generates
// (via truckermudgeon/maps, GPL-3.0 — run against the user's own game
// install) into src/integrations/ets2/map-data/, gitignored because it's
// derived from the user's own licensed game data (see
// docs/ETS2_ARCHITECTURE.md, "Mapa real"). import.meta.glob with
// `eager: false` means this reference compiles fine whether or not that
// folder exists at build time — Vite only actually resolves each module
// the first time something calls the loader function it returns.
const geoJsonModules = import.meta.glob('./map-data/*.geojson', { eager: false, query: '?raw', import: 'default' });

export function hasGeneratedMapData(): boolean {
  return Object.keys(geoJsonModules).length > 0;
}

/**
 * Loads the first generated GeoJSON file found (today that's just the
 * Europe roads/prefabs layer GERAR_MAPA_ETS2.ps1 produces). Returns null
 * when nothing was ever generated — callers MUST fall back to the
 * existing mock map in that case, never show an empty map as if it were
 * real data.
 */
export interface MinimalGeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{ type: 'Feature'; geometry: unknown; properties: Record<string, unknown> | null }>;
}

export async function loadGeneratedMapGeoJson(): Promise<MinimalGeoJsonFeatureCollection | null> {
  const [path] = Object.keys(geoJsonModules);
  if (!path) return null;
  try {
    const raw = (await geoJsonModules[path]()) as string;
    return JSON.parse(raw) as MinimalGeoJsonFeatureCollection;
  } catch {
    return null;
  }
}
