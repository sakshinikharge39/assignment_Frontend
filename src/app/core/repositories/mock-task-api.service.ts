import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';
import { TaskRepository } from './task.repository';
import { formatToLocalISODate } from '../utils/task.utils';

const STORAGE_KEY = 'comzent_task_planner_tasks_v1';
const FAIL_TOGGLE_KEY = 'comzent_task_planner_fail_flag';
const SIMULATED_LATENCY_MS = 400;

@Injectable({
  providedIn: 'root'
})
export class MockTaskApi implements TaskRepository {
  private tasks: Task[] = [];
  private failNextSave = false;

  constructor() {
    this.initFailureFlag();
    this.initTasks();
  }

  private initFailureFlag(): void {
    try {
      const storedFlag = localStorage.getItem(FAIL_TOGGLE_KEY);
      this.failNextSave = storedFlag === 'true';
    } catch {
      this.failNextSave = false;
    }
  }

  private initTasks(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tasks = parsed;
          return;
        }
      }
    } catch {
      // Fallback to seeded data on parse error
    }
    this.tasks = this.generateSeedData();
    this.persist();
  }

  private generateSeedData(): Task[] {
    const today = new Date();

    const addDays = (days: number): string => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return formatToLocalISODate(d);
    };

    return [
      {
        id: 'task-101',
        title: 'Review quarterly team sprint deliverables',
        description: 'Audit completed pull requests, summarize team velocity, and prepare slide deck for the engineering sync.',
        priority: 'High',
        dueDate: addDays(-3), // Guaranteed overdue
        status: 'Todo',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 'task-102',
        title: 'Align Figma design system tokens with Tailwind CSS',
        description: 'Verify color tokens, typography scales, spacing scale, and dark mode contrast ratios across responsive viewports.',
        priority: 'Medium',
        dueDate: addDays(-1), // Also overdue
        status: 'In Progress',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'task-103',
        title: 'Complete accessibility audit for keyboard navigation',
        description: 'Ensure all buttons, dialogs, drawers, and form inputs meet WCAG AA guidelines with visible focus rings.',
        priority: 'High',
        dueDate: addDays(1),
        status: 'Todo',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'task-104',
        title: 'Setup Jasmine unit tests for reactive form validation',
        description: 'Verify required title, minLength(3), maxLength(120), and whitespace-only rejection.',
        priority: 'Medium',
        dueDate: addDays(4),
        status: 'In Progress',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'task-105',
        title: 'Finalize project kickoff brief and stakeholder checklist',
        description: 'Signed off by product management and distributed to client partners.',
        priority: 'Low',
        dueDate: addDays(-4),
        status: 'Done',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'task-106',
        title: 'Explore offline service worker caching strategy',
        description: 'Investigate indexedDB sync patterns and background fetch for mobile devices.',
        priority: 'Low',
        dueDate: undefined,
        status: 'Todo',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  getTasks(): Observable<Task[]> {
    const cloned = JSON.parse(JSON.stringify(this.tasks));
    return of(cloned).pipe(delay(SIMULATED_LATENCY_MS));
  }

  getTaskById(id: string): Observable<Task | undefined> {
    const found = this.tasks.find((t) => t.id === id);
    const cloned = found ? JSON.parse(JSON.stringify(found)) : undefined;
    return of(cloned).pipe(delay(SIMULATED_LATENCY_MS / 2));
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    if (this.failNextSave) {
      return throwError(
        () => new Error('Simulated network error: HTTP 503 Service Unavailable. The server failed to save the task.')
      ).pipe(delay(SIMULATED_LATENCY_MS));
    }

    const newTask: Task = {
      ...dto,
      id: 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };

    this.tasks = [newTask, ...this.tasks];
    this.persist();

    return of(JSON.parse(JSON.stringify(newTask))).pipe(delay(SIMULATED_LATENCY_MS));
  }

  updateTask(id: string, changes: UpdateTaskDto): Observable<Task> {
    if (this.failNextSave) {
      return throwError(
        () => new Error('Simulated network error: HTTP 500 Internal Server Error. The update operation could not be saved.')
      ).pipe(delay(SIMULATED_LATENCY_MS));
    }

    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Task with ID "${id}" was not found.`)).pipe(
        delay(SIMULATED_LATENCY_MS / 2)
      );
    }

    const updatedTask: Task = {
      ...this.tasks[index],
      ...changes,
      updatedAt: new Date().toISOString()
    };

    this.tasks[index] = updatedTask;
    this.persist();

    return of(JSON.parse(JSON.stringify(updatedTask))).pipe(delay(SIMULATED_LATENCY_MS));
  }

  deleteTask(id: string): Observable<void> {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.persist();
    return of(void 0).pipe(delay(SIMULATED_LATENCY_MS / 2));
  }

  isFailNextSaveEnabled(): boolean {
    return this.failNextSave;
  }

  setFailNextSave(fail: boolean): void {
    this.failNextSave = fail;
    try {
      localStorage.setItem(FAIL_TOGGLE_KEY, String(fail));
    } catch {}
  }

  resetToDefault(): Observable<Task[]> {
    this.tasks = this.generateSeedData();
    this.persist();
    return of(JSON.parse(JSON.stringify(this.tasks))).pipe(delay(SIMULATED_LATENCY_MS / 2));
  }
}
