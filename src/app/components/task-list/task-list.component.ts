import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../core/models/task.model';
import { TaskStore } from '../../core/store/task.store';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent {
  readonly store = inject(TaskStore);

  readonly tasks = this.store.filteredTasks;
  readonly loading = this.store.loading;
  readonly filter = this.store.filter;
  readonly searchQuery = this.store.searchQuery;
  readonly selectedTaskId = this.store.selectedTaskId;

  @Output() selectTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() createTask = new EventEmitter<void>();

  onSelectTask(id: string): void {
    this.store.selectTask(id);
    this.selectTask.emit(id);
  }

  onEditTask(task: Task): void {
    this.editTask.emit(task);
  }

  async onDeleteTask(id: string): Promise<void> {
    const target = this.store.tasks().find((t) => t.id === id);
    const title = target ? `"${target.title}"` : 'this task';
    if (confirm(`Are you sure you want to delete ${title}?`)) {
      await this.store.deleteTask(id);
    }
  }

  onCreateFirstTask(): void {
    this.createTask.emit();
  }
}
