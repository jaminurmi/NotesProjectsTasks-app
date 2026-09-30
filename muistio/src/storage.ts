import { invoke } from "@tauri-apps/api/core";
import type { AppData, Idea, Note, Project, Settings, Task } from "./types";

export function defaultSettings(): Settings {
  return { language: "en", theme: "dark" };
}

export function normalizeSettings(value: unknown): Settings {
  const record = asRecord(value);
  return {
    language: record?.language === "fi" ? "fi" : "en",
    theme: record?.theme === "light" ? "light" : "dark",
  };
}

export function emptyData(): AppData {
  return { notes: [], projects: [], tasks: [], settings: defaultSettings() };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeNote(value: unknown): Note | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string") return null;
  return {
    id: record.id,
    title: asString(record.title),
    body: asString(record.body, "<p></p>"),
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt),
  };
}

function normalizeIdea(value: unknown): Idea | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string") return null;
  return {
    id: record.id,
    text: asString(record.text),
    createdAt: asString(record.createdAt),
    status: record.status === "added" ? "added" : "open",
  };
}

function normalizeProject(value: unknown): Project | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string") return null;
  const ideas = Array.isArray(record.ideas)
    ? record.ideas.flatMap((idea) => {
        const normalized = normalizeIdea(idea);
        return normalized ? [normalized] : [];
      })
    : [];
  return {
    id: record.id,
    name: asString(record.name),
    description: asString(record.description),
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt),
    ideas,
  };
}

function normalizeTask(value: unknown): Task | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string") return null;
  return {
    id: record.id,
    title: asString(record.title),
    details: asString(record.details),
    startDate: asString(record.startDate),
    endDate: asString(record.endDate),
    deadline: asNullableString(record.deadline),
    completed: record.completed === true,
    completedAt: asNullableString(record.completedAt),
    projectId: asNullableString(record.projectId),
    createdAt: asString(record.createdAt),
  };
}

export function normalizeData(raw: unknown): AppData {
  const record = asRecord(raw);
  if (!record) throw new Error("INVALID_DATA");
  const notes = Array.isArray(record.notes) ? record.notes : [];
  const projects = Array.isArray(record.projects) ? record.projects : [];
  const tasks = Array.isArray(record.tasks) ? record.tasks : [];
  return {
    notes: notes.flatMap((note) => {
      const normalized = normalizeNote(note);
      return normalized ? [normalized] : [];
    }),
    projects: projects.flatMap((project) => {
      const normalized = normalizeProject(project);
      return normalized ? [normalized] : [];
    }),
    tasks: tasks.flatMap((task) => {
      const normalized = normalizeTask(task);
      return normalized ? [normalized] : [];
    }),
    settings: normalizeSettings(record.settings),
  };
}

export async function loadData(): Promise<AppData> {
  const raw = await invoke<string>("load_data");
  return normalizeData(JSON.parse(raw));
}

export async function saveData(data: AppData): Promise<void> {
  await invoke("save_data", { contents: JSON.stringify(data) });
}
