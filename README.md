# Personal Task Planner — Angular 19 Responsive Application

> **Company**: Comzent Technologies  
> **Assignment**: UI/UX + Angular Developer Assignment  
> **Tech Stack**: Angular 19.2.0 (Standalone Components, Signals, Reactive Forms), TypeScript 5.7, Plain CSS, Jasmine/Karma  
> **Typography**: Times New Roman, Times, serif (global typography)  

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18.x, v20.x, or v22+)
- npm (v9+ or v10+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run development server (serves at http://localhost:4200/)
npm start

# 3. Run all unit tests (Chrome Headless)
npm test -- --watch=false --browsers=ChromeHeadless

# 4. Production build
npm run build
```

---

## 📁 Component File Structure

Every component strictly contains all four individual files:
1. `*.component.html` (Template markup)
2. `*.component.css` (Component styling & responsive CSS tokens)
3. `*.component.ts` (Component TypeScript logic)
4. `*.component.spec.ts` (Component unit tests)

```
src/app/
├── app.component.html
├── app.component.css
├── app.component.spec.ts
├── app.component.ts
├── app.config.ts
├── app.routes.ts
│
├── components/
│   ├── header/
│   │   ├── header.component.html
│   │   ├── header.component.css
│   │   ├── header.component.spec.ts
│   │   └── header.component.ts
│   ├── filter-bar/
│   │   ├── filter-bar.component.html
│   │   ├── filter-bar.component.css
│   │   ├── filter-bar.component.spec.ts
│   │   └── filter-bar.component.ts
│   ├── task-card/
│   │   ├── task-card.component.html
│   │   ├── task-card.component.css
│   │   ├── task-card.component.spec.ts
│   │   └── task-card.component.ts
│   ├── task-detail/
│   │   ├── task-detail.component.html
│   │   ├── task-detail.component.css
│   │   ├── task-detail.component.spec.ts
│   │   └── task-detail.component.ts
│   ├── task-form/
│   │   ├── task-form.component.html
│   │   ├── task-form.component.css
│   │   ├── task-form.component.spec.ts
│   │   └── task-form.component.ts
│   ├── task-list/
│   │   ├── task-list.component.html
│   │   ├── task-list.component.css
│   │   ├── task-list.component.spec.ts
│   │   └── task-list.component.ts
│   └── toast/
│       ├── toast.component.html
│       ├── toast.component.css
│       ├── toast.component.spec.ts
│       └── toast.component.ts
│
└── core/
    ├── models/
    │   └── task.model.ts
    ├── repositories/
    │   ├── task.repository.ts
    │   ├── mock-task-api.service.ts
    │   └── mock-task-api.service.spec.ts
    ├── services/
    │   └── toast.service.ts
    ├── store/
    │   ├── task.store.ts
    │   └── task.store.spec.ts
    ├── utils/
    │   ├── task.utils.ts
    │   └── task.utils.spec.ts
    └── validators/
        ├── task.validators.ts
        └── task.validators.spec.ts
```

---

## 🏛 Angular Architecture (What Reviewers Look For)

### 1. Task Model and Types
* `TaskPriority`: `'Low' | 'Medium' | 'High'` (union type).
* `TaskStatus`: `'Todo' | 'In Progress' | 'Done'` (union type).
* `dueDate`: Stored as an ISO date string (`YYYY-MM-DD`) using local calendar extraction. This eliminates date-shift timezone bugs that occur when dates are converted between UTC and local times.

### 2. TaskRepository (Abstract) → MockTaskApi (Implementation)
* **Separation of Concerns**: `TaskRepository` defines an abstract contract (`getTasks`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`, `setFailNextSave`, `resetToDefault`).
* **Implementation (`MockTaskApi`)**:
  * Asynchronous methods simulating realistic network latency using RxJS `delay(400)`.
  * Initial seed data with dynamic relative dates (guaranteeing overdue tasks are always visible).
  * `localStorage` persistence across page reloads and app restarts.
  * `failNextSave` boolean flag toggled directly via the prominent UI switch in the header.
* Configured in `app.config.ts`:
  ```typescript
  { provide: TaskRepository, useExisting: MockTaskApi }
  ```

### 3. TaskStore (Angular Signals)
* Utilizes modern Angular Signals (`signal`, `computed`).
* State Signals: `tasks`, `filter`, `searchQuery`, `sortField`, `sortDirection`, `selectedTaskId`, `loading`, `saving`, `error`, `failNextSave`.
* Computed Signals:
  * `filteredTasks`: High-performance memoized list reacting automatically to filter, search query, and sort changes.
  * `counts`: Total, Overdue, Todo, In Progress, Done.
  * `selectedTask`: Finds currently selected task for master-detail view.

### 4. Pure `isOverdue(task, today)` Function
* Located in `src/app/core/utils/task.utils.ts`:
  ```typescript
  export function isOverdue(task: Pick<Task, 'status' | 'dueDate'>, today: string): boolean {
    if (!task.dueDate) return false;
    if (task.status === 'Done') return false;
    return task.dueDate < today;
  }
  ```
* Pure, deterministic, and trivially testable with zero dependencies. Overdue means `status !== 'Done'` and `dueDate < today`.

### 5. Reactive Form with Custom Trimmed Validators
* Reactive form with controls: `title`, `description`, `priority`, `dueDate`, `status`.
* Custom Trimmed Validators (`src/app/core/validators/task.validators.ts`):
  * `trimmedRequiredValidator()`: Ensures whitespace-only titles (e.g. `"   "`) fail validation.
  * `trimmedMinLengthValidator(3)`: Trims whitespace before validating minimum character length.
  * `trimmedMaxLengthValidator(120)`: Validates maximum length.
* Real-time character counter (`35 / 120`) with visual threshold warnings.

### 6. Duplicate-Save Prevention
* A reactive `saving` signal disables the submit button and renders an inline spinning indicator.
* **Code Guard**: Both `TaskStore.createTask()` / `updateTask()` and `TaskFormComponent.onSubmit()` enforce:
  ```typescript
  if (this.saving()) {
    return; // Disables concurrent triggers from shortcuts or rapid clicks
  }
  ```

### 7. Failed-Save Recovery
* When save fails (e.g., when the visible "Simulate Save Failure" switch is enabled):
  1. The form modal is **NOT** closed.
  2. The form controls are **NOT** reset.
  3. All user-entered text (`title`, `description`, `priority`, `dueDate`) is fully preserved.
  4. An inline alert renders inside the modal with the error message and an immediate `🔄 Retry Save` button.
  5. The form only closes and resets on verified save success.

### 8. Status Transitions
* Governed by a strict lifecycle transition map (`STATUS_TRANSITIONS`):
  * `Todo` → `In Progress`
  * `In Progress` → `Done`
  * `Done` → `Todo` (Reopened)
* Rather than free-form assignment, users advance tasks logically with single-click actions and stepper visualizations.

---

## 🧪 Comprehensive Test Suite (61 Tests Passing)

All 61 focused unit tests run cleanly in headless Chrome:
```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

### Covered Test Specs:
1. **Validation Tests (`task.validators.spec.ts` & `task-form.component.spec.ts`)**:
   - Rejection of null, undefined, and empty titles.
   - Rejection of whitespace-only strings (`"   "`).
   - Rejection of titles with fewer than 3 characters after trimming.
   - Acceptance of valid titles (3 to 120 characters).
   - Character count bounds.
2. **Overdue Calculation Tests (`task.utils.spec.ts`)**:
   - Status 'Todo' + past date → `true`.
   - Status 'In Progress' + past date → `true`.
   - Status 'Done' + past date → `false` (completed tasks are never overdue).
   - Due date equal to today → `false`.
   - Due date in future → `false`.
   - Missing due date → `false`.
3. **Failed-Save Recovery Tests (`task-form.component.spec.ts` & `mock-task-api.service.spec.ts`)**:
   - Preservation of entered form values on error.
   - Visibility of error alert.
   - Successful retry execution upon disabling failure mode.
4. **Duplicate-Save Prevention Tests (`task.store.spec.ts` & `task-form.component.spec.ts`)**:
   - Code guard rejects concurrent save invocations.
   - Submit button disabled while saving.
5. **Status Transition & Priority Tests (`task.store.spec.ts`, `task-detail.component.spec.ts`)**:
   - `Todo` → `In Progress` → `Done` → `Todo`.
   - Direct priority update with store state sync.

---

## 📱 Responsive UI & Accessibility (All Screens)

| Breakpoint | Viewport | UX Adaptations |
| :--- | :--- | :--- |
| **Mobile** | `< 768px` | Floating Action Button (FAB) for thumb access; horizontal scrollable filter chips; full-width touch targets (min 48px); slide-up bottom sheet modal. |
| **Tablet** | `768px – 1023px` | Adaptive 2-column card grid; condensed metrics pills; responsive drawer panel. |
| **Desktop** | `≥ 1024px` | 3-column grid; slide-over review drawer; persistent header metrics; keyboard shortcuts (`Esc` closes modals). |

### Accessibility Features (WCAG AA & AAA):
- **Cues Beyond Color**:
  - High Priority: Crimson + `▲` arrow icon.
  - Medium Priority: Amber + `■` square icon.
  - Low Priority: Slate + `▼` arrow icon.
  - Overdue: Warning badge + `⚠️` icon + relative days count.
  - Status: Distinct icons (`○` Todo, `◐` In Progress, `✓` Done).
- **Keyboard Navigation**:
  - Visible focus rings (`:focus-visible: 2px solid #4f46e5`).
  - Full tab order and `Esc` key modal dismissal.
  - Accessible ARIA attributes (`role="switch"`, `aria-checked`, `role="alert"`, `aria-modal="true"`).

---

## 📋 Required User Journey Walkthrough

To verify the required user journey:
1. **Open Planner**: Observe seeded tasks, header metrics, and the overdue callout banner.
2. **Filter for Overdue Work**: Click the `⚠️ Overdue` filter chip. The list filters instantly to show only overdue tasks.
3. **Review a Task**: Click on an overdue task card. The slide-over detail drawer opens.
4. **Change Priority**: Click the `Medium` or `High` priority chip in the drawer. Notice immediate persistence.
5. **Start Task**: Click `▶ Start Task (Move to In Progress)`. The status updates to In Progress.
6. **Create Another Task**: Click `+ New Task` (in the header or mobile FAB).
7. **Simulate Failed Save**:
   - Toggle **Simulate Save Failure** in the header to **ON**.
   - Type a title (e.g., *"Refactor caching layer"*), description, and priority.
   - Click `Create Task`.
   - The save fails; an inline alert banner appears with a `Retry Save` button. Notice the form stays open and text is preserved.
8. **Retry and Succeed**:
   - Toggle **Simulate Save Failure** to **OFF** (or click "Disable Failure Mode" in the red top banner).
   - Click `🔄 Retry Save`.
   - The task saves successfully, a green toast notification confirms the addition, and the new task is shown in the list.

---

## ⏱ Submission Details

- **Time Spent**: ~4 hours (Architecture & Models: 45 min, Repository & Signals Store: 45 min, Components & Responsive SCSS: 1.5 hr, Tests & Error Recovery: 45 min, Design Specs & Docs: 30 min).
- **Assumptions**: 
  - Date comparisons use local calendar `YYYY-MM-DD` strings to prevent UTC midnight date shift.
  - Tasks without due dates are sorted after tasks with due dates.
- **Templates / AI Tools Used**:
  - Google DeepMind Antigravity pair programmer for scaffolding and unit test coverage.
