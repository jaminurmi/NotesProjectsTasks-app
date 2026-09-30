export type View = "notes" | "projects" | "tasks" | "settings";

export type Language = "en" | "fi";

export type ThemeName = "dark" | "light";

export interface Settings {
  language: Language;
  theme: ThemeName;
}

export type IdeaStatus = "open" | "added";

export interface Idea {
  id: string;
  text: string;
  createdAt: string;
  status: IdeaStatus;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ideas: Idea[];
}

export interface Task {
  id: string;
  title: string;
  details: string;
  startDate: string;
  endDate: string;
  deadline: string | null;
  completed: boolean;
  completedAt: string | null;
  projectId: string | null;
  createdAt: string;
}

export interface AppData {
  notes: Note[];
  projects: Project[];
  tasks: Task[];
  settings: Settings;
}

export interface TaskDraft {
  editingId: string | null;
  title: string;
  details: string;
  projectId: string | null;
  startDate: string;
  endDate: string;
  deadline: string;
}

export type TaskFilter = "all" | "active" | "upcoming" | "overdue" | "done";

export type TaskStatus = "done" | "overdue" | "upcoming" | "active" | "ended";
