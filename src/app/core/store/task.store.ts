import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CreateTaskDto,
  PRIORITY_WEIGHTS,
  STATUS_TRANSITIONS,
  Task,
  TaskFilter,
  TaskPriority,
  TaskSortDirection,
  TaskSortField,
  TaskStatus,
  UpdateTaskDto
} from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';
import { formatToLocalISODate, getNextStatus, isOverdue } from '../utils/task.utils';

@Injectable({
  providedIn: 'root'
})
export class TaskStore {
  private readonly repository = inject(TaskRepository);

  // Core State Signals
  readonly tasks = signal<Task[]>([]);
  readonly filter = signal<TaskFilter>('all');
  readonly searchQuery = signal<string>('');
  readonly sortField = signal<TaskSortField>('dueDate');
  readonly sortDirection = signal<TaskSortDirection>('asc');
  readonly selectedTaskId = signal<string | null>(null);
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly failNextSave = signal<boolean>(this.repository.isFailNextSaveEnabled());
  readonly todayISO = signal<string>(formatToLocalISODate());

  // Computed State
  readonly selectedTask = computed(() => {
    const id = this.selectedTaskId();
    if (!id) return null;
    return this.tasks().find((t) => t.id === id) ?? null;
  });

  readonly counts = computed(() => {
    const list = this.tasks();
    const today = this.todayISO();
    return {
      total: list.length,
      overdue: list.filter((t) => isOverdue(t, today)).length,
      todo: list.filter((t) => t.status === 'Todo').length,
      inProgress: list.filter((t) => t.status === 'In Progress').length,
      done: list.filter((t) => t.status === 'Done').length
    };
  });

  readonly filteredTasks = computed(() => {
    const currentFilter = this.filter();
    const query = this.searchQuery().trim().toLowerCase();
    const today = this.todayISO();
    const field = this.sortField();
    const direction = this.sortDirection();

    // 1. Filter
    let list = this.tasks().filter((task) => {
      // Status & Overdue filter
      if (currentFilter === 'overdue') {
        if (!isOverdue(task, today)) return false;
      } else if (currentFilter === 'todo') {
        if (task.status !== 'Todo') return false;
      } else if (currentFilter === 'in-progress') {
        if (task.status !== 'In Progress') return false;
      } else if (currentFilter === 'done') {
        if (task.status !== 'Done') return false;
      }

      // Search query filter (title or description)
      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description ?? '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });

    // 2. Sort
    list = [...list].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'dueDate': {
          // Tasks without due date placed at the end
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.localeCompare(b.dueDate);
          break;
        }
        case 'priority': {
          const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
          const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
          comparison = weightB - weightA; // High priority first by default
          break;
        }
        case 'title': {
          comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          break;
        }
        case 'status': {
          const statusOrder: Record<TaskStatus, number> = {
            'Todo': 1,
            'In Progress': 2,
            'Done': 3
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return list;
  });

  constructor() {
    this.loadTasks();
  }

  /**
   * Loads all tasks from the repository
   */
  async loadTasks(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const items = await firstValueFrom(this.repository.getTasks());
      this.tasks.set(items);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load tasks');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Creates a new task with duplicate-save prevention
   */
  async createTask(dto: CreateTaskDto): Promise<Task> {
    // Duplicate save prevention code guard
    if (this.saving()) {
      return Promise.reject(new Error('Save already in progress. Please wait.'));
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      const created = await firstValueFrom(this.repository.createTask(dto));
      this.tasks.update((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to save task';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Updates an existing task with duplicate-save prevention
   */
  async updateTask(id: string, changes: UpdateTaskDto): Promise<Task> {
    if (this.saving()) {
      return Promise.reject(new Error('Save already in progress. Please wait.'));
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      const updated = await firstValueFrom(this.repository.updateTask(id, changes));
      this.tasks.update((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update task';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Advances task status according to defined transition cycle:
   * Todo -> In Progress -> Done -> Todo
   */
  async advanceTaskStatus(id: string): Promise<Task> {
    const task = this.tasks().find((t) => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    const nextStatus = getNextStatus(task.status);
    return this.updateTask(id, { status: nextStatus });
  }

  /**
   * Changes task priority directly
   */
  async changeTaskPriority(id: string, priority: TaskPriority): Promise<Task> {
    return this.updateTask(id, { priority });
  }

  /**
   * Deletes a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await firstValueFrom(this.repository.deleteTask(id));
      this.tasks.update((prev) => prev.filter((t) => t.id !== id));
      if (this.selectedTaskId() === id) {
        this.selectedTaskId.set(null);
      }
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to delete task');
      throw err;
    }
  }

  /**
   * Toggles failure simulation
   */
  setFailNextSave(enable: boolean): void {
    this.repository.setFailNextSave(enable);
    this.failNextSave.set(enable);
  }

  /**
   * Filter controls
   */
  setFilter(filter: TaskFilter): void {
    this.filter.set(filter);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSort(field: TaskSortField, direction?: TaskSortDirection): void {
    if (direction) {
      this.sortDirection.set(direction);
    } else if (this.sortField() === field) {
      // Toggle direction if same field clicked
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortDirection.set('asc');
    }
    this.sortField.set(field);
  }

  selectTask(id: string | null): void {
    this.selectedTaskId.set(id);
  }

  clearError(): void {
    this.error.set(null);
  }

  /**
   * Resets data to initial demo seed
   */
  async resetToDefault(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const seeded = await firstValueFrom(this.repository.resetToDefault());
      this.tasks.set(seeded);
      this.selectedTaskId.set(null);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to reset tasks');
    } finally {
      this.loading.set(false);
    }
  }
}
