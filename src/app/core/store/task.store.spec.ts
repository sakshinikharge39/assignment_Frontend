import { TestBed } from '@angular/core/testing';
import { TaskRepository } from '../repositories/task.repository';
import { MockTaskApi } from '../repositories/mock-task-api.service';
import { TaskStore } from './task.store';

describe('TaskStore', () => {
  let store: TaskStore;
  let api: MockTaskApi;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        MockTaskApi,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    });

    api = TestBed.inject(MockTaskApi);
    store = TestBed.inject(TaskStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with seeded tasks and computed counts', async () => {
    await store.loadTasks();
    const tasks = store.tasks();
    expect(tasks.length).toBeGreaterThan(0);
    const counts = store.counts();
    expect(counts.total).toBe(tasks.length);
    expect(counts.overdue).toBeGreaterThan(0);
  });

  it('should filter overdue tasks accurately', async () => {
    await store.loadTasks();
    store.setFilter('overdue');
    const filtered = store.filteredTasks();
    expect(filtered.length).toBeGreaterThan(0);
    for (const task of filtered) {
      expect(task.status).not.toBe('Done');
      expect(task.dueDate! < store.todayISO()).toBeTrue();
    }
  });

  it('should advance status according to Todo -> In Progress -> Done -> Todo', async () => {
    await store.loadTasks();
    // Find or create a Todo task
    const task = store.tasks().find((t) => t.status === 'Todo');
    expect(task).toBeDefined();

    // 1. Advance Todo -> In Progress
    const step1 = await store.advanceTaskStatus(task!.id);
    expect(step1.status).toBe('In Progress');

    // 2. Advance In Progress -> Done
    const step2 = await store.advanceTaskStatus(task!.id);
    expect(step2.status).toBe('Done');

    // 3. Reopen Done -> Todo
    const step3 = await store.advanceTaskStatus(task!.id);
    expect(step3.status).toBe('Todo');
  });

  it('should change task priority directly', async () => {
    await store.loadTasks();
    const task = store.tasks()[0];
    const updated = await store.changeTaskPriority(task.id, 'High');
    expect(updated.priority).toBe('High');
  });

  it('should prevent duplicate saves when saving is in progress', async () => {
    // Manually mark saving as true
    (store.saving as any).set(true);

    try {
      await store.createTask({
        title: 'Concurrent Save Test',
        priority: 'Low',
        status: 'Todo'
      });
      fail('Expected concurrent save to be rejected');
    } catch (err: any) {
      expect(err.message).toContain('Save already in progress');
    } finally {
      (store.saving as any).set(false);
    }
  });

  it('should retain error state on failed save and clear on clearError', async () => {
    store.setFailNextSave(true);

    try {
      await store.createTask({
        title: 'Will Fail',
        priority: 'High',
        status: 'Todo'
      });
      fail('Expected save to fail');
    } catch (err) {
      expect(store.error()).not.toBeNull();
      expect(store.error()).toContain('Simulated network error');
    }

    store.clearError();
    expect(store.error()).toBeNull();
  });
});
