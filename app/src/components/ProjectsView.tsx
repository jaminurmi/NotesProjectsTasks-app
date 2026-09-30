import { useEffect, useState } from "react";
import { ideaCount, messages } from "../i18n";
import { useApp } from "../state";
import { IconButton } from "./IconButton";
import type { Idea } from "../types";

function IdeaRow({ projectId, idea }: { projectId: string; idea: Idea }) {
  const { updateIdea, setIdeaStatus, deleteIdea, createTaskFromIdea, data } = useApp();
  const copy = messages[data.settings.language];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(idea.text);

  function save() {
    const next = draft.trim();
    if (!next) return;
    updateIdea(projectId, idea.id, next);
    setEditing(false);
  }

  return (
    <li className={idea.status === "added" ? "idea added" : "idea"}>
      {editing ? (
        <form
          className="idea-edit"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <input
            value={draft}
            aria-label={copy.editIdea}
            onChange={(event) => setDraft(event.target.value)}
          />
          <IconButton icon="check" label={copy.save} className="primary" type="submit" />
          <IconButton
            icon="x"
            label={copy.cancel}
            onClick={() => {
              setDraft(idea.text);
              setEditing(false);
            }}
          />
        </form>
      ) : (
        <>
          <p>{idea.text}</p>
          <div className="idea-actions">
            {idea.status === "added" ? <span className="badge">{copy.added}</span> : null}
            <IconButton icon="pencil" label={copy.edit} onClick={() => setEditing(true)} />
            <button
              type="button"
              onClick={() =>
                setIdeaStatus(projectId, idea.id, idea.status === "added" ? "open" : "added")
              }
            >
              {idea.status === "added" ? copy.reopen : copy.markAdded}
            </button>
            <button type="button" onClick={() => createTaskFromIdea(projectId, idea.text)}>
              {copy.createTask}
            </button>
            <IconButton
              icon="trash"
              label={copy.delete}
              className="danger"
              onClick={() => {
                if (window.confirm(copy.deleteIdeaConfirm)) deleteIdea(projectId, idea.id);
              }}
            />
          </div>
        </>
      )}
    </li>
  );
}

export function ProjectsView() {
  const {
    data,
    selectedProjectId,
    setSelectedProjectId,
    createProject,
    updateProject,
    deleteProject,
    addIdea,
  } = useApp();
  const text = messages[data.settings.language];
  const [ideaText, setIdeaText] = useState("");
  const project = data.projects.find((item) => item.id === selectedProjectId) ?? null;

  useEffect(() => {
    setIdeaText("");
  }, [selectedProjectId]);

  if (data.projects.length === 0) {
    return (
      <section className="empty-screen">
        <p>{text.createProjectPrompt}</p>
        <IconButton icon="plus" label={text.newProject} className="primary" onClick={createProject} />
      </section>
    );
  }

  return (
    <section className="split">
      <div className="list-pane">
        <div className="pane-head">
          <h2>{text.projects}</h2>
          <IconButton icon="plus" label={text.new} className="primary" onClick={createProject} />
        </div>
        {data.projects.length === 0 ? (
          <p className="empty">{text.noProjects}</p>
        ) : (
          <ul className="item-list">
            {data.projects.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === selectedProjectId ? "item active" : "item"}
                  onClick={() => setSelectedProjectId(item.id)}
                >
                  <span className="item-title">{item.name.trim() || text.untitledProject}</span>
                  <span className="item-meta">{ideaCount(data.settings.language, item.ideas.length)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="detail-pane">
        {project ? (
          <div className="project-detail">
            <div className="detail-actions">
              <IconButton
                icon="trash"
                label={text.deleteProject}
                className="danger"
                onClick={() => {
                  if (window.confirm(text.deleteProjectConfirm)) deleteProject(project.id);
                }}
              />
            </div>
            <label className="field">
              <span>{text.name}</span>
              <input
                value={project.name}
                placeholder={text.projectName}
                onChange={(event) => updateProject(project.id, { name: event.target.value })}
              />
            </label>
            <label className="field">
              <span>{text.description}</span>
              <textarea
                rows={4}
                value={project.description}
                placeholder={text.projectAbout}
                onChange={(event) =>
                  updateProject(project.id, { description: event.target.value })
                }
              />
            </label>
            <section className="ideas">
              <h3>{text.wantToAdd}</h3>
              <form
                className="idea-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const text = ideaText.trim();
                  if (!text) return;
                  addIdea(project.id, text);
                  setIdeaText("");
                }}
              >
                <input
                  value={ideaText}
                  placeholder={text.newIdea}
                  aria-label={text.newIdea}
                  onChange={(event) => setIdeaText(event.target.value)}
                />
                <IconButton icon="plus" label={text.add} className="primary" type="submit" />
              </form>
              {project.ideas.length === 0 ? (
                <p className="empty">{text.noIdeas}</p>
              ) : (
                <ul className="idea-list">
                  {project.ideas.map((idea) => (
                    <IdeaRow key={idea.id} projectId={project.id} idea={idea} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : (
          <div className="placeholder">
            <p>{text.pickProject}</p>
            <IconButton icon="plus" label={text.newProject} className="primary" onClick={createProject} />
          </div>
        )}
      </div>
    </section>
  );
}
