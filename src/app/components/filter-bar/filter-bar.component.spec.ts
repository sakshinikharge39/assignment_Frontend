import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBarComponent } from './filter-bar.component';
import { TaskStore } from '../../core/store/task.store';
import { TaskRepository } from '../../core/repositories/task.repository';
import { MockTaskApi } from '../../core/repositories/mock-task-api.service';

describe('FilterBarComponent', () => {
  let component: FilterBarComponent;
  let fixture: ComponentFixture<FilterBarComponent>;
  let store: TaskStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FilterBarComponent],
      providers: [
        TaskStore,
        MockTaskApi,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    }).compileComponents();

    store = TestBed.inject(TaskStore);
    fixture = TestBed.createComponent(FilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the filter bar component', () => {
    expect(component).toBeTruthy();
  });

  it('should update filter on selection', () => {
    component.onSelectFilter('overdue');
    expect(store.filter()).toBe('overdue');
  });

  it('should clear search query', () => {
    store.setSearchQuery('Sprint');
    expect(store.searchQuery()).toBe('Sprint');
    component.clearSearch();
    expect(store.searchQuery()).toBe('');
  });
});
