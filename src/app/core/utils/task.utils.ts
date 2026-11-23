import { Task, TaskPriority, TaskStatus, STATUS_TRANSITIONS } from '../models/task.model';

/**
 * Pure function to check if a task is overdue.
 * An incomplete task (status !== 'Done') is overdue if its dueDate is before `today`.
 * Both `dueDate` and `today` are in ISO 'YYYY-MM-DD' format, allowing exact,
 * timezone-independent lexicographical comparison.
 *
 * @param task The task or task subset containing status and optional dueDate
 * @param today The reference date in 'YYYY-MM-DD' format
 * @returns boolean indicating whether task is overdue
 */
export function isOverdue(
  task: Pick<Task, 'status' | 'dueDate'>,
  today: string
): boolean {
  if (!task.dueDate) {
    return false;
  }
  if (task.status === 'Done') {
    return false;
  }
  return task.dueDate < today;
}

/**
 * Determines the next valid status in the transition cycle:
 * Todo -> In Progress -> Done -> Todo
 */
export function getNextStatus(status: TaskStatus): TaskStatus {
  const allowed = STATUS_TRANSITIONS[status];
  return allowed && allowed.length > 0 ? allowed[0] : 'Todo';
}

/**
 * Formats a Date object or timestamp into an ISO YYYY-MM-DD string
 * using local calendar components to prevent UTC date-shift timezone bugs.
 */
export function formatToLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates days difference between dueDate and today (in YYYY-MM-DD format).
 * Returns positive number of days overdue, or 0/negative if not overdue.
 */
export function getDaysOverdue(dueDate: string, today: string): number {
  if (!dueDate || !today) return 0;
  const due = new Date(dueDate + 'T00:00:00');
  const current = new Date(today + 'T00:00:00');
  const diffTime = current.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formats an ISO YYYY-MM-DD date string for user-friendly display.
 */
export function formatDisplayDate(isoDate?: string): string {
  if (!isoDate) return 'No due date';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
