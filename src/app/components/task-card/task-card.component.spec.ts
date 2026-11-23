import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { TaskStore } from '../../core/store/task.store';
import { TaskRepository } from '../../core/repositories/task.repository';
import { MockTaskApi } from '../../core/repositories/mock-task-api.service';
import { Task } from '../../core/models/task.model';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;
  let store: TaskStore;

  const sampleTask: Task = {
    id: 'test-1',
    title: 'Test Component Task',
    description: 'Unit test description',
    priority: 'High',
    status: 'Todo',
    dueDate: '2020-01-01', // definitely overdue
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [
        TaskStore,
        MockTaskApi,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    }).compileComponents();

    store = TestBed.inject(TaskStore);
    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = sampleTask;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should identify overdue task correctly', () => {
    expect(component.isTaskOverdue).toBeTrue();
    expect(component.overdueDays).toBeGreaterThan(0);
  });

  it('should emit selectTask when card is clicked', () => {
    spyOn(component.selectTask, 'emit');
    component.onCardClick();
    expect(component.selectTask.emit).toHaveBeenCalledWith('test-1');
  });

  it('should advance task status when advance button is clicked', () => {
    spyOn(store, 'advanceTaskStatus');
    const fakeEvent = new MouseEvent('click');
    component.onAdvanceStatus(fakeEvent);
    expect(store.advanceTaskStatus).toHaveBeenCalledWith('test-1');
  });
});
