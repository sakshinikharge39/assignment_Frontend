import { Observable } from 'rxjs';
import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';

/**
 * Abstract TaskRepository contract.
 * Decouples business logic and state management from the concrete data source / API implementation.
 */
export abstract class TaskRepository {
  /** Retrieves all tasks */
  abstract getTasks(): Observable<Task[]>;

  /** Retrieves a single task by its ID */
  abstract getTaskById(id: string): Observable<Task | undefined>;

  /** Creates and persists a new task */
  abstract createTask(task: CreateTaskDto): Observable<Task>;

  /** Updates an existing task with partial changes */
  abstract updateTask(id: string, changes: UpdateTaskDto): Observable<Task>;

  /** Deletes a task by ID */
  abstract deleteTask(id: string): Observable<void>;

  /** Checks if the failure simulation flag is active */
  abstract isFailNextSaveEnabled(): boolean;

  /** Toggles the failure simulation flag */
  abstract setFailNextSave(fail: boolean): void;

  /** Resets repository data to initial seeded state */
  abstract resetToDefault(): Observable<Task[]>;
}
