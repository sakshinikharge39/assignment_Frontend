import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskFilter, TaskSortField } from '../../core/models/task.model';
import { TaskStore } from '../../core/store/task.store';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css'],
})
export class FilterBarComponent {
  readonly store = inject(TaskStore);

  readonly currentFilter = this.store.filter;
  readonly counts = this.store.counts;
  readonly sortField = this.store.sortField;
  readonly sortDirection = this.store.sortDirection;
  readonly searchQuery = this.store.searchQuery;

  readonly filterTabs: { id: TaskFilter; label: string; icon?: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'overdue', label: 'Overdue', icon: '⚠️' },
    { id: 'todo', label: 'Todo' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ];

  onSelectFilter(filter: TaskFilter): void {
    this.store.setFilter(filter);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.setSearchQuery('');
  }

  onSortChange(event: Event): void {
    const field = (event.target as HTMLSelectElement).value as TaskSortField;
    this.store.setSort(field);
  }

  toggleSortDirection(): void {
    this.store.setSort(this.sortField());
  }

  getBadgeCount(filter: TaskFilter): number {
    const c = this.counts();
    switch (filter) {
      case 'all':
        return c.total;
      case 'overdue':
        return c.overdue;
      case 'todo':
        return c.todo;
      case 'in-progress':
        return c.inProgress;
      case 'done':
        return c.done;
    }
  }
}
