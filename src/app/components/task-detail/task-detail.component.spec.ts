import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDetailComponent } from './task-detail.component';
import { TaskStore } from '../../core/store/task.store';
import { TaskRepository } from '../../core/repositories/task.repository';
import { MockTaskApi } from '../../core/repositories/mock-task-api.service';
import { Task } from '../../core/models/task.model';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;
  let store: TaskStore;

  const sampleTask: Task = {
    id: 'test-detail-1',
    title: 'Detail Review Task',
    description: 'Detailed description for modal testing',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '2026-12-31',
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TaskDetailComponent],
      providers: [
        TaskStore,
        MockTaskApi,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    }).compileComponents();

    store = TestBed.inject(TaskStore);
    fixture = TestBed.createComponent(TaskDetailComponent);
    component = fixture.componentInstance;
    component.task = sampleTask;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the detail component', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger store priority change when priority chip is clicked', async () => {
    spyOn(store, 'changeTaskPriority');
    await component.onChangePriority('High');
    expect(store.changeTaskPriority).toHaveBeenCalledWith('test-detail-1', 'High');
  });

  it('should trigger store advanceTaskStatus when advance button is clicked', async () => {
    spyOn(store, 'advanceTaskStatus');
    await component.onAdvanceStatus();
    expect(store.advanceTaskStatus).toHaveBeenCalledWith('test-detail-1');
  });

  it('should emit close on close button click', () => {
    spyOn(component.close, 'emit');
    component.close.emit();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
