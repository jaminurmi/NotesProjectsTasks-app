import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { nowIso, todayDate } from "./dates";
import { messages } from "./i18n";
import { applySettings, cacheSettings, readCachedSettings } from "./preferences";
import { emptyData, loadData, saveData } from "./storage";
import type { AppData, IdeaStatus, Language, TaskDraft, ThemeName, View } from "./types";

type SaveState = "idle" | "saving" | "saved" | "error";

interface AppContextValue {
  data: AppData;
  ready: boolean;
  loadError: string | null;
  saveState: SaveState;
  saveError: string | null;
  view: View;
  setView: (view: View) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  taskDraft: TaskDraft | null;
  setTaskDraft: (draft: TaskDraft | null) => void;
  createNote: () => void;
  updateNote: (id: string, patch: { title?: string; body?: string }) => void;
  deleteNote: (id: string) => void;
  createProject: () => void;
  updateProject: (id: string, patch: { name?: string; description?: string }) => void;
  deleteProject: (id: string) => void;
  addIdea: (projectId: string, text: string) => void;
  updateIdea: (projectId: string, ideaId: string, text: string) => void;
  setIdeaStatus: (projectId: string, ideaId: string, status: IdeaStatus) => void;
  deleteIdea: (projectId: string, ideaId: string) => void;
  createTaskFromIdea: (projectId: string, title: string) => void;
  upsertTask: (input: {
    id: string | null;
    title: string;
    details: string;
    startDate: string;
    endDate: string;
    deadline: string | null;
    projectId: string | null;
  }) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeName) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData());
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [view, setView] = useState<View>("notes");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadData()
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setSelectedNoteId(next.notes[0]?.id ?? null);
        setSelectedProjectId(next.projects[0]?.id ?? null);
        loaded.current = true;
        setReady(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const text = messages[readCachedSettings().language];
        const message = error instanceof Error ? error.message : "";
        setLoadError(message === "INVALID_DATA" ? text.invalidData : message || text.loadFailed);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const handle = window.setTimeout(() => {
      setSaveState("saving");
      saveData(data)
        .then(() => {
          setSaveState("saved");
          setSaveError(null);
        })
        .catch((error: unknown) => {
          setSaveState("error");
          setSaveError(error instanceof Error ? error.message : messages[data.settings.language].saveFailed);
        });
    }, 400);
    return () => window.clearTimeout(handle);
  }, [data]);

  useLayoutEffect(() => {
    const settings = ready ? data.settings : readCachedSettings();
    applySettings(settings);
    cacheSettings(settings);
  }, [ready, data.settings]);

  const touchProject = useCallback((projects: AppData["projects"], id: string) => {
    const updatedAt = nowIso();
    return projects.map((project) => (project.id === id ? { ...project, updatedAt } : project));
  }, []);

  const createNote = useCallback(() => {
    const stamp = nowIso();
    const note = {
      id: crypto.randomUUID(),
      title: "",
      body: "<p></p>",
      createdAt: stamp,
      updatedAt: stamp,
    };
    setData((prev) => ({ ...prev, notes: [note, ...prev.notes] }));
    setSelectedNoteId(note.id);
    setView("notes");
  }, []);

  const updateNote = useCallback((id: string, patch: { title?: string; body?: string }) => {
    const updatedAt = nowIso();
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((note) => (note.id === id ? { ...note, ...patch, updatedAt } : note)),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setData((prev) => ({ ...prev, notes: prev.notes.filter((note) => note.id !== id) }));
    setSelectedNoteId((current) => (current === id ? null : current));
  }, []);

  const createProject = useCallback(() => {
    const stamp = nowIso();
    const project = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      createdAt: stamp,
      updatedAt: stamp,
      ideas: [],
    };
    setData((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
    setSelectedProjectId(project.id);
    setView("projects");
  }, []);

  const updateProject = useCallback(
    (id: string, patch: { name?: string; description?: string }) => {
      const updatedAt = nowIso();
      setData((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === id ? { ...project, ...patch, updatedAt } : project,
        ),
      }));
    },
    [],
  );

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
      tasks: prev.tasks.map((task) =>
        task.projectId === id ? { ...task, projectId: null } : task,
      ),
    }));
    setSelectedProjectId((current) => (current === id ? null : current));
  }, []);

  const addIdea = useCallback(
    (projectId: string, text: string) => {
      const idea = {
        id: crypto.randomUUID(),
        text: text.trim(),
        createdAt: nowIso(),
        status: "open" as const,
      };
      setData((prev) => ({
        ...prev,
        projects: touchProject(prev.projects, projectId).map((project) =>
          project.id === projectId ? { ...project, ideas: [idea, ...project.ideas] } : project,
        ),
      }));
    },
    [touchProject],
  );

  const updateIdea = useCallback(
    (projectId: string, ideaId: string, text: string) => {
      setData((prev) => ({
        ...prev,
        projects: touchProject(prev.projects, projectId).map((project) =>
          project.id === projectId
            ? {
                ...project,
                ideas: project.ideas.map((idea) =>
                  idea.id === ideaId ? { ...idea, text: text.trim() } : idea,
                ),
              }
            : project,
        ),
      }));
    },
    [touchProject],
  );

  const setIdeaStatus = useCallback(
    (projectId: string, ideaId: string, status: IdeaStatus) => {
      setData((prev) => ({
        ...prev,
        projects: touchProject(prev.projects, projectId).map((project) =>
          project.id === projectId
            ? {
                ...project,
                ideas: project.ideas.map((idea) => (idea.id === ideaId ? { ...idea, status } : idea)),
              }
            : project,
        ),
      }));
    },
    [touchProject],
  );

  const deleteIdea = useCallback(
    (projectId: string, ideaId: string) => {
      setData((prev) => ({
        ...prev,
        projects: touchProject(prev.projects, projectId).map((project) =>
          project.id === projectId
            ? { ...project, ideas: project.ideas.filter((idea) => idea.id !== ideaId) }
            : project,
        ),
      }));
    },
    [touchProject],
  );

  const createTaskFromIdea = useCallback((projectId: string, title: string) => {
    const today = todayDate();
    setTaskDraft({
      editingId: null,
      title,
      details: "",
      projectId,
      startDate: today,
      endDate: today,
      deadline: "",
    });
    setView("tasks");
  }, []);

  const upsertTask = useCallback(
    (input: {
      id: string | null;
      title: string;
      details: string;
      startDate: string;
      endDate: string;
      deadline: string | null;
      projectId: string | null;
    }) => {
      setData((prev) => {
        if (input.id) {
          return {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === input.id
                ? {
                    ...task,
                    title: input.title.trim(),
                    details: input.details,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    deadline: input.deadline,
                    projectId: input.projectId,
                  }
                : task,
            ),
          };
        }
        return {
          ...prev,
          tasks: [
            {
              id: crypto.randomUUID(),
              title: input.title.trim(),
              details: input.details,
              startDate: input.startDate,
              endDate: input.endDate,
              deadline: input.deadline,
              projectId: input.projectId,
              completed: false,
              completedAt: null,
              createdAt: nowIso(),
            },
            ...prev.tasks,
          ],
        };
      });
    },
    [],
  );

  const toggleTask = useCallback((id: string) => {
    const stamp = nowIso();
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== id) return task;
        const completed = !task.completed;
        return { ...task, completed, completedAt: completed ? stamp : null };
      }),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => ({ ...prev, tasks: prev.tasks.filter((task) => task.id !== id) }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, language } }));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, theme } }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      ready,
      loadError,
      saveState,
      saveError,
      view,
      setView,
      selectedNoteId,
      setSelectedNoteId,
      selectedProjectId,
      setSelectedProjectId,
      taskDraft,
      setTaskDraft,
      createNote,
      updateNote,
      deleteNote,
      createProject,
      updateProject,
      deleteProject,
      addIdea,
      updateIdea,
      setIdeaStatus,
      deleteIdea,
      createTaskFromIdea,
      upsertTask,
      toggleTask,
      deleteTask,
      setLanguage,
      setTheme,
    }),
    [
      data,
      ready,
      loadError,
      saveState,
      saveError,
      view,
      selectedNoteId,
      selectedProjectId,
      taskDraft,
      createNote,
      updateNote,
      deleteNote,
      createProject,
      updateProject,
      deleteProject,
      addIdea,
      updateIdea,
      setIdeaStatus,
      deleteIdea,
      createTaskFromIdea,
      upsertTask,
      toggleTask,
      deleteTask,
      setLanguage,
      setTheme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider.");
  return context;
}
