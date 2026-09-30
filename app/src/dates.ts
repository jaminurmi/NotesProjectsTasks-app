import type { Language } from "./types";

export function todayDate(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

function locale(language: Language): string {
  return language === "fi" ? "fi-FI" : "en-GB";
}

export function formatDate(isoDate: string, language: Language): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString(locale(language), {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function formatStamp(iso: string, language: Language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(locale(language), {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
