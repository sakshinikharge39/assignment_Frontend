import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTaskDto, Task, TaskPriority, TaskStatus, UpdateTaskDto } from '../../core/models/task.model';
import { TaskStore } from '../../core/store/task.store';
import {
  trimmedMaxLengthValidator,
  trimmedMinLengthValidator,
  trimmedRequiredValidator
} from '../../core/validators/task.validators';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(TaskStore);

  @Input() taskToEdit?: Task | null = null;
  @Output() formClosed = new EventEmitter<void>();
  @Output() formSaved = new EventEmitter<Task>();

  taskForm!: FormGroup;

  // Local signals
  readonly saving = signal<boolean>(false);
  readonly saveError = signal<string | null>(null);
  readonly isSubmitted = signal<boolean>(false);

  readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
  readonly statuses: TaskStatus[] = ['Todo', 'In Progress', 'Done'];

  get isEditMode(): boolean {
    return !!this.taskToEdit;
  }

  get titleControl() {
    return this.taskForm.get('title');
  }

  get descriptionControl() {
    return this.taskForm.get('description');
  }

  get priorityControl() {
    return this.taskForm.get('priority');
  }

  get dueDateControl() {
    return this.taskForm.get('dueDate');
  }

  get statusControl() {
    return this.taskForm.get('status');
  }

  get titleCharCount(): number {
    const val = this.titleControl?.value;
    return val ? String(val).trim().length : 0;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: [
        this.taskToEdit?.title ?? '',
        [
          trimmedRequiredValidator(),
          trimmedMinLengthValidator(3),
          trimmedMaxLengthValidator(120)
        ]
      ],
      description: [this.taskToEdit?.description ?? ''],
      priority: [this.taskToEdit?.priority ?? 'Medium', [Validators.required]],
      dueDate: [this.taskToEdit?.dueDate ?? ''],
      status: [this.taskToEdit?.status ?? 'Todo', [Validators.required]]
    });
  }

  setPriority(priority: TaskPriority): void {
    this.priorityControl?.setValue(priority);
    this.priorityControl?.markAsDirty();
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted.set(true);

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    // Duplicate-save prevention: code guard
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    const formValues = this.taskForm.value;
    const trimmedTitle = String(formValues.title).trim();
    const trimmedDesc = formValues.description ? String(formValues.description).trim() : undefined;
    const dueDate = formValues.dueDate ? formValues.dueDate : undefined;

    try {
      let savedTask: Task;

      if (this.isEditMode && this.taskToEdit) {
        const updateDto: UpdateTaskDto = {
          title: trimmedTitle,
          description: trimmedDesc,
          priority: formValues.priority,
          dueDate: dueDate,
          status: formValues.status
        };
        savedTask = await this.store.updateTask(this.taskToEdit.id, updateDto);
      } else {
        const createDto: CreateTaskDto = {
          title: trimmedTitle,
          description: trimmedDesc,
          priority: formValues.priority,
          dueDate: dueDate,
          status: formValues.status
        };
        savedTask = await this.store.createTask(createDto);
      }

      // ONLY on success: clear error, reset/close form, and notify parent
      this.saveError.set(null);
      this.taskForm.reset();
      this.formSaved.emit(savedTask);
    } catch (err: any) {
      // Failed-save recovery: DO NOT reset or close form! Preserve values.
      const errorMsg =
        err?.message ||
        'Simulated network error: Unable to connect to server. Your changes have been preserved.';
      this.saveError.set(errorMsg);
    } finally {
      this.saving.set(false);
    }
  }

  retrySave(): Promise<void> {
    return this.onSubmit();
  }

  onCancel(): void {
    this.formClosed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('form-modal-backdrop')) {
      this.onCancel();
    }
  }
}
