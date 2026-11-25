import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { TaskStore } from '../../core/store/task.store';
import { formatDisplayDate, getDaysOverdue, getNextStatus, isOverdue } from '../../core/utils/task.utils';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
  private readonly store = inject(TaskStore);

  @Input({ required: true }) task!: Task;
  @Input() isSelected = false;

  @Output() selectTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();

  get isTaskOverdue(): boolean {
    return isOverdue(this.task, this.store.todayISO());
  }

  get overdueDays(): number {
    if (!this.task.dueDate) return 0;
    return getDaysOverdue(this.task.dueDate, this.store.todayISO());
  }

  get displayDueDate(): string {
    return formatDisplayDate(this.task.dueDate);
  }

  get nextStatus(): TaskStatus {
    return getNextStatus(this.task.status);
  }

  onAdvanceStatus(event: MouseEvent): void {
    event.stopPropagation();
    this.store.advanceTaskStatus(this.task.id);
  }
  
  onCardClick(): void {
    this.selectTask.emit(this.task.id);
  }

  onEditClick(event: MouseEvent): void {
    event.stopPropagation();
    this.editTask.emit(this.task);
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteTask.emit(this.task.id);
  }
}
