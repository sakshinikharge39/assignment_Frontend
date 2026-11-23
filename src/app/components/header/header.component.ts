import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStore } from '../../core/store/task.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly store = inject(TaskStore);

  readonly counts = this.store.counts;
  readonly failNextSave = this.store.failNextSave;

  toggleFailureSimulation(): void {
    const nextState = !this.failNextSave();
    this.store.setFailNextSave(nextState);
  }

  onResetData(): void {
    if (confirm('Reset task planner to default seeded tasks?')) {
      this.store.resetToDefault();
    }
  }
}
