import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { TaskStore } from '../../core/store/task.store';
import { TaskRepository } from '../../core/repositories/task.repository';
import { MockTaskApi } from '../../core/repositories/mock-task-api.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: TaskStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        TaskStore,
        MockTaskApi,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    }).compileComponents();

    store = TestBed.inject(TaskStore);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle failure simulation flag', () => {
    const initial = component.failNextSave();
    component.toggleFailureSimulation();
    expect(component.failNextSave()).toBe(!initial);
  });
});
