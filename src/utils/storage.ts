import { SavePayload } from '../types/simulation';

const STORAGE_KEY = 'sushruta-secret-map-save';

export function saveSimulation(payload: SavePayload) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadSimulation(): SavePayload | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavePayload;
  } catch {
    return null;
  }
}
