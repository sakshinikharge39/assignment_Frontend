import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockTaskApi } from './mock-task-api.service';

describe('MockTaskApi', () => {
  let service: MockTaskApi;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [MockTaskApi]
    });
    service = TestBed.inject(MockTaskApi);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should seed initial tasks when localStorage is empty', async () => {
    const tasks = await firstValueFrom(service.getTasks());
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.some((t) => t.id === 'task-101')).toBeTrue();
  });

  it('should persist new tasks to localStorage', async () => {
    const newTask = await firstValueFrom(
      service.createTask({
        title: 'New Persisted Task',
        description: 'Test details',
        priority: 'High',
        status: 'Todo',
        dueDate: '2026-12-01'
      })
    );

    expect(newTask.id).toBeDefined();
    const tasks = await firstValueFrom(service.getTasks());
    expect(tasks.some((t) => t.id === newTask.id)).toBeTrue();

    // Check localStorage directly
    const stored = localStorage.getItem('comzent_task_planner_tasks_v1');
    expect(stored).toContain(newTask.id);
  });

  it('should fail save when failure simulation is enabled', async () => {
    service.setFailNextSave(true);
    expect(service.isFailNextSaveEnabled()).toBeTrue();

    try {
      await firstValueFrom(
        service.createTask({
          title: 'Should Fail',
          priority: 'Medium',
          status: 'Todo'
        })
      );
      fail('Expected save to throw error');
    } catch (err: any) {
      expect(err.message).toContain('Simulated network error');
    }
  });

  it('should succeed save after failure simulation is disabled (retry recovery)', async () => {
    service.setFailNextSave(true);

    try {
      await firstValueFrom(
        service.createTask({
          title: 'Failing Attempt',
          priority: 'Low',
          status: 'Todo'
        })
      );
      fail('Expected save to throw error');
    } catch (err) {
      // Expected failure
    }

    // Toggle off failure simulation (simulating user toggling switch off and retrying)
    service.setFailNextSave(false);

    const successful = await firstValueFrom(
      service.createTask({
        title: 'Failing Attempt',
        priority: 'Low',
        status: 'Todo'
      })
    );

    expect(successful.title).toBe('Failing Attempt');
    const tasks = await firstValueFrom(service.getTasks());
    expect(tasks.some((t) => t.id === successful.id)).toBeTrue();
  });

  it('should update task status and priority', async () => {
    const tasks = await firstValueFrom(service.getTasks());
    const target = tasks[0];

    const updated = await firstValueFrom(
      service.updateTask(target.id, {
        status: 'In Progress',
        priority: 'High'
      })
    );

    expect(updated.status).toBe('In Progress');
    expect(updated.priority).toBe('High');
  });
});
