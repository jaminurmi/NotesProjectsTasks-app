import { messages } from "../i18n";
import { useApp } from "../state";
import type { View } from "../types";

const items: { id: View; label: "notes" | "projects" | "tasks" }[] = [
  { id: "notes", label: "notes" },
  { id: "projects", label: "projects" },
  { id: "tasks", label: "tasks" },
];

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function Sidebar() {
  const { view, setView, saveState, saveError, data } = useApp();
  const text = messages[data.settings.language];

  const saveLabel =
    saveState === "saving"
      ? text.saving
      : saveState === "error"
        ? text.saveFailed
        : saveState === "saved"
          ? text.saved
          : text.ready;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div>
          <h1>{text.appName}</h1>
          <p className="brand-sub">{text.tagline}</p>
        </div>
      </div>
      <nav aria-label={text.sections}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={view === item.id ? "nav-item active" : "nav-item"}
            aria-current={view === item.id ? "page" : undefined}
            onClick={() => setView(item.id)}
          >
            {text[item.label]}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <button
          type="button"
          className={view === "settings" ? "nav-item icon-nav active" : "nav-item icon-nav"}
          aria-label={text.settings}
          title={text.settings}
          aria-current={view === "settings" ? "page" : undefined}
          onClick={() => setView("settings")}
        >
          <SettingsIcon />
        </button>
        <p className={saveState === "error" ? "save-status error" : "save-status"} role="status">
          {saveLabel}
          {saveError ? <span className="save-detail">{saveError}</span> : null}
        </p>
      </div>
    </aside>
  );
}
