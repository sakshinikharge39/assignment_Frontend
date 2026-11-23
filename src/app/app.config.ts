import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { TaskRepository } from './core/repositories/task.repository';
import { MockTaskApi } from './core/repositories/mock-task-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: TaskRepository,
      useExisting: MockTaskApi
    }
  ]
};
