/**
 * Thin, typed localStorage wrapper. Every key is namespaced so this app never
 * collides with anything else running on the same origin.
 */
const PREFIX = "resonance:";

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  window.localStorage.removeItem(PREFIX + key);
}
