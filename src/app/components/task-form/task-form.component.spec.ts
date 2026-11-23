import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form.component';
import { TaskStore } from '../../core/store/task.store';
import { TaskRepository } from '../../core/repositories/task.repository';
import { MockTaskApi } from '../../core/repositories/mock-task-api.service';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let store: TaskStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, ReactiveFormsModule],
      providers: [
        TaskStore,
        MockTaskApi,
        { provide: TaskRepository, useExisting: MockTaskApi }
      ]
    }).compileComponents();

    store = TestBed.inject(TaskStore);
    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with invalid empty title', () => {
    expect(component.taskForm.valid).toBeFalse();
    expect(component.titleControl?.valid).toBeFalse();
    expect(component.titleControl?.errors?.['required']).toBeTrue();
  });

  it('should reject whitespace-only titles', () => {
    component.titleControl?.setValue('     ');
    expect(component.titleControl?.invalid).toBeTrue();
    expect(component.titleControl?.errors?.['whitespaceOnly']).toBeTrue();
  });

  it('should reject titles shorter than 3 characters (trimmed)', () => {
    component.titleControl?.setValue('  ab  ');
    expect(component.titleControl?.invalid).toBeTrue();
    expect(component.titleControl?.errors?.['minlength']).toBeDefined();
  });

  it('should accept valid titles with length between 3 and 120 characters', () => {
    component.titleControl?.setValue('Design wireframes for mobile checkout');
    expect(component.titleControl?.valid).toBeTrue();
  });

  it('should preserve entered form values when save fails and display retry button', async () => {
    store.setFailNextSave(true);

    component.titleControl?.setValue('Preserved Task Name');
    component.descriptionControl?.setValue('Important description that must not be lost');
    component.setPriority('High');

    await component.onSubmit();

    // Verify form was NOT reset
    expect(component.titleControl?.value).toBe('Preserved Task Name');
    expect(component.descriptionControl?.value).toBe('Important description that must not be lost');
    expect(component.priorityControl?.value).toBe('High');

    // Verify error state
    expect(component.saveError()).not.toBeNull();
    expect(component.saveError()).toContain('Simulated network error');

    // Now disable failure and retry
    store.setFailNextSave(false);
    spyOn(component.formSaved, 'emit');

    await component.retrySave();

    expect(component.saveError()).toBeNull();
    expect(component.formSaved.emit).toHaveBeenCalled();
  });

  it('should guard against duplicate save while saving is in progress', async () => {
    component.titleControl?.setValue('Duplicate Test Title');
    component.saving.set(true);

    spyOn(store, 'createTask');
    await component.onSubmit();

    expect(store.createTask).not.toHaveBeenCalled();
  });
});
