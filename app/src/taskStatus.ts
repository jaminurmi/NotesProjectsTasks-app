import type { Task, TaskFilter, TaskStatus } from "./types";

export function taskStatus(
  task: Pick<Task, "completed" | "startDate" | "endDate" | "deadline">,
  today: string,
): TaskStatus {
  if (task.completed) return "done";

  const deadlinePassed = task.deadline != null && task.deadline < today;
  const endPassed = task.endDate < today;
  if (deadlinePassed || (task.deadline == null && endPassed)) return "overdue";
  if (task.startDate > today) return "upcoming";
  if (task.startDate <= today && task.endDate >= today) return "active";
  return "ended";
}

export function matchesFilter(status: TaskStatus, filter: TaskFilter): boolean {
  if (filter === "all") return true;
  if (filter === "done") return status === "done";
  if (filter === "overdue") return status === "overdue";
  if (filter === "upcoming") return status === "upcoming";
  return status === "active";
}
