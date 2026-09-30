import { useEffect, useMemo, useState } from "react";
import { formatDate, todayDate } from "../dates";
import { messages, statusText } from "../i18n";
import { useApp } from "../state";
import { IconButton } from "./IconButton";
import { matchesFilter, taskStatus } from "../taskStatus";
import type { TaskFilter } from "../types";

interface TaskFormState {
  editingId: string | null;
  title: string;
  details: string;
  projectId: string;
  startDate: string;
  endDate: string;
  deadline: string;
}

const filterIds: TaskFilter[] = ["all", "active", "upcoming", "overdue", "done"];

function blankForm(): TaskFormState {
  const today = todayDate();
  return {
    editingId: null,
    title: "",
    details: "",
    projectId: "",
    startDate: today,
    endDate: today,
    deadline: "",
  };
}

export function TasksView() {
  const { data, taskDraft, setTaskDraft, upsertTask, toggleTask, deleteTask } = useApp();
  const text = messages[data.settings.language];
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [form, setForm] = useState<TaskFormState>(blankForm);
  const [error, setError] = useState<string | null>(null);
  const today = todayDate();

  useEffect(() => {
    if (!taskDraft) return;
    setForm({
      editingId: taskDraft.editingId,
      title: taskDraft.title,
      details: taskDraft.details,
      projectId: taskDraft.projectId ?? "",
      startDate: taskDraft.startDate,
      endDate: taskDraft.endDate,
      deadline: taskDraft.deadline,
    });
    setError(null);
    setTaskDraft(null);
  }, [taskDraft, setTaskDraft]);

  const rows = useMemo(() => {
    const order = { overdue: 0, active: 1, upcoming: 2, ended: 3, done: 4 };
    return data.tasks
      .map((task) => ({ task, status: taskStatus(task, today) }))
      .filter((row) => matchesFilter(row.status, filter))
      .sort((a, b) => {
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return (
          a.task.startDate.localeCompare(b.task.startDate) ||
          a.task.title.localeCompare(b.task.title, data.settings.language)
        );
      });
  }, [data.tasks, data.settings.language, filter, today]);

  const counts = useMemo(() => {
    const next = { all: data.tasks.length, active: 0, upcoming: 0, overdue: 0, done: 0 };
    for (const task of data.tasks) {
      const status = taskStatus(task, today);
      if (status === "active" || status === "upcoming" || status === "overdue" || status === "done") {
        next[status] += 1;
      }
    }
    return next;
  }, [data.tasks, today]);

  function editTask(id: string) {
    const task = data.tasks.find((item) => item.id === id);
    if (!task) return;
    setForm({
      editingId: task.id,
      title: task.title,
      details: task.details,
      projectId: task.projectId ?? "",
      startDate: task.startDate,
      endDate: task.endDate,
      deadline: task.deadline ?? "",
    });
    setError(null);
  }

  return (
    <section className="tasks">
      <div className="pane-head">
        <h2>{form.editingId ? text.editTask : text.newTask}</h2>
        {form.editingId ? (
          <IconButton
            icon="x"
            label={text.cancelEdit}
            onClick={() => {
              setForm(blankForm());
              setError(null);
            }}
          />
        ) : null}
      </div>
      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.title.trim()) {
            setError(text.taskTitleRequired);
            return;
          }
          if (!form.startDate || !form.endDate) {
            setError(text.datesRequired);
            return;
          }
          if (form.endDate < form.startDate) {
            setError(text.endBeforeStart);
            return;
          }
          const deadline = form.deadline || null;
          const existing = form.editingId
            ? data.tasks.find((task) => task.id === form.editingId)
            : undefined;
          const nextStatus = taskStatus(
            {
              completed: existing?.completed ?? false,
              startDate: form.startDate,
              endDate: form.endDate,
              deadline,
            },
            today,
          );
          upsertTask({
            id: form.editingId,
            title: form.title,
            details: form.details.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            deadline,
            projectId: form.projectId || null,
          });
          if (!matchesFilter(nextStatus, filter)) setFilter("all");
          setForm(blankForm());
          setError(null);
        }}
      >
        <label className="field grow">
          <span>{text.title}</span>
          <input
            value={form.title}
            placeholder={text.whatToDo}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>{text.start}</span>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>{text.end}</span>
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>{text.deadline}</span>
          <input
            type="date"
            value={form.deadline}
            onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>{text.project}</span>
          <select
            value={form.projectId}
            onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
          >
            <option value="">{text.noProject}</option>
            {data.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name.trim() || text.untitledProject}
              </option>
            ))}
          </select>
        </label>
        <label className="field wide">
          <span>{text.description}</span>
          <textarea
            rows={2}
            value={form.details}
            placeholder={text.optionalDetail}
            onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
          />
        </label>
        <div className="form-actions">
          <IconButton
            icon={form.editingId ? "check" : "plus"}
            label={form.editingId ? text.saveChanges : text.addTask}
            className="primary"
            type="submit"
            showLabel={!form.editingId}
          />
          {form.deadline ? (
            <IconButton
              icon="x"
              label={text.clearDeadline}
              onClick={() => setForm((current) => ({ ...current, deadline: "" }))}
            />
          ) : null}
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <div className="filters" role="tablist" aria-label={text.filterTasks}>
        {filterIds.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={filter === id ? "active" : ""}
            onClick={() => setFilter(id)}
          >
            {text[id]}
            <span>{counts[id]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="empty">{text.noTasks}</p>
      ) : (
        <ul className="task-list">
          {rows.map(({ task, status }) => {
            const project = data.projects.find((item) => item.id === task.projectId);
            return (
              <li key={task.id} className={task.completed ? "task done" : "task"}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    aria-label={task.completed ? text.markUndone : text.markDone}
                    onChange={() => toggleTask(task.id)}
                  />
                </label>
                <div className="task-body">
                  <div className="task-title-row">
                    <h3>{task.title}</h3>
                    <span className={`status ${status}`}>{statusText(data.settings.language, status)}</span>
                  </div>
                  <p className="task-meta">
                    {formatDate(task.startDate, data.settings.language)} –{" "}
                    {formatDate(task.endDate, data.settings.language)}
                    {task.deadline
                      ? ` · ${text.deadline} ${formatDate(task.deadline, data.settings.language)}`
                      : ""}
                    {project ? ` · ${project.name.trim() || text.untitledProject}` : ""}
                  </p>
                  {task.details ? <p className="task-details">{task.details}</p> : null}
                </div>
                <div className="task-actions">
                  <IconButton icon="pencil" label={text.edit} onClick={() => editTask(task.id)} />
                  <IconButton
                    icon="trash"
                    label={text.delete}
                    className="danger"
                    onClick={() => {
                      if (window.confirm(text.deleteTaskConfirm)) deleteTask(task.id);
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
