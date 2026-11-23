import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { TaskStore } from '../../core/store/task.store';
import { formatDisplayDate, getDaysOverdue, getNextStatus, isOverdue } from '../../core/utils/task.utils';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent {
  readonly store = inject(TaskStore);

  @Input({ required: true }) task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Task>();

  readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High'];

  get isTaskOverdue(): boolean {
    return isOverdue(this.task, this.store.todayISO());
  }

  get overdueDays(): number {
    if (!this.task.dueDate) return 0;
    return getDaysOverdue(this.task.dueDate, this.store.todayISO());
  }

  get formattedDueDate(): string {
    return formatDisplayDate(this.task.dueDate);
  }

  get nextStatus(): TaskStatus {
    return getNextStatus(this.task.status);
  }

  get advanceButtonLabel(): string {
    if (this.task.status === 'Todo') return 'Start Task (Move to In Progress)';
    if (this.task.status === 'In Progress') return 'Complete Task (Mark as Done)';
    return 'Reopen Task (Move to Todo)';
  }

  async onChangePriority(priority: TaskPriority): Promise<void> {
    if (this.task.priority === priority) return;
    try {
      await this.store.changeTaskPriority(this.task.id, priority);
    } catch (e) {
      console.error('Failed to change priority', e);
    }
  }

  async onAdvanceStatus(): Promise<void> {
    try {
      await this.store.advanceTaskStatus(this.task.id);
    } catch (e) {
      console.error('Failed to advance status', e);
    }
  }

  onEdit(): void {
    this.edit.emit(this.task);
  }

  async onDelete(): Promise<void> {
    if (confirm(`Are you sure you want to delete "${this.task.title}"?`)) {
      await this.store.deleteTask(this.task.id);
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) {
      this.close.emit();
    }
  }
}
