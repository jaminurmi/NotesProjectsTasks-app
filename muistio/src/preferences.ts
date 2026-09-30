import { defaultSettings, normalizeSettings } from "./storage";
import type { Settings } from "./types";

const STORAGE_KEY = "muistio-settings";

export function readCachedSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return defaultSettings();
  }
}

export function cacheSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applySettings(settings: Settings) {
  document.documentElement.dataset.theme = settings.theme;
  document.documentElement.lang = settings.language;
  document.title = settings.language === "fi" ? "Muistio" : "Notes";
}
