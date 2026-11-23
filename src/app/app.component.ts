import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStore } from './core/store/task.store';
import { Task } from './core/models/task.model';
import { ToastService } from './core/services/toast.service';
import { HeaderComponent } from './components/header/header.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FilterBarComponent,
    TaskListComponent,
    TaskDetailComponent,
    TaskFormComponent,
    ToastComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly store = inject(TaskStore);
  readonly toast = inject(ToastService);

  readonly counts = this.store.counts;
  readonly selectedTask = this.store.selectedTask;

  // Modals state
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly editingTask = signal<Task | null>(null);

  // Quick overdue alert computed
  readonly overdueNotice = computed(() => {
    const overdueCount = this.counts().overdue;
    if (overdueCount === 0) return null;
    return `${overdueCount} ${overdueCount === 1 ? 'task requires' : 'tasks require'} immediate attention (overdue)`;
  });

  openCreateModal(): void {
    this.editingTask.set(null);
    this.isCreateModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isCreateModalOpen.set(false);
    this.editingTask.set(null);
  }

  onSelectTask(id: string): void {
    this.store.selectTask(id);
  }

  closeDetailDrawer(): void {
    this.store.selectTask(null);
  }

  onEditTask(task: Task): void {
    this.store.selectTask(null);
    this.editingTask.set(task);
    this.isCreateModalOpen.set(true);
  }

  onFormSaved(task: Task): void {
    const wasEditing = !!this.editingTask();
    this.closeFormModal();
    if (wasEditing) {
      this.toast.success('Task Updated', `"${task.title}" has been updated.`);
    } else {
      this.toast.success('Task Created', `"${task.title}" has been created.`);
    }
  }

  filterForOverdue(): void {
    this.store.setFilter('overdue');
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isCreateModalOpen()) {
      this.closeFormModal();
    } else if (this.selectedTask()) {
      this.closeDetailDrawer();
    }
  }
}
