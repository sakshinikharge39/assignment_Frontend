import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TaskStore } from './core/store/task.store';
import { TaskRepository } from './core/repositories/task.repository';
import { MockTaskApi } from './core/repositories/mock-task-api.service';
import { ToastService } from './core/services/toast.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: TaskStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        TaskStore,
        MockTaskApi,
        ToastService,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    }).compileComponents();

    store = TestBed.inject(TaskStore);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the root app component', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the create task modal', () => {
    expect(component.isCreateModalOpen()).toBeFalse();
    component.openCreateModal();
    expect(component.isCreateModalOpen()).toBeTrue();
    component.closeFormModal();
    expect(component.isCreateModalOpen()).toBeFalse();
  });

  it('should filter for overdue work when callout is clicked', () => {
    component.filterForOverdue();
    expect(store.filter()).toBe('overdue');
  });
});
