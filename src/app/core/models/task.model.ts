export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export type TaskFilter = 'all' | 'overdue' | 'todo' | 'in-progress' | 'done';

export type TaskSortField = 'dueDate' | 'priority' | 'title' | 'status';

export type TaskSortDirection = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string; // Stored as ISO string YYYY-MM-DD to avoid timezone bugs
  status: TaskStatus;
  createdAt: string; // ISO 8601 string
  updatedAt?: string;
}

export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTaskDto = Partial<CreateTaskDto>;

/**
 * Status transition map:
 * Todo -> In Progress -> Done
 * Done -> Todo (reopen)
 */
export const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  'Todo': ['In Progress'],
  'In Progress': ['Done'],
  'Done': ['Todo']
};

/**
 * Priority ranking for sorting
 */
export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  'High': 3,
  'Medium': 2,
  'Low': 1
};
