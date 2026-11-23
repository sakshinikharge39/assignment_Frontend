import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskStore } from '../../core/store/task.store';
import { TaskRepository } from '../../core/repositories/task.repository';
import { MockTaskApi } from '../../core/repositories/mock-task-api.service';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let store: TaskStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        TaskStore,
        MockTaskApi,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    }).compileComponents();

    store = TestBed.inject(TaskStore);
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the task list component', () => {
    expect(component).toBeTruthy();
  });

  it('should render task list when tasks exist', async () => {
    await store.loadTasks();
    fixture.detectChanges();
    expect(component.tasks().length).toBeGreaterThan(0);
  });

  it('should emit selectTask when a task is selected', () => {
    spyOn(component.selectTask, 'emit');
    component.onSelectTask('task-101');
    expect(component.selectTask.emit).toHaveBeenCalledWith('task-101');
    expect(store.selectedTaskId()).toBe('task-101');
  });
});
