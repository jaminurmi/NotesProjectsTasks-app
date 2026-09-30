import { AppProvider, useApp } from "./state";
import { messages } from "./i18n";
import { readCachedSettings } from "./preferences";
import { Sidebar } from "./components/Sidebar";
import { NotesView } from "./components/NotesView";
import { ProjectsView } from "./components/ProjectsView";
import { TasksView } from "./components/TasksView";
import { SettingsView } from "./components/SettingsView";
import "./App.css";

function Shell() {
  const { view, ready, loadError, data } = useApp();
  const text = messages[ready ? data.settings.language : readCachedSettings().language];

  if (loadError) {
    return (
      <div className="boot">
        <h1>{text.couldNotOpen}</h1>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="boot">
        <p>{text.loading}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <main>
        {view === "notes" ? <NotesView /> : null}
        {view === "projects" ? <ProjectsView /> : null}
        {view === "tasks" ? <TasksView /> : null}
        {view === "settings" ? <SettingsView /> : null}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
